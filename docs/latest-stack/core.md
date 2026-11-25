# Core lane (packages/core): latest stack notes

Branch `feat/latest-stack-core`, cut from `feat/latest-stack` at `e3e00b80`.

## For the client lanes (read this first)

| Topic | Decision |
| --- | --- |
| `graphql` major | **16** (`^16.15.0`). `@apollo/server` 5 peers only `graphql ^16.11.0`, so 17 is out. Every other package in the chain accepts 16: `@nestjs/graphql` 14 and `@nestjs/apollo` 14 (`^16 \|\| ^17`), `graphql-ws` 6, `@graphql-tools/*`, `apollo-angular` 14 and `@apollo/client` 4 (`^16 \|\| ^17`). Clients: `graphql@^16.15.0`. |
| GraphQL over HTTP | `POST http://<host>:8443/graphql` (env `GQLPORT`), JSON body. Apollo Server 5 keeps CSRF prevention on: use POST with `content-type: application/json` (apollo-angular does). GET is only the GraphiQL landing page. Validation errors answer HTTP 400 (Apollo 5), resolver errors 200 with `errors`. |
| Subscriptions | **graphql-ws** protocol at `ws://<host>:2086/subscriptions` (env `GQLPORT_SUBSCRIPTIONS`), served by core on its own port. Apollo: `new GraphQLWsLink(createClient({ url }))` from `@apollo/client/link/subscriptions` + `graphql-ws`. `subscriptions-transport-ws` is gone. Queries and mutations work over that socket too. |
| Auth header | HTTP: `Authorization: Bearer <jwt>`. graphql-ws: put the token in `connectionParams`: `{ authorization: 'Bearer <jwt>' }` (`Authorization` and a bare token work too); resolvers see it as the same `req.headers.authorization`. |
| socket.io "pyro" RPC | unchanged protocol, socket.io server 4.8 on `SERVICES_ENDPOINT` (`http://<host>:5500`, HTTPS `2087`). It now sends CORS headers (`origin: true, credentials: true`, like the express routes), so browser apps on other origins can use the polling transport. |
| Entity ids over socket.io | Entities arrive as JSON: they carry `_id`; the `id` getter of the common entity classes exists only after `new Entity(raw)` on the client (as before). |
| Schema | Unchanged (backward compatible). Nuance found while testing: `orders(findInput: OrdersFindInput)` requires `warehouseStatus` and `carrierStatus` (both `Int!`), and its `user` field can not match (Order.user is an embedded user). `getCloseMerchants` lists only stores in `inStoreMode`. |
| Default admin | `admin@ever.co` / `admin`, created on first boot. |

## What changed

### Versions (all latest on the registry, 2026-11-25)

| Package | Before | Now |
| --- | --- | --- |
| Node | 16 | 26.13.1 (`engines >=26.13.1`) |
| TypeScript | 4.5 | 6.0.3 |
| @nestjs/common, core, platform-express, testing | 8 | 12.6.2 |
| @nestjs/cqrs / passport / swagger / typeorm | 8 / 8 / 5 / 8 | 12.1.3 / 12.0.2 / 12.1.2 / 12.0.3 |
| @nestjs/graphql + @nestjs/apollo | 9 (apollo-server-express 3) | 14.2.1 + 14.2.1 (`ApolloDriver`) |
| @apollo/server + @as-integrations/express5 | - | 5.5.2 + 1.1.2 |
| graphql | 15.7 | 16.15.0 |
| graphql-ws / graphql-subscriptions / ws | - / 2 / 8.3 | 6.4.3 / 3.1.0 / 8.23.0 |
| express / helmet / cors | 4 / 4 / 2.8 | 5.3.0 / 8.3.0 / 2.8.6 |
| mongoose / mongodb | 6 / 4 | 9.13.1 / 7.9.1 |
| typeorm | 0.2 | 1.1.3 (`DataSource`) |
| socket.io (+ client, dev) | 4.3 | 4.8.4 |
| stripe | 8 | 23.2.0 (API version pinned, see below) |
| inversify | 6 | 8.3.0 |
| passport / passport-jwt / -google-oauth20 / -facebook | 0.5 / 4.0 / 2 / 3 | 0.7.0 / 4.0.1 / 2.0.0 / 3.0.0 |
| jsonwebtoken / bcrypt | 8 / 5 | 9.0.3 / 6.0.0 |
| envalid / dotenv | 7 / 10 | 9.0.0 / 18.0.10 |
| uuid / date-fns (replaces moment) | 8 / - | 14.0.3 / 4.4.0 |
| @faker-js/faker (replaces faker 5) | - | 10.6.0 |
| class-validator / class-transformer | 0.13 / 0.4 | 0.15.1 / 0.5.1 |
| @aws-sdk/client-cloudwatch-logs (replaces bunyan-cloudwatch + aws-sdk v2) | - | 3.1178.0 |
| express-handlebars / express-session / handlebars | 5 / 1.17 / 4.7 | 9.0.6 / 1.19.0 / 4.7.10 |
| axios / lodash / underscore / rxjs / reflect-metadata | 0.23 / 4.17 / 1.13 / 7.4 / 0.1 | 1.21.1 / 4.18.1 / 1.13.8 / 7.8.2 / 0.2.2 |
| jest / ts-jest / supertest | 26 / 26 / 6 | 30.5.2 / 29.4.15 / 7.3.2 |

