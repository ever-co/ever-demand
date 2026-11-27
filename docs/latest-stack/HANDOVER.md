# Ever Demand latest-stack upgrade: handover

Last updated: 2026-11-27 ~20:45 CET by the lead session ("Ever Demand platform modernization").
Keep this file current. Update it after every merge or milestone, then commit and push.

## Current state (2026-11-27)

- **Everything is merged and ever-co/ever-demand has 0 open PRs.** develop is `40ec460f`.
- **Merged PRs:**
  - **#1660:** the latest stack.
  - **#1668:** multi-tenant SaaS: tenants, isolation, signup, Stripe Billing. Design and follow-ups are in
    `docs/multi-tenant/DESIGN.md` and `docs/multi-tenant/HANDOVER.md`.
  - **#1669:** admin and merchant smart-table crash.
  - **#1670, #1671, #1672:** fleet fixes for core stock counts, the product feed count and carrier i18n.
- **Review of #1668:** CodeRabbit could not review it (over its file limit), so an independent agent reviewed it
  in three rounds. Every high and medium finding is fixed and has tests: field-resolver access, stale store and
  carrier tokens, login operator injection, the super-admin email takeover, the login-throttle lockout and the
  device channel hijack.
- **Deploying multi-tenant:**
  - On a production database with existing records, migration 0001 refuses to start, before it writes anything
    (the default tenant included), until a `mongodump` is taken and `MIGRATION_BACKUP_CONFIRMED=true` is set.
  - `TRUST_PROXY` defaults to `loopback, uniquelocal`; add a CDN's ranges if one sits in front of the ingress.
  - `SUPER_ADMIN_EMAIL` names the platform super-admin. It is set at boot. An admin who has the default
    password at startup is not made super-admin. If the password is changed to the default while the API
    runs, the admin keeps super-admin until the next restart.
- **Still open:**
  - Android APK builds have not been verified, because the GitHub CI workflow is disabled by owner policy.
  - iOS needs a Mac: shop and merchant need `npx cap sync ios` and a committed Podfile.lock, and carrier
    needs Package.resolved.
  - The app icon is a placeholder.
  - Codacy flags style-only notes on large PRs (markdownlint line length, ESLint 8 false positives on
    TypeScript parameter properties).
  - The multi-tenant low-severity follow-ups are listed in `docs/multi-tenant/HANDOVER.md`.
- **Below:** the history of the upgrade (lanes, worktrees, merges). The lane worktrees are removed.

## Goal (owner)

Move every package to the newest versions (Node, Nest, GraphQL, Ionic, Angular, ...). The platform must
behave approximately as before. The Flutter and React Native apps must match the Ionic shop app's
features. Write plenty of unit and e2e tests and make everything work. Then bring the open PRs on
ever-co/ever-demand down to zero by merging or closing each one.

Owner rules from this session:
- **No PM2** anywhere (license). Run Node the way Ever Gauzy's Docker images do: an `entrypoint.prod.sh`
  that does `exec "$@"`, then `CMD ["node", "..."]`, or nginx for the web apps.
- **No secrets in the repo or the images.** They come from env vars (GitHub secrets, OpenBao, k8s Secret).
- Commit, push and merge often, and keep this handover updated.

## Branches and worktrees

| Branch | Worktree (`C:\Coding\Worktrees\...`) | State |
| --- | --- | --- |
| `feat/latest-stack` (integration) | `ever-demand-latest-stack` | foundation + merged lanes, pushed |
| `feat/latest-stack-core` | `ever-demand-core` | **squash-merged** (`7d4a189b`); remote branch deleted |
| `feat/latest-stack-expo` | `ever-demand-expo` | merged |
| `feat/latest-stack-shop-web` | `ever-demand-shop-web` | merged (Angular shop + Gatsby) |
| `feat/latest-stack-shop-mobile` | `ever-demand-shop-mobile` | merged |
| `feat/latest-stack-admin` | `ever-demand-admin` | merged |
| `feat/latest-stack-carrier-merchant` | `ever-demand-carrier-merchant` | merged |
| `feat/latest-stack-flutter` | `ever-demand-flutter` | merged (APK build not finished on this PC: RAM) |

The main clone is `C:\Coding\ever-demand`. The lane contract is in `docs/latest-stack/CONTRACT.md`; each
lane's notes are in `docs/latest-stack/<lane>.md`.

To merge a lane: `git merge --no-ff origin/feat/latest-stack-<lane>`.
- Resolve `pnpm-workspace.yaml` as the union of both sides, then remove the `# - packages/x` comment lines
  for packages that are now listed.
