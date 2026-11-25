# Lane notes: `packages/admin-web-angular` (Ever Admin)

Branch `feat/latest-stack-admin`, cut from `feat/latest-stack` at `e3e00b80`.

The admin moved from Angular 13 / Nebular 8 / Bootstrap 4 (yarn, Karma, Protractor, Storybook) to
Angular 22 / Nebular 17 / Bootstrap 5 on the pnpm 12 + Node 26 workspace. Screens, routes, menus
and behaviour stay the same; dead libraries were replaced behind the old APIs, so most screens did
not change.

## How to run it

All commands from `packages/admin-web-angular`, with Node 26 on `PATH`
(`export PATH="/c/nvm/v26.13.1:$PATH"`).

| What | Command |
| --- | --- |
| Generate `src/environments/environment*.ts` from `.env` / env vars | `pnpm run config:dev` or `pnpm run config:prod` (`node scripts/configure.ts`, Node type stripping) |
| Dev server on http://localhost:4200 | `pnpm start` |
| Production build to `dist/` | `pnpm build` |
| Local production preview | `pnpm ng serve --configuration production` |
| Serve `dist/` (static, SPA fallback, plain node:http) | `pnpm serve:build` (or `node e2e/serve-apps.mjs admin` from the root) |
| Unit tests (Vitest, `@angular/build:unit-test`, 2 workers) | `pnpm test` (also runs `node --test scripts/`) |
| Typecheck | `pnpm typecheck` |
| e2e (Playwright, needs the app on :4200 and the API) | `pnpm e2e` or `pnpm --filter @ever-platform/e2e exec playwright test --project=admin` |
| Docker image | `docker build -f .deploy/admin-web-angular/Dockerfile -t ever-demand-admin .` (from the root) |

Memory caps used on the shared PC: `NODE_OPTIONS=--max-old-space-size=4096` for builds, Vitest
`maxWorkers: 2` (`vitest-base.config.ts`).

## Versions

Angular 22.3 (`@angular/build` application / dev-server / unit-test builders, no webpack),
TypeScript 6.0.3, rxjs 7.8.2, zone.js 0.16.3, Nebular 17.0.0 (theme, auth, security, eva-icons),
@angular/cdk 22.3, @ng-bootstrap/ng-bootstrap 21 + Bootstrap 5.3.9 + @popperjs/core 2.11,
@ng-select/ng-select 24.2, apollo-angular 14.2 + @apollo/client 4.3 + graphql 16.15 + graphql-ws 6.4,
@ngx-translate 18.1 (core + http-loader), angular2-smart-table 4.2, ngx-echarts 22 + echarts 6.1,
ngx-highlightjs 14 + highlight.js 11.12, ng2-file-upload 12, swiper 14 (Swiper Element),
@faker-js/faker 10.6, socket.io-client 4.8.4, @fortawesome/fontawesome-free 7.3, qrcode 1.5,
pace-js 1.3.1, envalid 9, Vitest 5.1 + jsdom 31.

## Library replacement table

