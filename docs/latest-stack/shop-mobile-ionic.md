# shop-mobile-ionic lane: latest stack notes

Lane branch: `feat/latest-stack-shop-mobile` (cut from `feat/latest-stack` @ `e3e00b80`).
Package: `packages/shop-mobile-ionic`, the customer shopping app and the reference app for the
Expo and Flutter lanes. Its feature inventory is `docs/latest-stack/shop-mobile-features.md`.

## Versions

| Area | Before | Now |
| --- | --- | --- |
| Angular | 13.1 (`@angular-devkit/build-angular` + custom webpack) | 22.3 (`@angular/build:application` / `dev-server` / `unit-test`) |
| Ionic | `@ionic/angular` 5.8 | 9.0.14, NgModule build from `@ionic/angular/lazy` |
| Native shell | Cordova (android 10) + 22 cordova plugins + `@ionic-native/*` 5 | Capacitor 8.6 (`@capacitor/core`, `cli`, `android`, `ios`) |
| Capacitor plugins | | app 8.1, browser 8.0, camera 8.2, device 8.0, dialog 8.0, geolocation 8.2, haptics 8.0, local-notifications 8.3, network 8.0, preferences 8.0, splash-screen 8.0, status-bar 8.0, `@capacitor-mlkit/barcode-scanning` 8.2 |
| GraphQL client | apollo-angular 2.6, @apollo/client 3.5, subscriptions-transport-ws, graphql 15 | apollo-angular 14.2, @apollo/client 4.3, graphql-ws 6.4 (`GraphQLWsLink`, token in `connectionParams`), graphql 16.15 (the core lane's pick: Apollo Server 5 rejects 17) |
| i18n | @ngx-translate/core 13, http-loader 6 | 18.1 / 18.1 through the common-angular `TranslateModule` shim |
| Storage | @ionic/storage-angular 3 | 4.0 (set up as before; the app keeps using `localStorage`) |
| Carousel | `ion-slides` (Swiper 5 inside Ionic) | Swiper element 14.4 (`<swiper-container>`) |
| Progress bar | ngx-progressbar 6 | 14.0 (standalone `NgProgressbar`, needs `@angular/cdk` 22) |
| CSS | bootstrap 4.6, font-awesome 4.7 | bootstrap 5.3.9, @fortawesome/fontawesome-free 7.3.1 (+ v4 shims) |
| Other | qrcode 1.4, jsbarcode 3.11, socket.io-client 4.3, uuid 8, rxjs 7.4, zone.js 0.11, ionicons 5 | qrcode 1.5.4, jsbarcode 3.12.3, socket.io-client 4.8.4, uuid 14, rxjs 7.8.2, zone.js 0.16.3, ionicons 8.1 |
| Tests | Karma + Jasmine (84 specs), Protractor | Vitest 5.1 + jsdom 31 via `ng test` (201 specs), Playwright (`e2e/tests/shop-mobile`) |
| Env script | ts-node + yargs + envalid 7 | Node 26 type stripping (`node scripts/configure.ts`) + envalid 9 + dotenv 18 |
| Node / TS | 16 / 4.5 | 26.13.1 / 6.0.3 |

## How to run

Toolchain: Node 26.13.1 and pnpm 12.23 (`export PATH="/c/nvm/v26.13.1:$PATH"`).

```bash
pnpm install                                                  # from the repo root
pnpm --filter @ever-platform/shop-mobile-ionic start          # env (dev) + ng serve on :4201
pnpm --filter @ever-platform/shop-mobile-ionic build          # dev build into www/
pnpm --filter @ever-platform/shop-mobile-ionic build:prod     # production build (service worker)
pnpm --filter @ever-platform/shop-mobile-ionic test           # Vitest (ng test --watch=false)
pnpm --filter @ever-platform/shop-mobile-ionic typecheck      # tsc over app + specs
pnpm --filter @ever-platform/e2e exec playwright test --project=shop-mobile   # app on :4201
```

`scripts/configure.ts --environment=dev|prod` writes `src/environments/environment(.prod).ts`
from `.env` (both git-ignored); every `start`/`build`/`test` script runs it first. The settings
and their defaults are listed in the feature inventory, section 2.

### Native apps (Capacitor)

The `android/` and `ios/` projects are generated and not committed:

```bash
cd packages/shop-mobile-ionic
pnpm run build:prod                 # fills www/
npx cap add android                 # once per checkout (needs Android Studio / JDK 21)
npx cap add ios                     # once, on macOS with Xcode
npx cap sync                        # after every web build or plugin change
npx cap open android                # or: pnpm run cap:android / cap:ios
```

`capacitor.config.ts`: `appId: 'co.ever.customer'` (the Cordova widget id, so store updates keep
working), `webDir: 'www'`, `androidScheme: 'http'` + `cleartext: true` because the dev API is
plain HTTP/WS, splash screen 3000 ms + 300 ms fade like `config.xml`. Native permissions to add
after `cap add`: location (`ACCESS_FINE_LOCATION` / `NSLocationWhenInUseUsageDescription` "To
locate you"), camera for the barcode scanner. Icons and splash: `resources/icon.png` and
`resources/splash.png` (`npx @capacitor/assets generate --assetPath resources`).

## Decisions and replaced libraries

- **Angular 22 defaults.** OnPush is the default change detection now: every component got
  `changeDetection: ChangeDetectionStrategy.Eager` (what the v22 `change-detection-eager`
  migration does), because pages mutate fields from socket and Apollo subscriptions, promises and
  timers. Zone.js stays (`provideZoneChangeDetection()` in `AppModule`; v21+ defaults to
  zoneless). The other v22 core migrations ran too: `withXhr()` keeps the XHR HTTP backend,
  `$safeNavigationMigration()` keeps the old `?.` null semantics in 6 templates,
  `strictTemplates: false` is explicit. `standalone: false` on all NgModule declarations
  (`tools/ng-standalone-false.mjs`).
- **Ionic 9.** The `@ionic/angular` entry point is the standalone build; the NgModule build moved
  to `@ionic/angular/lazy`, so every import comes from there. Ionic 7+ puts its default palette
  in `core.css`, so `theme/variables.scss` now loads after `global.scss` (otherwise toolbars turn
  Ionic blue). Legacy form syntax is gone: the language radios carry their label as content
  (`justify="space-between"`), the toggle / checkbox / textarea got `aria-label`s. `ion-searchbar`
  now searches on `ionInput` (Ionic 7 made `ionChange` fire only on blur/Enter). Icons load from
  `/svg` (copied from `node_modules/ionicons`).
- **ion-slides → Swiper element.** `swiper/element/bundle` is registered in `main.ts` (it brings
  its own styles into the shadow root, so no global swiper CSS); the slides
  view and the product images use `<swiper-container init="false">` with the same options plus
  `observer`. The feed drops `autoHeight` (with the wrapper in a shadow root and the slides at
  100% of it, autoHeight collapses the cards to 0 px); the cards fill the screen as before.
- **Cordova → Capacitor**, behind `NativeService` (`src/app/services/native`) so specs can swap it:
  Geolocation → `@capacitor/geolocation` (same call, uses the browser API on the web);
  Device uuid/platform → `Device.getId()` / `Capacitor.getPlatform()`; Globalization →
  `Device.getLanguageCode()` (two-letter code, which also fixes the old full-tag lookup that
  always fell back to English on a phone); Network → `@capacitor/network` (works in browsers
  too, via online/offline events); StatusBar `styleBlackOpaque()` → `setStyle(Style.Dark)`;
  SplashScreen → `@capacitor/splash-screen`; CallNumber → a `tel:` link (Capacitor hands it to
  the dialer); phonegap-plugin-barcodescanner → `@capacitor-mlkit/barcode-scanning` (installs the
  Google code scanner module on Android when missing; rejects in a browser, as the old plugin
  did). Status bar and splash calls only run on a device.
- **Removed, no replacement needed** (installed but never called by any page): Google Analytics,
  Mixpanel, Intercom, unique-device-id (`Device.getId()` covers it), in-app browser, dialogs,
  vibration, camera, local notifications as Cordova plugins. The Capacitor `browser`, `camera`,
  `dialog`, `haptics`, `local-notifications`, `app` and `preferences` plugins are installed so the
  native projects keep those capabilities; the app code does not call them yet.
- **Removed tooling:** `@ionic/pro`, `@ionic/lab`, `@ionic/angular-toolkit`, `ionic` CLI,
  Karma/Jasmine, Protractor (`e2e/` folder), tslint/codelyzer, custom webpack
  (`config/webpack.config.js`, `extra-webpack.config.js`), `config.xml`, `res/` (Cordova splash
  drawables), `ionic.project`, the pm2 / connect static server (`app.ts`, `pm2bootstrap.ts`,
  nginx serves the build), `rxjs-compat`, `core-js` (`reflect-metadata` is imported directly),
  and stray deps (`cryptiles`, `fstream`, `handlebars`, `neo-async`, `save`, `uglify-js`,
  `sass-loader`, `graphql-tag`, `lodash.mergewith`, `subscriptions-transport-ws`).
- **Apollo Client 4.** `provideApollo()` with `HttpLink` + `GraphQLWsLink(createClient(...))`
  (lazy, retries forever like the old `reconnect: true`) + `SetContextLink` for the bearer token.
  Error policies are declared through `ApolloClient.DeclareDefaultOptions`.
  `notifyOnNetworkStatusChange: false` for watch queries keeps one emission per result, and the
  two watch queries filter out results without data.
- **ngx-translate 18** through `@modules/client.common.angular2/locale/translate.module`:
  `forRoot({ loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
  fallbackLang: 'en-US' })`. The three modules that used `forChild({ loader })` now share the root
  service (they did in practice before). `currentLang` → `getCurrentLang()`,
  `setDefaultLang` → `setFallbackLang`.
- **Bootstrap 5.** Templates use Bootstrap 4 column classes on `ion-col`; Bootstrap 5 sizes
  `.col-N` with `width`, which `.box { width: 100% }` overrides, so `theme/bootstrap4-grid-compat.scss`
  restores the Bootstrap 4 sizing. `pl-*`/`pr-*` became `ps-*`/`pe-*`. Font Awesome 7 with the v4
  shims keeps the `fa fa-*` classes.
- **Routes.** Three NgModules registered routes starting with `/` (`/test`, `/cancel-page`,
  `/issue`), which could never match and which the Angular 22 router rejects in dev mode: removed
  (the pages are modals). The `errors` routes are bundled with the pages instead of lazy-loaded,
  so the connection lost page opens when the network is already gone (a browser cannot fetch a
  lazy chunk offline; Cordova served the chunks from the device).
- **Popups.** Ionic 6+ moved the modal wrapper and backdrop into the shadow root, so the old
  `.order-info-modal .modal-wrapper` / `ion-backdrop` rules no longer reached them; the popups use
  `--background: transparent`, `--box-shadow: none`, `--backdrop-opacity: 0` instead. The old
  `display: block` on the modal broke the stacking of the shadow parts (the backdrop covered the
  popup and took its taps), so it is gone.
- **Resume Buy after registering.** A customer who taps Buy before registering goes through the
  invite pages and back to the products. Ionic keeps the products page alive in its stack, so the
  pending Buy is resumed in `ionViewWillEnter` (was `ngOnInit`, which does not run again).
- **Menu.** The menu now also enables the ltr/rtl side for the start language (before, the start
  language changed before the menu subscribed, both sides stayed enabled and the menu button
  could open the right-hand menu in English).
- **Service worker** is registered only in the production web build (not inside the Capacitor app).
- **tsconfig** has no `baseUrl`; `paths` map `app/*` and `environments/*` plus the shared aliases
  from the contract. `rootDir: ".."` because `packages/common` and `common-angular` compile from
  source.
- `underscore` and `uuid` are direct dependencies: `packages/common` / `common-angular` sources
  import them and the dev server resolves bare imports from the app.

## Tests

- `ng test --watch=false` (Vitest, jsdom, `maxWorkers: 2`): **36 files, 201 tests, all green.**
  - All **84** Karma specs from `develop` @ `abd39940` are ported (Jasmine spies → `vi` through
    `src/app/testing/spies.ts`, `waitForAsync`/`fakeAsync` → async/await + `vi` fake timers). The
    payment-flow fixes they guard (#1645/#1646 paying guard in the root Store, #1648 server
    currency, #1649 email/card-save alerts, #1651 order info modal once, #1652 saved-card failure
    alert, #1654 translated messages in 6 locales) all pass. The fleet payment specs keep their
    original layout so the lead's merge of later fleet fixes stays small.
  - New: Store (every storage key, paying guard, `isLogged`, start language from storage /
    browser / device), the Apollo services (operation names, variables, result filtering) via
    `ApolloTestingController`, GeoLocationService (default location, device, IP fallback),
    ProductLocales / Products / ServerSettings, `tel:` links, every route guard, order tracking
    (status steps, time range, status texts, issue cancel + refund, Undo), Cancel and Issue
    pages, discount, delivery info, elapsed time, order card, the shared pipes, AppComponent
    (device registration, network lost / back, status bar and splash only on a device), menu.
  - TestBed note: the unit-test build has no JIT scope data, so a spec that renders the
    `translate` pipe imports `translateTesting()` (`src/app/testing/translate.ts`), not only the
    shim NgModule.
- Playwright (`e2e/tests/shop-mobile`, Pixel 7, baseURL `http://localhost:4201`): **14 passed,
  1 skipped** (the server-down test skips while an API runs) against the production build served
  by `node e2e/serve-apps.mjs shop-mobile` and the core lane's API (graphql 16, Mongoose 9 fix in).
  - `app-shell.spec.ts` (no API needed): boots with no unexpected console errors, server-down page
    while the API is unreachable, manifest + 6 translation files + ionicons served.
  - `offline-ui.spec.ts` (no data needed; fakes the API root when no API runs): Hebrew switches
    the app to rtl and the right-hand menu, side menu items, offline → connection lost → back.
  - `flows.spec.ts` (needs the API, skipped without it): first start, product feed, details and
    back, search, empty order history, info pages, merchants page, Buy → delivery order page →
    Undo → cancel, and "browse first" Buy → register by address → order.
  - Payments are not run end to end: the API has no Stripe key, and real keys must never be used.
    The unit specs cover every payment branch.

## Docker

`.deploy/shop-mobile-ionic/Dockerfile` (+ `Dockerfile.dockerignore`, read by BuildKit): `node:26-alpine`,
`npm i -g pnpm@12.23.0`, `pnpm install --frozen-lockfile --filter "@ever-platform/shop-mobile-ionic..."`,
`build:prod` with the env settings as build args, then `nginx:alpine` serving `www/` on 4201 with
the old entrypoints. Built and smoke-tested here (`--build-arg
VERDACCIO_REGISTRY=http://host.docker.internal:4873/`): 117 MB image; `/`, a deep link, the
translations and the icons answer 200.

## Held back / known gaps

| Item | Why |
| --- | --- |
| `IonicModule` (lazy NgModule build) | Ionic 9 deprecates it for `provideIonicAngular()` + standalone `Ion*` imports, but it still works. Moving 35 NgModules to standalone Ionic components (plus `addIcons` for every icon) is a larger change than this lane; the contract keeps NgModules. Logs one deprecation warning at start. |
| TypeScript 7 | Angular 22 needs `>=6.0 <6.1` (contract). |
| `graphql` 16.15 (17 exists) | Aligned with the core lane: `@apollo/server` 5 only accepts `^16.11`. apollo-angular 14 / Apollo Client 4 accept both. |
| Stripe Checkout (`checkout.js`) | Stripe's legacy popup is still what the payment flow and its fleet specs use. Moving to Stripe Elements / Payment Element is a product change, not an upgrade. |
| Google Maps loader | `common-angular`'s loader waits for the Maps callback; without network to Google the app never starts (unchanged behaviour, outside this lane). |
| Playwright browser | The PC's cache has Chromium 1243, `@playwright/test` 1.65 wants 1255. I ran the suite with the cached build (`launchOptions.executablePath`); `npx playwright install chromium` is needed for a plain run. |
| `localStorage` on iOS | Kept (the specs and the other apps' docs rely on the keys). WKWebView can evict it under storage pressure; `@capacitor/preferences` is installed for a later move. |

## Quirks kept on purpose (see the feature inventory)

- The start-up server check "passes" only because GET on the API root fails (404/HTML); a missing
  `serverConnection` key reads as down. On the very first start the server settings are not
  loaded yet (the start-up checks run side by side), so a new customer always sees the invite page
  first.
- `DEFAULT_LANGUAGE` wins over the saved language at start (fleet task T-2805 changes this).
- Pay buttons throw "Can't pay in app" without `STRIPE_PUBLISHABLE_KEY` (fleet task T-2806).

## Shared code touched

- Cherry-picked the lead's `0b2e53d5` (common-angular ngx-barcode: `import jsbarcode`, Eager) so
  the dev server can load the takeaway pages; no other change outside the lane scope.