### Removed (checked with grep: no import, or replaced)

apollo-server-core/-express/-fastify, graphql-playground-middleware-express,
subscriptions-transport-ws, graphql-tools, @graphql-tools/* (only dead code used them; kept as
devDependencies for two specs), @nestjs/microservices, @nestjs/jwt, @nestjs/terminus,
@nestjs/websockets, @nestjs/platform-socket.io, @nestjs/cli, @nestjs/schematics,
@nestjsx/crud*, nest-router, @ntegral/nestjs-sentry, @sentry/node, @sentry/tracing,
@grpc/grpc-js, kafkajs, mqtt, nats, redis, mysql, pg, pg-query-stream, sqlite3, sql.js,
typeorm-aurora-data-api-driver, typeorm-express-query-builder, aws-sdk, multer-s3,
bunyan-cloudwatch, request, request-promise (native `fetch`), bluebird (`Promise.all`),
moment (date-fns), faker (@faker-js/faker), mkdirp (`fs.mkdirSync`), chalk (`util.styleText`),
source-map-support (`process.setSourceMapsEnabled`), pm2 + `pm2bootstrap.ts` (not used by
the Dockerfile; `node build/main.js`), body-parser (express 5 built-ins), concurix, cryptiles,
fstream, symbol, symbol-observable, install, rxjs-compat, fastify-swagger, fast-json-stringify,
csurf, cookie-session, connect, destroy, etag, on-finished, event-stream, cli-ux, cli-color, cls-hooked, core-decorators, archiver, unzipper, pdfmake, mjml, csv-*,
currency.js, image-size, lodash.template*, ms, nestjs-i18n, node-fetch,
cross-fetch, nodemailer, nodemailer-handlebars, email-templates, cache-manager, sharp,
slugify, swagger-ui-express, typescript-collections, underscore.string, unleash-client,
upath, validator, web-push, yargs, mongodb-memory-server, the whole webpack build,
tslint, nodemon, every `@types/*` of a removed package or of a package that ships its types.
Dead code removed: `src/controllers/auth/*` (never imported; hard-coded JWT secret),
`pm2bootstrap.ts`, the manual Apollo server/schema code in `app.module.ts`, two
commented-out "integration" specs that failed Jest (empty suites).

Not added although on the original target list, because nothing in core uses them:
nodemailer, email-templates, cache-manager, @sentry/node / @sentry/nestjs, sharp,
@aws-sdk/client-s3, @nestjs/jwt, @nestjs/terminus, @nestjs/websockets,
@nestjs/platform-socket.io, @nestjs/cli, @nestjs/schematics.

### Build, TypeScript, tests

- `tsc` builds to `packages/core/build` (`node build/main.js`); webpack is gone.
  `tsconfig.json`: `module`/`moduleResolution` `nodenext` (CommonJS output), no `baseUrl`,
  paths `@pyro/db-server`, `@pyro/io` -> `./src/@pyro/*`, `@pyro/*` -> `../common/src/@pyro/*`,
  `@modules/server.common/*` -> `../common/src/*` (typecheck, IDE, Jest).
  `tsconfig.build.json` maps the same aliases to `.common-types/`, declarations of common
  generated by the build (`tsc -p ../common/tsconfig.build.json --declaration
  --emitDeclarationOnly --outDir .common-types`), because common's sources are outside
  core's `rootDir`. Common itself is untouched.
- At runtime `main.ts` maps the aliases with module-alias to `packages/common/build`
  (absolute paths: with pnpm, `@ever-platform/common` resolves only from core).
- Nest 12, inversify 8, uuid 14, faker 10 and envalid 9 ship only ES modules; core stays
  CommonJS and loads them with Node's `require(esm)`. Jest 30 supports that natively when
  Node runs with `--experimental-vm-modules` (set by the `test` scripts), so no transform of
  node_modules is needed.

### Behaviour notes and fixes found by booting / e2e

- **Order creation was broken** (every `createOrder` / `warehouse-orders.create` and every
  stock change): `WarehousesProductsService.saveUpdated` and `WarehousesService._save` wrote
  the populated Product object into the `product` ref (Mongoose 9 refuses it), and replacing
  `products.$` whole makes Mongoose 7+ add `products.$._updatedAt` (MongoDB: "would create a
  conflict"). Fixed: the product id is written (what the 2019 code did, before a 2021 build
  fix turned that line into a no-op) and the element is updated field by field. Regression
  specs: unit (`WarehousesProductsService.saveUpdated.spec.ts`,
  `WarehousesService.protectedFields.spec.ts`) and e2e (order create -> stock decremented,
  cancel -> stock back).
- Mongoose: `strictQuery` is set to `true` at boot, the Mongoose 6 default (Mongoose 7+
  defaults to false), so filters with unknown paths match the same documents as before.
  `remove`/`findByIdAndRemove`/`update(..., {multi})` -> `deleteMany`/`findByIdAndDelete`/
  `updateMany`; `removeUserOrders` now reports `matchedCount`/`modifiedCount` (it returned
  undefined since Mongoose 6). `removeMultipleByIds` now waits for the write.
- TypeORM 1: `createConnection`/`getConnection` -> one `DataSource` shared by the inversify
  repositories (`helpers/typeorm.ts`); `TypeOrmModule.forRoot` uses the same options.
  TLS options are `tls`/`tlsCAFile` (driver 7), for both mongoose and TypeORM.
- GraphQL: `ApolloDriver`, schema-first `typePaths: ['./**/*.graphql']`, resolvers unchanged.
  The landing page is GraphiQL (Apollo 5 has no Playground), served without helmet's CSP so
  its CDN scripts load; every other route keeps the default CSP.
  The `deviceCreated` subscription returned `{ subscribe }` instead of an async iterator, so
  it never worked; it now returns `pubSub.asyncIterableIterator(...)` (graphql-subscriptions 3).