| Before (Angular 13) | Now | How |
| --- | --- | --- |
| ng2-smart-table 1.7 (View Engine) | angular2-smart-table 4.2 (maintained fork, Angular 18-22) | In-house `<ng2-smart-table>` wrapper (`src/app/@shared/smart-table`) with the same inputs/outputs; `toSmartTableSettings()` maps the old settings (`filter: false` → `isFilterable`, `sort`/`editable`/`addable`, `valuePrepareFunction(value, row)`, `value`/`rowData` + `onComponentInitFunction` on custom renderers, column `class` → header class). All 22 tables keep their settings. CSS hooks `ng2-smart-*` → `angular2-smart-*`. |
| angular2-toaster 11 | Nebular toastr | In-house `ToasterService` / `ToasterModule` / `<toaster-container>` (`src/app/@core/toaster`) with `pop(type, title, body)`, `popAsync`, `clear`; one global Nebular container. |
| @ever-co/angular2-wizard | In-house `FormWizardModule` (`src/app/@shared/wizard`) | Same `<form-wizard>` / `<wizard-step>` selectors, inputs (`isValid`, `showNext`, `showPrev`, texts) and outputs (`onNext`, `onPrev`, `onComplete`, `onStepChanged`), same look. Chosen over Nebular stepper to keep the 7 wizards' templates and screens unchanged. |
| angular-2-dropdown-multiselect | @ng-select/ng-select (`[multiple]`) | Product categories and restricted carriers pickers; same `{id, name}` options and form values. |
| ngx-swiper-wrapper + swiper 6 / ng-simple-slideshow | Swiper Element 14 (`<swiper-container>`) | `image-slider` component; ng-simple-slideshow was only used for a type. |
| ngx-moment | Angular `DatePipe` | one template (`created` cell). |
| ng2-simple-timer | removed | was only provided, never used. |
| @agm/core | removed | `AgmCoreModule` was imported but no `<agm-*>` component was used; maps use the Google Maps JS API directly (`@types/google.maps`). A local loader (`@core/utils/google-maps-loader.ts`) never blocks app start when Maps cannot load. |
| @asymmetrik/ngx-leaflet + leaflet | removed | only imported by the carrier location module and the dead maps demo. |
| ng2-ckeditor / ckeditor 4, tinymce 5 | removed | only used by the unrouted ngx-admin "editors" demo; no admin screen edits rich text. |
| angular-tree-component / ng2-tree, angular2-chartjs + chart.js, @swimlane/ngx-charts | removed | only used by unrouted ngx-admin demo pages (charts, components, tables, ...), which were deleted. |
| ng2-completer | removed | unused. |
| fingerprintjs2 | removed | the only call was commented out. |
| faker 5 | @faker-js/faker 10 | "generate initial data" page (API renames). |
| subscriptions-transport-ws (`WebSocketLink`) | graphql-ws (`GraphQLWsLink`) | `src/app/graphql/graphql.providers.ts` (lazy socket, `connectionParams.authorization`). |
| apollo-angular 2 + @apollo/client 3 | apollo-angular 14 + @apollo/client 4 | `provideApollo`, `SetContextLink`, declared default error policies, `notifyOnNetworkStatusChange: false` (Apollo 4 default changed), `completeData()` typing helper, `resultErrors()` for Apollo 4's `result.error`. |
| @ngx-translate 13 `TranslateModule` | common-angular `TranslateModule` shim (ngx-translate 18) | one root `TranslateService` with `provideTranslateHttpLoader`; `currentLang` → `getCurrentLang()`, `setDefaultLang` → `setFallbackLang`. |
| Bootstrap 4 + @nebular/bootstrap | Bootstrap 5 | class codemod (`ml-*`→`ms-*`, `float-left`→`float-start`, `badge-*`→`text-bg-*`, `.close`→`.btn-close`, ...) + `@theme/styles/bootstrap4-compat.scss` for `.form-group`, `.form-row`, `.media`, ... |
| ng-bootstrap `ngbRadioGroup` / `ngbButton` (removed in ng-bootstrap 15) | plain Bootstrap toggle buttons | store order filters. |
| ionicons 5 (no icon font) | ionicons 4.6.3 CSS font | the templates use `ion-md-*` classes, which only ionicons 4 ships (they rendered as nothing before). |
| socicon, roboto-fontface/typeface-exo | socicon removed (unused); fonts kept (already latest) | |
| Karma/Jasmine, Protractor, tslint/codelyzer, Storybook 6, @angular-builders/custom-webpack, rxjs-compat, jquery, core-js/intl polyfills, **pm2** + connect static server (`app.ts`, `pm2bootstrap.ts`, `start:server:*` scripts, `WEB_CONCURRENCY` / `WEB_MEMORY` env keys) | Vitest, Playwright (`e2e/tests/admin`), `scripts/serve-build.ts` | Storybook was removed, not upgraded. No PM2 anywhere (owner rule): production is the nginx image. |

## Decisions and notes

- **Change detection.** Angular 22 defaults to zoneless + OnPush. The app keeps Zone.js
  (`provideZoneChangeDetection()` in `AppModule`) and the v22 `change-detection-eager` migration put
  `ChangeDetectionStrategy.Eager` on all components. New components must set it too.
- **v22 migrations** ran (`ng update @angular/core --migrate-only --from=21 --to=22.3`) with the
  `tsconfig.base.json` inlined for the run: eager CD, `withXhr`, `$safeNavigationMigration` in 16
  templates. `strictTemplates` stays off.
- **Nebular 17 on Angular 22.** Nebular 17 declares Angular ^21; `peerDependencyRules.allowedVersions`
  in `pnpm-workspace.yaml` allows 22. Its partial-Ivy bundle links fine, except one import:
  `@angular/cdk/collections` 22 dropped `_VIEW_REPEATER_STRATEGY` (only `NbTable` / `NbTreeGrid` use
  it). `patches/@nebular__theme@17.0.0.patch` (pnpm `patchedDependencies`) defines the token locally.
  **Workspace-level files:** `patches/` and the `patchedDependencies` entry are outside the lane
  scope; please keep them at merge.
- **Unit tests run JIT** (`build:test` configuration with `aot: false`) so that `TestBed` declarations
  and `NO_ERRORS_SCHEMA` work as before; the app builds AOT.
