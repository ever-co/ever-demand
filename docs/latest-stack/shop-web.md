# Shop web lane: shop-web-angular and shop-web-gatsby

Branch `feat/latest-stack-shop-web`, cut from `feat/latest-stack` at `e3e00b80`.
Both packages are in `pnpm-workspace.yaml`.

## packages/shop-web-angular

### Versions

| Package | Before | Now |
| --- | --- | --- |
| Angular (core, common, forms, router, animations, platform-browser) | 13.1 | 22.3.0 |
| Angular Material / CDK | 13.1 (legacy components) | 22.3.0 (MDC) |
| @angular/google-maps | (`@agm/core` 1.1, unused) | 22.3.0 |
| Builders | `@angular-devkit/build-angular` (webpack) + custom webpack configs | `@angular/build` 22.3 (`application`, `dev-server`, `unit-test`) |
| Unit tests | Karma + Jasmine | Vitest 5.1 + jsdom 31 (`@angular/build:unit-test`) |
| e2e | Protractor | Playwright 1.65 (`e2e/tests/shop-web`) |
| TypeScript | 4.5 | 6.0.3 |
| @apollo/client / apollo-angular / graphql | 3.5 / 2.6 / 15.7 | 4.3.8 / 14.2.0 / 16.15.0 (the core lane's major: @apollo/server 5 rejects 17) |
| graphql-ws | - | 6.4.3 (`GraphQLWsLink`, lazy) |
| @ngx-translate/core / http-loader | 13 / 6 | 18.1 / 18.1 (through the common-angular shim) |
| @fortawesome/* | angular-fontawesome 0.9, FA 5 | angular-fontawesome 5.1, FA 7.3 |
| ngx-infinite-scroll | 10 | 22.0 |
| bootstrap (CSS) | 4.6 | 5.3.9 |
| rxjs / zone.js / tslib | 7.4 / 0.11 / 2.3 | 7.8.2 / 0.16.3 / 2.9.1 |
| socket.io-client | 4.3 | 4.8.4 |
| envalid | (undeclared) | 9.0 |

### Replaced or removed libraries

| Library | Replacement |
| --- | --- |
| `@agm/core` | Not used by the code. The address map (`ngx-google-map`) and the carrier route dialog (`ea-carrier-location`) now use `@angular/google-maps` (`google-map`, `map-marker`, `map-directions-renderer`, `map-info-window`). The info windows are Angular templates now (before: HTML strings with unescaped store and carrier names). |
| `ngx-hm-carousel` (peer Angular 19) | Native carousel in `CarouselViewComponent` (4 products per view, prev/next, loads more near the end). |
| `ngx-drag-scroll` (peer Angular < 22) | Native horizontally scrolling thumbnail strip with CSS scroll snap; the arrow buttons call `scrollImages()`. |
| `masonry-layout` (unmaintained) | `MasonryComponent` keeps its API (`masonry`, `masonry-brick`, `layoutComplete`) with a ~60 line shortest-column layout of its own. |
| `ng-lazyload-image` | Imported but unused; product thumbnails use `loading="lazy"`. |
| `css-element-queries` | `ElementQueries.init()` ran on image load, but no CSS used element queries. Removed. |
| `ngx-toastr`, `stripe`, `lodash` (one `isEmpty`), `@fortawesome/free-regular-svg-icons`, `@fortawesome/fontawesome-free` (CSS) | Not used. `isEmpty` is a local helper with lodash semantics (a number counts as empty, as before). |
| `http-proxy`, `http-server`, `handlebars`, `neo-async`, `fstream`, `uglify-js`, `raw-loader`, `sass-extract*`, `terser-webpack-plugin`, `ie-shim`, `core-js`, `rxjs-compat`, `follow-redirects`, `pm2`, `browser-detect`, `bson-objectid`, `eventemitter3`, `lodash.*`, `mdi-svg`, `@angular/platform-server`, `@angular/service-worker`, `@angular/platform-browser-dynamic`, `@angular/language-service` | Not imported anywhere (checked with grep). SSR and the service worker were never wired up. |
| protractor, karma, jasmine, tslint, codelyzer, webpack configs, `app.ts`/`pm2bootstrap.ts` static server, typedoc config | Removed. |
| `yargs`, `dotenv`, `ts-node` in `scripts/` | `node scripts/configure.ts` runs on plain Node 26 (type stripping, `process.loadEnvFile()`, `util.parseArgs`). |

`lodash`, `underscore`, `uuid` and `reflect-metadata` are direct dependencies although the app
does not import them: `packages/common` and `packages/common-angular` are compiled from source,
and Vite (dev server prebundling, Vitest) resolves their imports from the app's root.

### Decisions

- **Angular 22 migrations**: `ng update @angular/core --migrate-only --from=21.0.0 --to=22.3.0`
  ran all of them (`change-detection-eager`, `http-xhr-backend` → `withXhr()`,
  `safe-optional-chaining` → `$safeNavigationMigration()`, `strict-safe-navigation-narrow`,
  the others had nothing to change). Angular 22 makes OnPush the default; every component sets
  `ChangeDetectionStrategy.Eager` because the shop changes state from socket.io, geocoder and
  timer callbacks. `strictTemplates` is on (the v22 default).
- NgModule architecture kept; `standalone: false` on declarations
  (`tools/ng-standalone-false.mjs`). Zone change detection: `provideZoneChangeDetection()`.
- `TranslateModule` comes from `@modules/client.common.angular2/locale/translate.module`;
  `forRoot({ loader: provideTranslateHttpLoader(...) })` in AppModule, plain `TranslateModule` in
  the lazy modules (they used `forChild({ loader })` with the same files, so one shared service
  is the same behaviour). `currentLang` → `getCurrentLang()`, `setDefaultLang` →
  `setFallbackLang`. First visit still follows the browser language (`browser-language.ts`).
- Apollo: `provideApollo(createApolloOptions)` (`src/app/apollo-options.ts`): HTTP link with a
  `SetContextLink` that adds `Authorization: Bearer <token>` when the store has a token (the old
  code built that link but never used it), split to a lazy `GraphQLWsLink` for subscriptions.
  Default options declared through `ApolloClient.DeclareDefaultOptions`. Watch queries use
  `onlyCompleteData()` because Apollo 4 emits a loading result first.
- Material: M2 theme on the Sass module API (`mat.m2-define-palette`, `m2-define-light-theme`,
  `all-component-themes`) to keep the brand colours; `form-field-overrides` gives the filled
  form field a transparent background (the closest to the old legacy appearance). Global
  selectors moved to MDC class names (`.mdc-line-ripple`, `.mat-mdc-dialog-surface`,
  `.mdc-checkbox__background`).
- Bootstrap 5: utility classes renamed in the templates (`mr-*` → `me-*`, `ml-*` → `ms-*`,
  `pl/pr` → `ps/pe`, `text-right` → `text-end`).
- Startup fix: the server-settings initializer now waits for the connection check. In parallel
  (as before) it always skipped the invite/registration settings on a first visit, so an
  anonymous "buy" did nothing until a reload.
- Removed the placeholder Google Tag Manager snippet of `index.html` (`GTM-XXXXXXX`, never a real
  container) and the second `bootstrapModule()` call at the bottom of `app.module.ts`.
- `configure.ts` writes the same settings to `environment.ts` and `environment.prod.ts`
  (production replaces one with the other); `enableProdMode`/debug tools are gone (the
  builder handles production mode).
- Output is `dist/browser` (netlify.toml and firebase.json updated). The package's own
  `Dockerfile`, `Dockerfile-dev` and `docker-compose.yml` were deleted: they ran `npm i` inside
  the package, which cannot resolve the `workspace:*` dependencies. `.deploy/shop-web-angular` is
  the image.

### How to run

```bash
export PATH="/c/nvm/v26.13.1:$PATH"
pnpm install
cd packages/shop-web-angular
pnpm start            # config:dev + ng serve on http://localhost:3000
pnpm build            # config:prod + production build into dist/browser
pnpm test             # Vitest through @angular/build:unit-test (112 specs)
pnpm typecheck        # app + specs
pnpm i18n:check && pnpm a11y:check-icon-buttons && pnpm a11y:check-icon-buttons:test
```

Settings come from the env or `packages/shop-web-angular/.env` (see `scripts/env.ts`):
`SERVICES_ENDPOINT`, `HTTPS_SERVICES_ENDPOINT`, `GQL_ENDPOINT`, `GQL_SUBSCRIPTIONS_ENDPOINT`,
`GOOGLE_MAPS_API_KEY`, `DEFAULT_LATITUDE`/`DEFAULT_LONGITUDE`, ...

### e2e (`e2e/tests/shop-web`, Playwright project `shop-web`, baseURL `http://localhost:3000`)

```bash
pnpm --filter @ever-platform/shop-web-angular start      # terminal 1
pnpm --filter @ever-platform/e2e exec playwright test --project=shop-web
```

- `app-shell.spec.ts` runs without the API (boots, catalogues, icons, deep links; shows the
  server-down page when the API is down).
- `language.spec.ts`: first visit in he-IL (RTL), fr-CA, de-DE (falls back to English); the
  settings language switch needs the API.
- `products.spec.ts`, `register-and-order.spec.ts` need the API and skip themselves while it is
  down. They seed a store and a product at the default location through GraphQL (admin login),
  remove them afterwards, and serve an offline Google Maps stub (no key, no internet needed).

### Deploy image (`.deploy/shop-web-angular/Dockerfile`)

`node:26-alpine` + `npm i -g pnpm@12.23.0`, frozen install of the shop and its workspace
dependencies only, production build (endpoints as `--build-arg`), then `nginx:alpine` serving
`dist/browser` on 4200 (the k8s target port) with the existing entrypoints.
`Dockerfile.dockerignore` keeps host `node_modules`/`.angular`/`build` out of the context.
Verified: `docker build -f .deploy/shop-web-angular/Dockerfile .` succeeds and the container serves
`/` and deep links.

## packages/shop-web-gatsby

The Gatsby shop was a work in progress before the upgrade: `build` ran `gatsby info`, several
imports (`apollo-boost`, `apollo-link-error`, `isomorphic-fetch`) were not even dependencies, and
the browser code read env vars Gatsby never exposes. It now installs, typechecks, builds and has
tests; the screens and their behaviour are the same (products grid, sign-up by address, orders,
settings, product details).

### Versions

| Package | Before | Now |
| --- | --- | --- |
| gatsby | 4 | 5.16.1 |
| react / react-dom | 17 | 19.3.1 (newest React that Gatsby 5 accepts: `^18 \|\| ^19`) |
| UI | @material-ui/core 4 + gatsby-plugin-material-ui | @mui/material 9.6 + @emotion 11 + gatsby-plugin-emotion 8.16 |
| Data | react-apollo-hooks + apollo-boost, gatsby-source-graphql | @apollo/client 4.3.8 (`@apollo/client/react`), graphql 16.15 (core lane) |
| Codegen | @graphql-codegen 2 (typescript + operations, live API) | @graphql-codegen/cli 8 + client-preset 7, schema from `packages/core/src/graphql/**/*.graphql` |
| styled-components | 5 | 6.7 (+ gatsby-plugin-styled-components 6.16) |
| nuka-carousel | 4 | 8.2 |
| maps | react-google-maps 9 (dead) | @vis.gl/react-google-maps 1.10 |
| head tags | react-helmet + gatsby-plugin-react-helmet | Gatsby Head API (`export const Head`) |
| bulma | 0.9 | 1.0.4 (base styles only) |
| sass / gatsby-plugin-sass | - / 5 | 1.108 / 6.16 |
| TypeScript | 4.5 | 6.0.3 |
| Tests | none | Vitest 5.1 + jsdom 31 + Testing Library 16 (42 specs) |

Removed as unused: `formik`, `@fortawesome/*`, `gatsby-image` (there was no image query, so no
`gatsby-plugin-image` either), `gatsby-plugin-sharp`, `gatsby-transformer-sharp`,
`gatsby-source-filesystem`, `gatsby-plugin-offline` (was commented out), `gatsby-plugin-typescript`
(built into Gatsby 5), `prop-types`, `tslint`, the generated `ever-types.ts`/`gatsby-types.ts`.

### Decisions

- **No API at build time.** Product details were pages created per product from the API by
  `gatsby-node` + `gatsby-source-graphql`. They are now a client-only route,
  `src/pages/products/[id].tsx` (`/products/:id`, was `/:id`), that queries the product in the
  browser. Every other page already loaded its data in the browser. Gatsby's own GraphQL is
  not used any more (site metadata is `src/site.ts`).
- **Settings** are `GATSBY_*` env vars (Gatsby only inlines those): `GATSBY_GQL_ENDPOINT`
  (default `http://localhost:8443/graphql`), `GATSBY_DEFAULT_LATITUDE`/`LONGITUDE` (empty = ask the
  browser, fallback Sofia), `GATSBY_GOOGLE_MAPS_API_KEY` (empty = no map, coordinates shown).
  See `.env.template`.
- Pages are only the files directly in `src/pages`; `login/Header.tsx` and
  `settings/Settings.tsx` became pages of their own before, they moved to `src/components`.
- MUI 9: Grid v2 (`size`), `sx` instead of system props, `slotProps`, `createTheme`.
- CSS modules are named exports in Gatsby 5 (`import * as styles`). Sass uses `@use` and
  `sass:color`; Bulma 1 is limited to its base (reset + generic) since no Bulma component is used.
- Bugs fixed on the way: products were queried with `[lat, lng]` (GeoJSON needs `[lng, lat]`), the
  orders page never showed the API list (`orders === []` is always false), the settings Save
  button saved during render, `matchLocale` always returned the first value, the delivery-only
  switch filtered on a field that does not exist.

### Node 26

Gatsby 5.16 declares `engines.node: ">=18 <26"`. On this PC it installs and builds on
Node 26.13.1 (engine-strict is off): lmdb 2.5, msgpackr-extract, sharp 0.32 and @parcel/watcher
load. pnpm needs `allowBuilds` for lmdb, msgpackr-extract and sharp (already listed); `gatsby`,
`gatsby-cli`, `core-js-pure` and `es5-ext` are set to `false` (their install scripts only fetch
optional metadata or print banners). Nothing is held back because of Node 26.

### How to run

```bash
export PATH="/c/nvm/v26.13.1:$PATH"
cd packages/shop-web-gatsby
pnpm develop          # http://localhost:8000
pnpm build            # public/ (no API needed)
pnpm serve            # serves public/ on http://localhost:9000
pnpm test             # Vitest, --maxWorkers=2
pnpm typecheck
pnpm codegen          # after changing a query (reads packages/core/src/graphql)
```