- Subscriptions: `SubscriptionsModule` starts a graphql-ws server (`graphql-ws/use/ws`) on
  `GQLPORT_SUBSCRIPTIONS` with Nest's schema once the app has bootstrapped.
- inversify 8: `ContainerModule(({ bind }) => ...)`, `ResolutionContext.get`,
  `LazyServiceIdentifier`; the multi-bindings are `toDynamicValue` (they returned the service
  from `toFactory`); every constructor parameter needs `@inject` (the optional `CommandBus`
  of `UserCommandService`).
- Stripe 23: default export, client created on first use (Stripe 23 refuses the empty
  default key, which used to work until the first call), **API version pinned to
  `2020-08-27`** (`helpers/stripe.ts`): the card (customer sources), charge and refund flows
  and the recent fleet fixes read objects of that version. Moving to a newer API version is
  a separate change that must re-check those objects. All payment specs pass unchanged
  except their `jest.mock('stripe')` shape (default export).
- envalid 9: unchanged validators; it prints its report and an "Exiting" line separately.
- Logs: the boot log no longer dumps `process.env` (it wrote every secret into the logs).
  CloudWatch (production only) uses a small bunyan stream on `@aws-sdk/client-cloudwatch-logs`
  (`helpers/cloudwatch-stream.ts`, with specs) instead of bunyan-cloudwatch / aws-sdk v2.
