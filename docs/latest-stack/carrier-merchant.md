# Carrier + merchant lane: latest-stack notes

Branch `feat/latest-stack-carrier-merchant`, cut from `feat/latest-stack` at `e3e00b80`.
Packages: `packages/carrier-mobile-ionic` (courier app) and `packages/merchant-tablet-ionic`
(store tablet app). Both joined `pnpm-workspace.yaml`.

## Versions

| Area | Before | Now |
| --- | --- | --- |
| Angular | 13.1 (webpack, `@angular-builders/custom-webpack`) | 22.3.0, `@angular/build` (esbuild + Vite dev server + Vitest) |
| Ionic | `@ionic/angular` 5.8 | 9.0.14, NgModule `IonicModule` from `@ionic/angular/lazy` |
| Native runtime | Cordova 10 + `@ionic-native/*` 5.36 | Capacitor 8.6.3 (`@capacitor/core`, `cli`, `android`, `ios`) |
| ionicons | 5.5 | 8.1.1 |
| GraphQL client | `@apollo/client` 3.5, `apollo-angular` 2.6, `graphql` 15.7 | `@apollo/client` 4.3.8, `apollo-angular` 14.2.0, `graphql` ^16.15.0, `graphql-ws` 6.4.3 |
| i18n | `@ngx-translate/core` 13 | 18.1.0 through the common-angular `TranslateModule` shim, `provideTranslateHttpLoader` |
| socket.io client | 4.3 | 4.8.4 |
| RxJS / zone.js | 7.4 + `rxjs-compat` / 0.11 | 7.8.2 / 0.16.3 |
| TypeScript | 4.5 | ~6.0.3 |
| Tests | Karma + Jasmine (one spec per app), Protractor | Vitest 5.1.2 via `@angular/build:unit-test` (jsdom 31), Playwright e2e |
| Env generation | `ts-node` + `dotenv` + `yargs` + envalid 7 | `node scripts/configure.ts` (Node 26 type stripping), `process.loadEnvFile`, `util.parseArgs`, envalid 9.0.0 |
| Docker | `node:16-alpine3.14`, yarn 1 | `node:26-alpine`, pnpm 12.23.0, nginx |

`graphql` follows the core lane: `^16.15.0` (17.1.0 is out, but `@apollo/server` 5 rejects it).
Watch queries go through `onlyCompleteData()` (or a `data` filter) because Apollo Client 4 also
emits loading/partial results; the default error policies are declared through
`ApolloClient.DeclareDefaultOptions`.

## Angular 22 specifics

- `ng update @angular/core --migrate-only --from=21.0.0 --to=22.3.0` ran in both packages (with the
  monorepo `tsconfig.base.json` inlined for the run, because the migrations cannot read a file
  outside the Angular workspace). It set `ChangeDetectionStrategy.Eager` on every component that was
  on the old default (Angular 22 defaults to OnPush, which would freeze pages fed by socket.io,
  Apollo and timers), added `withXhr()` to `provideHttpClient`, and the extended-diagnostics
  opt-outs. Components added in this lane are `Eager` too; a spec guards the carrier pages.
- Zone.js change detection is kept: `bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()] })`.
- `APP_INITIALIZER` -> `provideAppInitializer`; Apollo through `provideApollo`; `platformBrowser()`.
- Imports that relied on `baseUrl: src` (`services/...`, `components/...`, `environments/...`) are
  now relative; tsconfig has no `baseUrl` and the contract paths only.
- Route guards stay class-based `canLoad` (still supported, deprecated in favour of `canMatch`).
- Every route redirect has `pathMatch` (Angular 22 rejects the old implicit prefix redirect).
- The dev server and Vitest resolve external packages from the app folder, so the shared code's
  runtime packages (`lodash`, `underscore`, `uuid`, `reflect-metadata`) are listed as app
  dependencies.
- `theme/variables.scss` now loads after `global.scss`: Ionic 7+ ships its default palette in
  `core.css`, which otherwise overrides the brand colours (the login page turned Ionic blue).