- **Shared code deps.** The admin compiles common/common-angular from source, so their runtime
  imports (`socket.io-client`, `uuid`, `jsbarcode`, `lodash`) are admin dependencies too (Vite's dev
  server resolves them from the app root).
- **Removed dead code**: 115 unreachable files (ngx-admin demo pages, stories, duplicates).
- **App start without the API / Google.** `ServerSettingsService` and the new Maps loader settle on
  failure, so the app reaches the "server down" page instead of hanging.
- **Build output** is `dist/` (flat, `outputPath.browser: ''`), which `e2e/serve-apps.mjs`, CI and
  the Docker image use. Initial bundle 3.74 MB raw / ~460 kB transferred; budgets: initial 6 MB warn /
  10 MB error, component styles 10 kB / 60 kB.
- **Docker** (`.deploy/admin-web-angular/Dockerfile`): `node:26-alpine` + `npm i -g pnpm@12.23.0`,
  `pnpm fetch` + offline `pnpm install --filter @ever-platform/admin-web-angular...`, `IS_DOCKER=true`
  build writes `DOCKER_<KEY>` placeholders that the unchanged entrypoints replace; `nginx:alpine`
  serves `dist/`. `Dockerfile.dockerignore` keeps node_modules and build output out of the context.

## Held back

| What | Why |
| --- | --- |
| ionicons 4.6.3 (latest 8.1) | ionicons 5+ has no CSS icon font; the templates use `ion-md-*` classes in ~45 files. Moving to eva / Nebular icons would touch every screen. |
| graphql 16.15 (latest 17.1) | core lane: `@apollo/server` 5 rejects 17. Clients follow the server. |
| TypeScript 6.0 (7 is out) | Angular 22 needs `>=6.0 <6.1` (foundation decision). |
| Google Maps Drawing library | Google deprecated `google.maps.drawing` (gone from `@types/google.maps`); the delivery-zone drawing still calls it untyped. If Google has switched it off, delivery zones need a Terra Draw rewrite. |
| Old Google Maps services (DirectionsService, DistanceMatrix) | deprecated by Google but still working (console warnings only). |

## Integration notes

- **No PM2** (owner rule, license): the Docker image builds the static bundle and serves it with
  nginx (`ENTRYPOINT ["./entrypoint.prod.sh"]` ends with `exec "$@"`, `CMD ["nginx", "-g", "daemon off;"]`).
  No secret defaults: `GOOGLE_MAPS_API_KEY` defaults to `''` and comes from the environment.

- Merged `origin/feat/latest-stack` (core API, `assignRaw` entity fix, `_<id>_complete` socket fix,
  graphql 16). `pnpm-workspace.yaml` keeps the admin entry, the Nebular `peerDependencyRules`, the
  Vitest `minimumReleaseAgeExclude` lines and `patchedDependencies`.
- Subscriptions use graphql-ws with `connectionParams: { authorization: 'Bearer <jwt>' }`, as the
  core lane documents.

## Tests

- **Unit (Vitest)**: 13 files / 82 tests: GraphQL services (stores, products, categories,
  customers, carriers, invites, orders), auth strategy, `AdminAuthGuard`, `AppModuleGuard`, `Store`,
  the smart-table settings mapper and wrapper component, toaster, wizard, Apollo links, Maps loader,
  form helpers, plus the ported `CarrierOrdersStatusComponent` (7 tests from the fleet fix) and
  `ElapsedTimeComponent` specs. `node --test scripts/` covers the environment generator.
- **e2e (Playwright, `e2e/tests/admin`)**: app-shell smoke (passes with or without the API), sign
  in / wrong password / signed-out redirect, every main screen (dashboard, menu, 6 tables, orders,
  setup, profile, simulation), stores create (wizard) / edit / delete, category + product create
  and product page, invites inline editor, customers and carriers pages. Specs that need the API
  skip themselves when it is not reachable. Inline invite creation geocodes through Google, so it
  only runs with `E2E_GOOGLE_MAPS=1` (an admin build with a working Maps key).

Last verification (after merging `origin/feat/latest-stack`, core lane API on :5500/:8443/:2086):
`pnpm typecheck` 0 errors; `pnpm test` 13 files / 82 tests + 3 node:test passed; `pnpm build`
OK (3.74 MB initial, 459 kB transferred); Playwright `--project=admin` against `dist/` served
statically: 27 passed, 1 skipped (the Maps-key invite create). Dockerfile: `docker build --check`
passes (only the SecretsUsedInArgOrEnv heuristic on the password charset); the full image build was
not run on the shared PC (memory).
