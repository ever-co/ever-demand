# Flutter toolchain image for packages/shop-mobile-flutter.
#
# ghcr.io/cirruslabs/flutter stopped publishing version tags at 3.44.0 (its
# `stable` tag is still 3.44.0), so this image starts from it for the Android
# SDK, JDK and Linux build deps, and moves the bundled Flutter SDK (a shallow
# git clone at /sdks/flutter) to the current stable release.
#
# Build:  docker build -t ever-demand-flutter:3.50.1 tool/docker
# Bump:   docker build --build-arg FLUTTER_VERSION=<x.y.z> -t ever-demand-flutter:<x.y.z> tool/docker
ARG BASE_IMAGE=ghcr.io/cirruslabs/flutter:3.44.0
FROM ${BASE_IMAGE}

ARG FLUTTER_VERSION=3.50.1

RUN git config --global --add safe.directory /sdks/flutter \
 && cd /sdks/flutter \
 && git fetch --depth 1 --no-tags origin "refs/tags/${FLUTTER_VERSION}:refs/tags/${FLUTTER_VERSION}" \
 && git checkout -q -f -B stable "${FLUTTER_VERSION}" \
 && flutter config --no-analytics --no-cli-animations \
 && flutter --version \
 && flutter precache --android --web --no-ios --no-linux --no-windows --no-macos --no-fuchsia \
 && dart --disable-analytics

# Informational only: the image has no iOS or desktop toolchains.
RUN flutter doctor -v || true

ENV FLUTTER_VERSION=${FLUTTER_VERSION} \
    PUB_CACHE=/root/.pub-cache \
    GRADLE_USER_HOME=/root/.gradle