## Cordova / Ionic Native -> Capacitor

Every plugin sits behind an injectable wrapper in `src/services/native/` with the plugin object
behind an `InjectionToken` (`plugins.ts`), so the unit tests use fakes.

| Cordova plugin / Ionic Native | Used by | Replacement |
| --- | --- | --- |
| `cordova-plugin-geolocation` | carrier | `@capacitor/geolocation` (`CurrentPositionService`) |
| `cordova-plugin-local-notification` | carrier | `@capacitor/local-notifications` (`LocalNotificationService`; asks for permission, never throws; `led`/`vibrate` options have no Capacitor equivalent) |
| `cordova-plugin-network-information` | both | `@capacitor/network` (`NetworkStatusService`, events re-entered into the zone) |
| `cordova-plugin-device`, `cordova-plugin-globalization`, `cordova-plugin-uniquedeviceid` | both | `@capacitor/device` (`getInfo`, `getId`, `getLanguageCode`) |
| `cordova-plugin-statusbar`, `cordova-plugin-splashscreen` | both | `@capacitor/status-bar`, `@capacitor/splash-screen` (`NativeShellService`, native only) |
| `cordova-plugin-screen-orientation` | merchant | `@capacitor/screen-orientation` (landscape lock, native only) |
| `cordova-plugin-camera` | merchant | `@capacitor/camera` 8 `takePhoto` / `chooseFromGallery` (`PhotoService` returns a `File` for the uploader) |
| `phonegap-plugin-barcodescanner` | merchant | `@capacitor-mlkit/barcode-scanning` (`BarcodeScanService`, same `{ text, cancelled }` result) |
| `call-number` / `mx.ferreyra.callnumber` | merchant | `tel:` links through `@capacitor/app-launcher` (`ExternalAppsService.call`) |
| `cordova-plugin-email-composer` | merchant | `mailto:` links through `@capacitor/app-launcher` (`ExternalAppsService.email`); now also works in the browser |
| `cordova-plugin-google-analytics` | both | gtag.js, loaded only in the native app when `GOOGLE_ANALYTICS_API_KEY` is set (`AnalyticsService`) |
| `cordova-plugin-mixpanel` | both | `mixpanel-browser` (official SDK, lazy chunk), native app + `MIXPANEL_API_KEY` only |
| `cordova-plugin-intercom` | merchant (injected, never called) | removed |
| `cordova-plugin-file-transfer` | merchant (provided, never called) | removed; uploads already go through ng2-file-upload (XHR) |
| `cordova-plugin-inappbrowser` | merchant (provided, never called) | removed |
| `cordova-plugin-vibration` | carrier (provided, never called) | removed |
| `cordova-open-native-settings`, `cordova-plugin-badge`, `appavailability`, `androidx*`, `whitelist`, `ionic-webview`, `ionic-keyboard` | config only | removed (Capacitor handles webview, keyboard and allow-lists) |
| `@ionic-native/google-maps` | both (provided, never called) | removed; the maps use the Google Maps JS API through `GoogleMapsLoader` |