- For `pnpm-lock.yaml`, take theirs, then run `pnpm install --no-frozen-lockfile` to regenerate it.
- Before merging, check the lane's commits for key files:
  `git log --name-only --format= e3e00b80..origin/<branch> | grep -E '\.(pem|key|...)$'`.

## Toolchain

- Node 26.13.1 is at `C:\nvm\v26.13.1`; put it first on PATH: `export PATH="/c/nvm/v26.13.1:$PATH"`. pnpm is 12.23.0.
- TypeScript is 6.0.3. TypeScript 7 is held back because Angular 22 needs `<6.1` and ts-jest needs `<7`.
- graphql is 16.15 everywhere; `@apollo/server` 5 rejects 17.
- Flutter builds run in Docker (`ghcr.io/cirruslabs/flutter`). Flutter is not installed on the PC.

## Done and verified (on `feat/latest-stack` or on the lane before merge)

| Package | Stack now | Evidence |
| --- | --- | --- |
| common | mongoose 9, typeorm 1, TS 6 | builds; 4 specs (assignRaw) |
| common-angular | Angular 22, ngx-translate 18 shim | typechecks; eager CD; `_<id>_complete` fix; assignRaw (strict-mode getter fix) |
| core API | Nest 12, @nestjs/graphql 14 + Apollo Server 5, graphql-ws, Mongoose 9, Stripe 23 (API version pinned 2020-08-27) | 590 unit specs and build on the merged branch; lane: 49 Jest API e2e, 19 Playwright API specs, Docker image healthy |
| shop-mobile-expo | Expo 58, RN 0.88, React 19.3, Apollo 4 | 161 Jest specs and tsc on the merged branch; lane: web and android export, 11 Playwright e2e |
| shop-web-angular | Angular 22, Material 22 | lane: 112 Vitest specs, prod build, 15/15 Playwright e2e against the API |
| shop-web-gatsby | Gatsby 5.16, React 19.3, MUI 9 | lane: 44 Vitest specs, `gatsby build` |
| shop-mobile-ionic | Angular 22, Ionic 9, Capacitor 8 | lane: 201 Vitest specs (all 84 old Karma specs ported), prod build, 14 Playwright e2e passed + 1 skipped, Docker image serves |
| admin-web-angular | Angular 22, Nebular 17 (pnpm patch for CDK 22), ng-bootstrap 21 | lane: 82 Vitest specs, prod build, 27/28 Playwright e2e (1 needs a Google Maps key) |

Security work (owner request, `76b4ca83`):
- No committed keys exist in the develop history or in any lane branch. The one exception was a
  throwaway localhost cert in the deleted core-lane branch.