- Urban Airship push (invite launch) uses native `fetch` instead of request-promise.
- `JwtStrategy.validate` returns the user / throws `UnauthorizedException` instead of calling
  `done` itself (Nest's PassportStrategy called `done` a second time).

## How to run

```sh
export PATH="/c/nvm/v26.13.1:$PATH"        # Node 26.13.1, pnpm 12.23.0
pnpm install --filter "@ever-platform/core..."
pnpm --filter @ever-platform/common build    # core runs on common's build output
pnpm --filter @ever-platform/core typecheck
pnpm --filter @ever-platform/core build      # -> packages/core/build
pnpm --filter @ever-platform/core test       # unit specs (Jest 30, --maxWorkers=1)

# API e2e (Jest + supertest + socket.io-client + graphql-ws) against a real MongoDB
pnpm --filter @ever-platform/core db:test:up # Docker mongo:8 "ever-demand-core-mongo" on 127.0.0.1:27018
pnpm --filter @ever-platform/core test:e2e   # boots build/main.js on ports 15500/12087/18443/12086
pnpm --filter @ever-platform/core db:test:down

# Run the API (default ports 5500 / 2087 / 8443 / 2086); from packages/core
DB_URI=mongodb://127.0.0.1:27018/ever_development DB_PORT=27018 FAKE_DATA_GENERATOR=true node build/main.js

# Playwright API specs (e2e/tests/api) against a running API on the default ports
pnpm --filter @ever-platform/e2e test:api
```

Note: the API reads `DB_NAME` (default `ever_development`) as the database name for both
Mongoose and TypeORM, whatever the path of `DB_URI` says (unchanged behaviour).

Docker: `.deploy/api/Dockerfile` (node:26-alpine, `npm i -g pnpm@12.23.0`, frozen pnpm install
filtered to core + common, tsc builds, production stage with prod dependencies only, runs
`node build/main.js` from `/srv/ever/packages/core`; `pm2-runtime` is gone, the orchestrator
restarts the container). `.deploy/api/Dockerfile.dockerignore` keeps the context to common +
core and keeps host `node_modules` out (a copied pnpm symlink farm breaks the image install).
Build with `--pull`, so `node:26-alpine` is the current 26.x (a stale local 26.13.0 only warns
about `engines >=26.13.1`). Inside the ever-co network add
`--build-arg VERDACCIO_REGISTRY=http://host.docker.internal:4873/`.
`docker-compose.yml` api service: `/entrypoint.compose.sh`, `node build/main.js`.

## Verification (2026-11-25)

- typecheck: `tsc -p tsconfig.json --noEmit` clean; build: clean.
- unit: 55 suites, 577 tests pass (the original specs plus new ones for the order-create
  regression, graphql-ws server and context, CloudWatch stream, TypeORM and Stripe helpers).
- e2e (Jest, real MongoDB 8): 5 suites, 49 tests pass.
- Playwright API project against the API booted on the default ports: 19 passed.
- Boot: API up in ~10 s against mongo:8 with `FAKE_DATA_GENERATOR=true`; admin login,
  GraphQL queries, socket.io handshake, graphql-ws upgrade-only port answered.
- Docker: image built from `.deploy/api/Dockerfile` and run against mongo:8: healthcheck
  healthy, `/api/health` ok, admin login, socket.io handshake, graphql-ws port, self-signed
  HTTPS on 2087.

## Held back / open

- TypeScript 7: held back repo-wide (ts-jest needs `<7`, Angular 22 needs `<6.1`).
- `graphql` 17: blocked by `@apollo/server` 5 (`peer graphql ^16.11.0`).
- Stripe API version stays `2020-08-27` on purpose (see above); the SDK is 23.2.0.
- The `Observable.toPromise()` calls (deprecated in rxjs 7) are left as they are: rxjs 7.8.2 is the latest and still has it.