`capacitor.config.ts` per app: `co.ever.carrier` / `co.ever.merchant` (the old `config.xml` widget
ids), `webDir: 'www'`. The `android/` and `ios/` projects are committed, see
[Native builds](#native-builds). `config.xml`, `ionic.project`, `.io-config.json` (Ionic Pro) and the
custom webpack configs are gone.

Analytics stay native-only, as before: the Cordova plugins did nothing in the browser.

The Google Maps JS API loads at startup as before (also without a key, in Google's development
mode), but the initializer now gives up after 10 s so the apps still boot offline. The carrier map
component is a no-op while the API is missing; the merchant track popup creates its directions
objects lazily instead of at module load.

## Library replacements (merchant)

| Before | After | Notes |
| --- | --- | --- |
| `ng2-smart-table` 1.7 (dead, View Engine) | `angular2-smart-table` 4.2.0 (maintained fork, Angular 18-22) | `<angular2-smart-table>`, `Angular2SmartTableModule`, `Settings` typing. Custom renderers need `componentInitFunction` since v3: `bindViewCell()` (`components/table-components/smart-table.ts`) sets `value`/`rowData` like before. `filter: false` -> `isFilterable: false`, `valuePrepareFunction(value, cell)`, custom action HTML in `customButtonContent`, CSS classes `ng2-smart-*` -> `angular2-smart-*`. |
| `@ever-co/angular2-wizard` 0.6 | in-house `FormWizardModule` (`components/form-wizard/`) | Same selectors (`form-wizard`, `wizard-step`), inputs, outputs and Bootstrap card markup, so templates and styles are unchanged. Fixed the `#wizzardFrom` template ref typo that broke "add carrier". |
| `ngx-moment` 5 + `moment` | `amTimeAgo` pipe on `Intl.RelativeTimeFormat` (`components/time-ago.pipe.ts`) | Only `amTimeAgo` was used. |
| `ionic-selectable` 4.9 | 8.0.0 (Ionic 9 / Angular 21-22) | Standalone component imported into `TrackPageModule`, which also provides Ionic's standalone `ModalController` (the lazy `IonicModule` one is a different class). |
| `ng2-completer` 9 | removed | Never used. |
| `ng2-file-upload` 1.4 | 12.0.0 | `FileItem` needs the uploader options as third argument. |
| `ngx-masonry` 12 | 14.0.1 | Needs `@angular/animations` (kept, see held back). |
| `ngx-pagination` 5 | 6.0.3 | |
| `@ng-select/ng-select` 7 | 24.2.1 (+ `@angular/cdk` 22.3.0) | |
| `@ionic/storage` / `@ionic/storage-angular` | removed | `IonicStorageModule.forRoot()` was imported but nothing used `Storage`; the apps use `localStorage`. |
| `bootstrap` 4.6 | 5.3.9 | Spacing/float/text classes renamed (`mr-*` -> `me-*`, `float-left` -> `float-start`, ...). `.badge-pill`, `.badge-secondary` and `.form-group` get a small shim in `global.scss` because the order tables build that HTML as strings and parse it back. |
| `font-awesome` 4.7 (scss + copied fonts) | `@fortawesome/fontawesome-free` 7.3.1 (`all.min.css` + `v4-shims.min.css`) | Templates keep `fa fa-*` names through the v4 shims. |
| `qrcode`, `underscore.string`, `lodash` | latest (1.5.4, 3.3.6, 4.18.1) | |
| `@angular/service-worker` | kept (merchant registers it) | `provideServiceWorker`, production only. The carrier never registered its worker, so it was dropped there. |
| `subscriptions-transport-ws` | `graphql-ws` `GraphQLWsLink` (lazy) | |

Ionic 7/8/9 template changes in both apps: legacy form syntax (`<ion-label>` + `<ion-input>` in an
`ion-item`) converted to the modern `labelPlacement` + `slot="label"` syntax (checkboxes and radios
take their label as content); `ion-slides` -> Swiper 14 element (`<swiper-container>`); the
Ionic-5-style `ion-datetime` inputs in promotions -> `ion-datetime-button` + modal (ISO strings);
ionicons v4 names (`ios="ios-menu" md="md-menu"`) -> `name="menu"`; a nested `<ion-app>` in the
carrier get-product page became a plain flex container.

Removed stray server/build packages from both frontends after checking they were unused:
`mongoose`, `kareem`, `mpath`, `mquery`, `hooks-fixed`, `connect`, `waves`, `sw-toolbox`, `save`,
`es6-promise-plugin`, `pm2` (+ `app.ts`, `pm2bootstrap.ts`), `rxjs-compat`, `stripe`, `handlebars`,
`uglify-js`, `fstream`, `cryptiles`, `neo-async`, `lodash.mergewith`, `core-js`, `@ionic/pro`,
`@ionic/lab`, `tslint`, `codelyzer`, Karma/Jasmine/Protractor, `ngx-progressbar` (carrier, unused),
`graphql-tag`, `symbol-observable`, `sass-loader`.

## Shared change (packages/common)

`DBObject` and `ProductInfo` copied raw data with `_.assign(this, raw)`. GraphQL payloads carry
`id`, `createdAt` and other fields that the entities only expose as getters; the esbuild/Vite
output is ES modules (strict mode), so that assignment now throws ("Cannot set property id ...
which has only a getter") and broke the merchant product pages. `assignRaw()` skips getter-only
accessors. Committed as `fix(common): ... (shared)` (6bdea531); the lead landed the same change on
`feat/latest-stack` (744add97) and the merge kept one copy.

## Removed hosting leftovers

No PM2: the `connect` static servers (`app.ts`), `pm2bootstrap.ts`, the `start:server*` scripts and
the `PM2_*`, `KEYMETRICS_*`, `WEB_CONCURRENCY`, `WEB_MEMORY`, `PORT`, `LOGS_PATH` settings are gone
from both apps, and so is merchant's Elastic Beanstalk config that started that server. The Docker
images build the static bundle and serve it with nginx (`ENTRYPOINT ["./entrypoint.prod.sh"]`,
`CMD ["nginx", "-g", "daemon off;"]`). `DEFAULT_LOGIN_PASSWORD` defaults to empty (demo builds can
still prefill the login form through the environment); API keys default to empty.

## Verification

| Check | Carrier | Merchant |
| --- | --- | --- |
| `tsc -p tsconfig.app.json --noEmit` | clean | clean |
| Vitest (`pnpm test`) | 9 files, 61 tests pass | 7 files, 40 tests pass |
| Production build (`pnpm run build`) | passes, initial 1.34 MB (327 kB transfer) | passes, initial 1.74 MB (376 kB transfer) |
| Dev server boot + headless load | `/login`, no console errors except the unreachable API | `/login` and warehouse, carriers, customers, settings, promotions, track pages with a store logged in: no errors (Google "NoApiKeys" warnings only) |
| Playwright, no API needed | 3/3 (dev server and production build) | 2/2 (dev server and production build) |
| Playwright against the core lane's API (production builds served by `e2e/serve-apps.mjs`) | 8/8 incl. a full delivery (take, pick up, start, delivered; statuses checked through GraphQL) | 8/8: login, products, order workflow button, carriers table (admin-assigned + store-added carriers, custom cells), customers, settings |
| Docker image | builds (`node:26-alpine` + pnpm 12.23 -> nginx) | not verified yet: Docker Desktop answered 500 on every call during the run (same Dockerfile shape as carrier) |

All 16 specs are green against the production builds and the core lane's API (after Docker
Desktop was restarted; an earlier attempt hit a hung test Mongo). The work-toggle spec stubs
`GetOrderForWork`, because the shared test database can hold packaged orders nearby and an online
carrier is sent straight to them.

## Old pull requests touching these apps

- #1218 "feat: add carrier orders list" (2020): not ported. The carrier flow deliberately offers
  one packaged order at a time (take / skip, carrier-competition rules in drive-to-warehouse and
  get-product); a free list bypasses the skip and competition logic, and the PR was incomplete
  (choosing an order did not navigate, `store.selectedOrder.carrierStatus` crashed without a
  current order). A "nearby orders" view needs a product decision first.
- #1253 "fix: carriers not showing on merchant" (2020 draft): the bug still existed (the merchant
  carriers page listed only `usedCarriersIds`, so carriers an admin assigned through
  `carriersIds` never showed). Ported client-side in the merchant app (both lists, live, deleted
  carriers dropped; removing a carrier clears both lists). Not ported: moving merchant-added
  carriers to `carriersIds` (the core lane's carrier-password authorization keys on
  `usedCarriersIds`) and the carrier app saving whole warehouses on "take work" (unsafe).

