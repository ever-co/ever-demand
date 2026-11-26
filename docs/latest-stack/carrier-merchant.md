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
ids), `webDir: 'www'`. `android/` and `ios/` are git-ignored; create them with
`pnpm run build && npx cap add android` (or `ios`), then `npx cap sync`. `resources/icon.png` and
`resources/splash.png` feed `npx @capacitor/assets generate --assetPath resources`. `config.xml`,
`ionic.project`, `.io-config.json` (Ionic Pro) and the custom webpack configs are gone.

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
| Vitest (`pnpm test`) | 9 files, 61 tests pass | 6 files, 33 tests pass |
| Production build (`pnpm run build`) | passes, initial 1.34 MB (327 kB transfer) | passes, initial 1.74 MB (376 kB transfer) |
| Dev server boot + headless load | `/login`, no console errors except the unreachable API | `/login` and warehouse, carriers, customers, settings, promotions, track pages with a store logged in: no errors (Google "NoApiKeys" warnings only) |
| Playwright, no API needed | 3/3 (dev server and production build) | 2/2 (dev server and production build) |
| Playwright against the core lane's API | 8/8 incl. a full delivery (take, pick up, start, delivered; statuses checked through GraphQL) | 8/8: login, products, order workflow button, carriers table with custom cells, customers, settings |
| Docker image | builds (`node:26-alpine` + pnpm 12.23 -> nginx) | not verified yet: Docker Desktop answered 500 on every call during the run (same Dockerfile shape as carrier) |

The API-backed runs were green on the dev servers; a later run against the production builds hit
a hung test Mongo (`127.0.0.1:27018` timeouts in the API), so only the no-API specs ran there.

## Held back

| Item | Why |
| --- | --- |
| `@angular/animations` 22.3.0 (deprecated) in merchant | `ngx-masonry` 14.0.1 (latest) injects `AnimationBuilder`; `provideAnimationsAsync()` keeps it working. Replace the masonry grid with CSS columns before Angular 23 removes the package. |
| `IonicModule` (deprecated in Ionic 9) | Moving 100+ NgModule-declared templates to standalone Ionic components + `provideIonicAngular()` is a separate refactor; Ionic 9 still ships `IonicModule` under `@ionic/angular/lazy`. |
| TypeScript 7 | Contract: Angular 22 needs `>=6.0 <6.1`. |
| Playwright browser build | e2e runs locally used the installed `chromium_headless_shell-1243` through a scratch config; CI should run `npx playwright install chromium` for 1.65's build. |

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