- Production now refuses to start with a missing or well-known `JWT_SECRET` or `EXPRESS_SESSION_SECRET`.
- GraphQL debug was always on in production (`env.isProd` was read from a literal env var). Fixed.
- The first admin is configurable through `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- The API Dockerfile no longer bakes secrets in as build ARG/ENV.

## Still to do (in order)

1. ~~Lanes~~ all 7 merged (2026-11-26). Flutter: analyze clean, 191 tests, integration + live API e2e, web build; `flutter build apk --debug` still to run on a machine with more RAM (`packages/shop-mobile-flutter/tool/docker-test.sh build-apk`). Carrier 61 + merchant 40 Vitest, 8/8 e2e each.
2. ~~Merge develop~~ done up to 3f32202a (#1655 + T-2806); keep merging new fleet PRs before the upgrade PR merges. **Merge `origin/develop`** into `feat/latest-stack` and port the fleet fixes merged after the base
   `abd39940`:
   - #1655 (core: refund a lost charge when the unpaid order is cancelled);
   - T-2805 (shop start language);
   - T-2806 (Pay buttons with no Stripe key);
   - T-2807 ("already paid" message: core OrdersService, common IOrderRouter, payment.component.ts);
   - any later ones.
   The fleet merge-lane session ("Ever Works") agreed to send code-only PRs meanwhile.
3. **Integration (in progress, 2026-11-26 ~03:30 CET).** All lanes and develop are merged (`16d1fa4d`).
   The first full sweep found three cross-lane breaks; all are fixed in `16d1fa4d`:
   - `@angular/localize` had to be added as a dev dependency of every Angular app;
   - `packageExtensions` makes ionic-selectable use the app's ionicons;
   - develop's Jasmine payment specs are ported to Vitest.

   **Second sweep: 31/31 pass** (frozen install, then typecheck, test and build for all 10 packages).
   **e2e against the merged-branch API** (production builds served by `e2e/serve-apps.mjs`):

   | Project | Result |
   | --- | --- |
   | api | 19/19 |
   | admin | 27 passed, 1 skipped (needs a Google Maps key) |
   | shop-web | 15/15 |
   | shop-mobile | 14 passed, 1 skipped (runs only while the API is down) |
   | merchant | 8/8 |
   | carrier | 8/8 |
   | shop-expo | 11/11 |

   The merged API ran from `packages/core/build` with `DB_NAME=ever_e2e` on mongo :27018 (now stopped).
   The core API e2e suite (Jest, 49 tests) passes on the merged branch.

   **Docker images built and served:**
   - merchant (`/`, deep link, i18n);
   - admin (placeholders replaced at start, about 20 s of `sed`).

   Earlier, in the lanes: api, shop-web, shop-mobile, expo and carrier.

4. **PR [ever-co/ever-demand#1660](https://github.com/ever-co/ever-demand/pull/1660) is open** (`feat/latest-stack` → `develop`).
   - **Review findings:** the Ever Works AI review, Socket and SonarCloud findings are answered in a PR
     comment. The fixes are in `7c0d749b`: path-traversal guard, SHA-pinned actions, `patches/` in the
     Dockerfiles, `chmod 644`.
   - **First CI run:** three failures, fixed in `cf62f50a`:
     - the e2e package was included in the root `test` script;
     - core's `test/e2e/sequencer.js` was ignored by git;
     - the APK step had no Android SDK.
   - **Next:** watch the CI re-run. Greptile was still pending. CodeRabbit and cubic skipped the PR
     (too large); review any later bot threads.
   - **Merge needs the owner:** branch protection requires an approving review, and the CLA check is pending.
   - **Second develop merge (`1fd7bbd5`):** brings in #1658, #1659 and #1663 (card-form retry), ported:
     - the start language reads the phone language through `NativeService`;
     - the specs are moved to Vitest;
     - restore spies and the `Store.deviceId` descriptor after each test (Vitest does not, Jasmine did).

     Results: shop-mobile 38/38 test files, prod build OK; core 608/608. Keep merging new fleet PRs
     before the upgrade merges.
   - **Parallel work (2026-11-26, owner asked to go faster):**
     - `feat/latest-stack-ci-fix`: upload the CI artifact only on failure (the org artifact quota was
       hit); make the Expo tests robust on slow runners; give the Flutter job more time and a Gradle cache.
     - `feat/latest-stack-app-ids`: Flutter app id `co.ever.customer.fl`, Expo
       `co.ever.customer.rn`. The Ionic app keeps `co.ever.customer`; carrier and merchant are
       unchanged.

     **Both merged** (`857cc25c`, `9a3588cb`). CI changes:
     - the report artifact is uploaded only on failure;
     - the Node job skips the Expo suite, which the Expo job runs;
     - Expo testTimeout is 30 s and the waitFor limit 10 s;
     - the Flutter job has a 90 min limit and a Gradle cache.

     The CI re-run on `9a3588cb` is the first run of these changes. The Android SDK/NDK download
     (about 7 min) is not cached yet.
   - **Auto-fix for the PR:** the app could not match the repo to this session's folder. The owner can
     link it from the PR bar ("Linked by Claude").

   Earlier plan for this step:
   The merchant and admin Docker image builds were in progress at this point. Next: swap in the merged-branch API, serve
   the builds with `node e2e/serve-apps.mjs`, run every Playwright project, then build the admin and
   merchant Docker images.

   Earlier plan for this step: `pnpm install --frozen-lockfile`, `pnpm -r typecheck/test/build`. Boot the API (the
   core worktree's API is still running on 5500/8443/2086, PID in `docs/latest-stack/core.md`) and run
   every Playwright project. Playwright 1.65 needs `npx playwright install chromium` (the PC has an
   older build).
4. **CI:**
   - Finalise `.github/workflows/ci.yml` (script names, Flutter job per the Flutter lane).
   - Update `docker-build-publish.yml` if any image path changed.
   - Check every `.deploy/*/Dockerfile`: no PM2, no secret ARGs.
5. **Docs:** README (pnpm, Node 26, how to run each app, no PM2 mention), a summary of the lane notes.
6. **PR:** `feat/latest-stack` into `develop`. Handle every AI-bot thread (AI-review rule).
7. **Open PRs on ever-co/ever-demand:** take them to 0. On 2026-11-26 I closed 17, each with a reason:
   - the 10 yarn-era dependabot bumps, which the new lockfile versions supersede;
   - Crowdin #1513, already applied;
   - the fork release branches #1291 and #1262;
   - the stale drafts #1130, #1081, #705 and #639.

   Two are left: **#1218** (carrier orders list) and **#1253** (carriers not showing in merchant). The
   carrier + merchant lane is checking whether to port them. Close each with its verdict, then deal with
   the upgrade PR itself.


## 2026-11-26 afternoon: owner follow-ups merged into #1660

- **App ids:**
  - Ionic shop: `co.ever.customer`
  - Flutter: `co.ever.customer.fl`
  - Expo: `co.ever.customer.rn`

  Carrier (`co.ever.carrier`) and merchant (`co.ever.merchant`) are unchanged.
- **Standalone Ionic** in the shop, carrier and merchant apps:
  - no `IonicModule`, no `@ionic/angular/lazy`;
  - `provideIonicAngular()`, and every icon registered with `addIcons`;
  - merchant page modules provide their own `ModalController` and `PopoverController`.
- **Stripe:** the shop pays new cards with a Stripe.js Card Element instead of the legacy `checkout.js`. It makes the same card token, so the server is unchanged.
- **Native Capacitor projects** (android/ and ios/) are committed for all three Ionic apps.
  - A CI `android` job builds their debug APKs.
  - Needs a Mac: shop and merchant need `npx cap sync ios` once to create the Podfile.lock; carrier needs its Package.resolved committed from Xcode.
- **develop merged twice more** (fleet language fixes). Their Jasmine specs are ported to Vitest. My codemod was `scratchpad/jasmine-to-vitest.mjs`, and it is not committed.
- **Fixes found on the way:**
  - Hebrew page direction (ngx-translate 18 changes the current language only after its file loads);
  - four GraphQL reads crashed when the API was down (Apollo 4 resolves with data undefined).
- **Verification on 8a258627:**
  - Playwright, every project against the merged API: api 19, admin 27 (+1 skipped), shop-web 15, shop-mobile 14 (+1 skipped), merchant 8, carrier 8, expo 11.
  - core unit tests: 613/613.
  - The full package sweep was re-run before merging.
- **GitHub Actions:** the `CI` workflow (with CodeQL, Docker publish and the DO deploy) is **disabled manually** on GitHub. That is the owner policy: public repos keep workflow files but run nothing on GitHub. So #1660 has no CI run after 8ce3403a, and the local sweep and e2e are the evidence.
- **Merging #1660:**
  - develop requires 1 approving review, and the PR author is the owner account. The owner asked for the merge, so it is merged with `gh pr merge --admin` (enforce_admins is off), as a merge commit.
  - The internal ci-builds (Argo) then builds the develop images.
- **Multi-tenant SaaS:** a separate session is working on it (owner: customers per tenant, a storefront per tenant, tenant resolution by subdomain, header *and* white-label build).

## Known follow-ups and caveats

- Lane worktrees under `C:\Coding\Worktrees\ever-demand-*` (except `-latest-stack`) are merged.
  Remove them with `cmd //c rd /s /q <dir>` plus `git worktree prune`. Do not use `git worktree remove`:
  it follows node_modules junctions.

- ~~Choose the store application ids of the Flutter and React Native shop apps~~ done
  (`feat/latest-stack-app-ids`): the three shop apps can be published side by side.

  | App | Store id |
  | --- | --- |
  | Ionic shop | `co.ever.customer` (unchanged) |
  | Flutter shop | `co.ever.customer.fl` (was the template `com.example.shop_flutter_mobile`) |
  | React Native / Expo shop | `co.ever.customer.rn` (was `co.ever.shop.expo`) |
  | Carrier / merchant | `co.ever.carrier` / `co.ever.merchant` (unchanged) |

  Details: `shop-mobile-flutter.md` and `shop-mobile-expo.md`, section "Store application ids".
- The common-angular Google Maps loader never resolves without network access to Google. Admin added
  its own server-down fallback; the other apps should get one too.
- Admin: ionicons stays on 4.6.3, because the templates use `ion-md-*` classes. Google's Drawing library
  is deprecated, and the delivery-zone editor still uses it.
- shop-mobile-ionic: still uses `IonicModule` (deprecated in Ionic 9) and Stripe's legacy `checkout.js`.
- Expo: native modules stay on the versions Expo SDK 58 pins. The web build has no map (react-native-maps
  has no web support).
- The shared PC has little free RAM. A RAM monitor drops the Docker VM page cache when free memory falls
  under 1 GB.