## Held back

| Item | Why |
| --- | --- |
| `@angular/animations` 22.3.0 (deprecated) in merchant | `ngx-masonry` 14.0.1 (latest) injects `AnimationBuilder`; `provideAnimationsAsync()` keeps it working. Replace the masonry grid with CSS columns before Angular 23 removes the package. |
| `IonicModule` (deprecated in Ionic 9) | Moving 100+ NgModule-declared templates to standalone Ionic components + `provideIonicAngular()` is a separate refactor; Ionic 9 still ships `IonicModule` under `@ionic/angular/lazy`. |
| TypeScript 7 | Contract: Angular 22 needs `>=6.0 <6.1`. |
| Playwright browser build | e2e runs locally used the installed `chromium_headless_shell-1243` through a scratch config; CI should run `npx playwright install chromium` for 1.65's build. |
| Android Gradle Plugin 8.13.0, Gradle 8.14.3 | The versions Capacitor 8.6's Android template and its plugins are built with; upgrade them together with Capacitor (`npx cap migrate`). |
| Swift Package Manager in the merchant iOS app | `@capacitor-mlkit/barcode-scanning` (Google ML Kit) supports only CocoaPods. |

## How to run

```sh
export PATH="/c/nvm/v26.13.1:$PATH"          # Node 26.13.1, pnpm 12.23.0
pnpm install
pnpm --filter @ever-platform/carrier-mobile-ionic start      # http://localhost:4203
pnpm --filter @ever-platform/merchant-tablet-ionic start     # http://localhost:4202
pnpm --filter @ever-platform/carrier-mobile-ionic test       # Vitest
pnpm --filter @ever-platform/merchant-tablet-ionic test
pnpm --filter @ever-platform/carrier-mobile-ionic build      # production build into www/
pnpm --filter @ever-platform/merchant-tablet-ionic build
pnpm --filter @ever-platform/e2e exec playwright test --project=carrier    # app + API running
pnpm --filter @ever-platform/e2e exec playwright test --project=merchant
docker build -f .deploy/carrier-mobile-ionic/Dockerfile -t ever-carrier-mobile .
docker build -f .deploy/merchant-tablet-ionic/Dockerfile -t ever-merchant-tablet .
```

