#!/usr/bin/env bash
# CI-friendly checks for packages/shop-mobile-flutter, in Docker (no local
# Flutter needed): flutter analyze, flutter test, the integration tests run
# headless on the flutter tester, flutter build web --release,
# flutter build apk --debug.
#
#   tool/docker-test.sh                          # all steps
#   tool/docker-test.sh analyze test             # some steps
#   STEPS: analyze test integration build-web build-apk
#
# The repo is mounted read-only and copied into the container (bind mounts
# from Windows are slow for Gradle and the analyzer). Results land in
# tool/out/ (git-ignored): *.txt logs, web.tar.gz, app-debug.apk.
# Caches live in named volumes: ever-flutter-pub-cache, ever-flutter-gradle,
# ever-flutter-android-sdk. Gradle is capped at 2.5 GB heap for shared PCs.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG="$(cd "$HERE/.." && pwd)"
REPO="$(cd "$PKG/../.." && pwd)"
FLUTTER_VERSION="${FLUTTER_VERSION:-3.50.1}"
IMAGE="${FLUTTER_IMAGE:-ever-demand-flutter:$FLUTTER_VERSION}"
STEPS="${*:-analyze test integration build-web build-apk}"
OUT="$PKG/tool/out"
mkdir -p "$OUT"

# Docker Desktop on Windows (Git Bash) wants C:/... paths.
host_path() { if command -v cygpath >/dev/null 2>&1; then cygpath -m "$1"; else printf '%s' "$1"; fi; }

if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
  docker build --build-arg "FLUTTER_VERSION=$FLUTTER_VERSION" -t "$IMAGE" "$(host_path "$HERE/docker")"
fi

MSYS_NO_PATHCONV=1 docker run --rm \
  --memory "${DOCKER_MEMORY:-6g}" \
  -v "$(host_path "$REPO"):/src:ro" \
  -v "$(host_path "$OUT"):/out" \
  -v ever-flutter-pub-cache:/root/.pub-cache \
  -v ever-flutter-gradle:/root/.gradle \
  -v ever-flutter-android-sdk:/opt/android-sdk-linux \
  -e "STEPS=$STEPS" \
  -e "FLUTTER_TEST_CONCURRENCY=${FLUTTER_TEST_CONCURRENCY:-2}" \
  "$IMAGE" bash -c '
set -euo pipefail
W=/work/packages/shop-mobile-flutter
mkdir -p "$W" /work/packages/core/src
# The GraphQL schema, for test/unit/graphql_documents_test.dart.
cp -r /src/packages/core/src/graphql /work/packages/core/src/
tar -C /src/packages/shop-mobile-flutter \
  --exclude=./build --exclude=./.dart_tool --exclude=./android/.gradle \
  --exclude=./tool/out -cf - . | tar -C "$W" -xf -
cd "$W"
cat > /root/.gradle/gradle.properties <<EOF
org.gradle.jvmargs=-Xmx2560m -XX:MaxMetaspaceSize=768m
org.gradle.daemon=false
org.gradle.workers.max=2
kotlin.daemon.jvmargs=-Xmx1g
EOF
flutter --version 2>&1 | tee /out/flutter-version.txt
flutter pub get 2>&1 | tail -3
status=0
for step in $STEPS; do
  echo "=== $step"
  case "$step" in
    analyze) flutter analyze 2>&1 | tee /out/analyze.txt || status=1 ;;
    test) flutter test --concurrency="$FLUTTER_TEST_CONCURRENCY" test 2>&1 | tee /out/test.txt | grep -E "^[0-9:]+ \+[0-9]+.*(All tests passed|Some tests failed)|\[E\]|Expected|Actual" || true
          grep -q "All tests passed" /out/test.txt || status=1 ;;
    # `flutter test integration_test` needs a device (the image has none).
    # Headless: run the same test files on the flutter tester through
    # wrappers outside integration_test/ (IntegrationTestWidgetsFlutterBinding
    # works there; it skips native result reporting).
    integration)
          mkdir -p integration_headless
          for f in integration_test/*_test.dart; do
            n=$(basename "$f")
            echo "import \"../integration_test/$n\" as t; void main() => t.main();" > "integration_headless/$n"
          done
          flutter test --dart-define=INTEGRATION_TEST_SHOULD_REPORT_RESULTS_TO_NATIVE=false integration_headless 2>&1 | tee /out/integration.txt | tail -5
          grep -q "All tests passed" /out/integration.txt || status=1 ;;
    build-web) flutter build web --release 2>&1 | tee /out/build-web.txt | tail -5
          tar -C build -czf /out/web.tar.gz web || status=1 ;;
    build-apk) flutter build apk --debug 2>&1 | tee /out/build-apk.txt | tail -5
          cp build/app/outputs/flutter-apk/app-debug.apk /out/ || status=1 ;;
    *) echo "unknown step $step"; status=1 ;;
  esac
done
exit $status
'