Both Dockerfiles take `--build-arg VERDACCIO_REGISTRY=http://host.docker.internal:4873/` on this PC.

## Native builds

`android/` and `ios/` in both apps are Capacitor 8.6 projects, generated with `cap add` and committed.
Capacitor's own `android/.gitignore` and `ios/.gitignore` keep the build output and everything
`cap sync` copies out of git: `app/src/main/assets/public` and `ios/App/App/public` (the web build),
`capacitor.config.json`, `config.xml`, `capacitor-cordova-*-plugins`, `build/`, `.gradle/`,
`local.properties`, `Pods/`, `DerivedData`. The apps' `.gitignore` files no longer ignore `/android/`
and `/ios/`.

| | Carrier | Merchant |
| --- | --- | --- |
| Android `namespace` / `applicationId`, iOS bundle id | `co.ever.carrier` | `co.ever.merchant` |
| Name | Ever Carrier | Ever Merchant |
| Version | `versionName` 0.5.0, `versionCode` 500 (Cordova's major×10000 + minor×100 + patch; the Cordova 0.2.0 build was 200); iOS `MARKETING_VERSION` 0.5.0, build 1 | same |
| Android permissions | `INTERNET`, `ACCESS_NETWORK_STATE`, `ACCESS_COARSE_LOCATION` + `ACCESS_FINE_LOCATION` (GPS feature required: it is the courier app), `POST_NOTIFICATIONS` | `INTERNET`, `ACCESS_NETWORK_STATE`, `CAMERA` (camera feature optional); ML Kit `barcode_ui` meta-data and the camera plugin's backported photo picker service |
| iOS `Info.plist` | `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription` (the geolocation plugin requires both) | `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSPhotoLibraryAddUsageDescription`, `UIRequiresFullScreen` (an iPad only honours the landscape lock in full screen) |
| iOS dependencies | Swift Package Manager (Capacitor 8's default; `ios/App/CapApp-SPM`) | CocoaPods (`ios/App/Podfile`, iOS 15.5) |

Both: Capacitor's Android template (AGP 8.13.0, Gradle 8.14.3, JDK 21, compile and target SDK 36,
min SDK 24) and iOS 15 or later. `capacitor.config.ts` now sets `androidScheme: 'http'` +
`cleartext: true` like the shop app: with the default `https` WebView origin, Android blocks calls to
the plain-HTTP dev API as mixed content.

- **Merchant uses CocoaPods.** `@capacitor-mlkit/barcode-scanning` supports only CocoaPods (Google
  ML Kit has no Swift package), so the project was created with
  `npx cap add ios --packagemanager CocoaPods` and the Podfile sets `platform :ios, '15.5'`, as the
  plugin requires. `pod install` cannot run on Windows: on a Mac, the first `npx cap sync ios` runs it
  and creates `ios/App/Podfile.lock` and `ios/App/App.xcworkspace/contents.xcworkspacedata`. Commit
  both. `AppDelegate.swift` has the screen-orientation plugin's `supportedInterfaceOrientationsFor`
  hook, so views presented over the app keep the landscape lock.
- **Carrier uses Swift Package Manager.** Every plugin it uses ships a `Package.swift`. Xcode resolves
  the packages (`capacitor-swift-pm` from GitHub, the plugins from `node_modules`) when the project
  opens; commit the `Package.resolved` it writes under `App.xcodeproj/project.xcworkspace/`.

### Build and run

```bash
cd packages/carrier-mobile-ionic        # or packages/merchant-tablet-ionic
pnpm run build                          # production build into www/ (build:dev for a dev build)
npx cap sync                            # after every web build, plugin change or pnpm install

# Android: JDK 21 and the Android SDK (platform 36)
npx cap open android                    # Android Studio: Run on a device or an emulator
cd android && ./gradlew assembleDebug   # app/build/outputs/apk/debug/app-debug.apk
npx cap run android                     # build, install and start on a device connected over adb

# iOS: macOS with Xcode (and CocoaPods for the merchant app)
npx cap sync ios                        # merchant: runs pod install
npx cap open ios                        # carrier: App.xcodeproj, merchant: App.xcworkspace
npx cap run ios                         # set a team under Signing & Capabilities first
```

- A device cannot reach `localhost`: set `SERVICES_ENDPOINT`, `GQL_ENDPOINT` and
  `GQL_SUBSCRIPTIONS_ENDPOINT` in the app's `.env` to an address the device can reach (the PC's LAN IP,
  or `10.0.2.2` from the Android emulator) before `pnpm run build`.
- `android/capacitor.settings.gradle`, `android/app/capacitor.build.gradle`,
  `ios/App/CapApp-SPM/Package.swift` (carrier) and `ios/App/Podfile` (merchant) point into pnpm's
  `node_modules/.pnpm/<package>@<version>_<peers>/` folders. `cap sync` rewrites them, so commit the
  change after upgrading any Capacitor package.
- Release builds need signing: an Android keystore (not in the repo) and an Apple team.
- CI: the `android` job in `.github/workflows/ci.yml` builds both debug APKs (and the shop's) on
  every pull request.

### Icons and splash

Generated with `@capacitor/assets` 4.0.0 from the Cordova resources: `resources/ios/icon/icon-1024.png`
as the icon (also the adaptive-icon foreground, on a white background) and `resources/splash.png` on
`#2a2c39`. The icon is still Ionic's placeholder artwork, as it was in the Cordova apps. To use new art,
put `icon-only.png`, `icon-foreground.png`, `icon-background.png` (1024×1024) and `splash.png`
(2732×2732) in a temporary `assets/` folder, then run
`pnpm dlx @capacitor/assets@4.0.0 generate --assetPath assets --splashBackgroundColor '#2a2c39' --android --ios`.
