# Ever Demand multi-tenant: handover

Last updated: 2026-11-27 ~22:00 CET by the multi-tenant session. Update this after every milestone, then commit and push.

## State

- Branch `feat/multi-tenant` (worktree `C:\Coding\Worktrees\ever-demand-multi-tenant`). `develop` (5c2a3835, #1660
  merged) is merged in (43ae566b); the PR goes against `develop`.
- Owner answers (2026-11-26, relayed by the lead session): customers **per tenant**, a **separate storefront per
  tenant**, **every tenant-resolution variant** (subdomain, `Tenant-Id` header, white-label build). DESIGN.md §10
  questions 4-10 are built with the recommended answers until the owner says otherwise.

### Done (core API), all green

| Piece | Where | Evidence |
| --- | --- | --- |
| Tenant entity, `tenantId` on 11 entities, per-tenant indexes | `packages/common/src/entities`, `@pyro/db/tenant.ts`, `CompoundIndex` | common builds |
| Tenant context (AsyncLocalStorage) | `packages/core/src/tenant/tenant-context.ts` | unit specs |
| Fail-closed Mongoose tenant plugin (queries, writes, aggregations incl. `$lookup` / `$geoNear`) | `tenant/tenant-plugin.ts`, registered in `main.ts` | 41 unit specs |
| DBService explicit filters + `beforeCreate` hook; existence streams = `TenantScopedSubject` | `@pyro/db-server/db-service.ts`, `tenant/tenant-scoped-subject.ts` | e2e streams specs |
| Resolution: token > header / socket `auth.tenant` > Host / Origin sub-domain > default (single-tenant) | `tenant/tenant-resolver.ts`, `tenant-http.middleware.ts`, `tenant-socket.ts`, graphql-ws `onConnect` | e2e |
| Migration 0001 (default tenant, backfill, unique indexes per tenant, production backup gate) | `packages/core/src/migrations` | runs at boot; e2e boots on it |
| Logins: tokens carry `tenantId`; admin email / store + carrier usernames global; customers per tenant | `services/auth/AuthService.ts`, `AdminsService` | e2e |
| Default-deny GraphQL guard + one access table for all operations | `graphql/access/` | unit spec keeps the table complete |
| TypeORM Admin / Device repositories tenant-scoped | `tenant/tenant-repository.ts` | typecheck |
| Signup, tenant settings, members + roles, super-admin list / status | `services/tenants/TenantsService.ts`, `graphql/tenants/` | e2e |
| Plans + limits (members, stores) | `tenant/plans.ts`, `tenant/plan-limits.ts` | e2e |
| Stripe Billing: Checkout, portal, signed idempotent webhook `POST /api/billing/webhook` | `services/billing/BillingService.ts`, `controllers/billing` | e2e (signed locally, no network) |
| Client tenant resolution + socket handshake `auth` | `packages/common-angular/src/lib/tenant.ts`, `socket.service.ts` | app specs |
| Default-deny socket.io access (every listener) and REST controllers | `@pyro/io/access/socket-access.ts`, `graphql-access.guard.ts` | unit spec keeps the table complete; e2e |
| Admin app: signup, settings (tenant, billing, members), super-admin switcher | `packages/admin-web-angular/src/app/pages/+signup`, `+settings`, `@core/tenant` | 134 Vitest, Playwright multi-tenant |
| Shops, merchant, carrier send their tenant | each app's env + Apollo link + `CommonModule.forRoot` / socket auth | each app's tests |

Tests (2026-11-26, after the develop merge): core unit **712/712**, single-tenant API e2e **51/51** (`test:e2e`),
multi-tenant isolation e2e **48/48** (`test:e2e:mt`, twice in a row); admin 134, shop-web 118, shop-mobile-ionic 318, merchant 54,
carrier 69 (Vitest); Expo 195 (Jest), Gatsby 75, Flutter 216 (before the merge, untouched by it). Mutation check:
with read filtering disabled, 12 of the 34 isolation specs of that time failed.

Playwright (all projects, built apps on a single-tenant API, plus the `multi-tenant` project on a multi-tenant API):
multi-tenant 4/4; api 19, merchant 8, carrier 8 all green. The first run found one branch regression: the shops'
sign-up by address calls `invite.create` without a login, and the socket table had made it admin-only (4 shop
failures). Fixed in dbcccb43 (public while invites are off, admin-only for invite-only shops); the 4 tests and the
shop-web language test (flake fixed in c81953a3) pass on the re-run. Not caused by this branch, same on develop:
admin `people.spec.ts:12` crashes when the first customer has a store nearby (angular2-smart-table 4 stringifies
the `actions` cell, so `WarehouseOrderComponent.renderValue` reads `.actionName` of a string).

### Security review (independent reader, 2026-11-26)

Fixed: socket.io listeners were open to anyone naming a tenant (now default deny); `stripeCustomerId` was
client-writable (now server-only); REST product create was open; staff could manage members; an admin could edit the
owner's login email; anyone could remove a super-admin; signup rate limit behind a proxy (`TRUST_PROXY`);
`currentTenant` showed billing to shops.

Greptile on #1668 (fixed in 2567eba6, threads answered and resolved): open socket.io / graphql-ws connections kept
the access of a removed admin or suspended tenant (now re-checked per call and every `TENANT_ACCESS_RECHECK_MS`,
then disconnected); new tenants could charge cards on the platform Stripe account (now platform tenant only,
`tenant/card-payments.ts`); duplicate Checkouts, webhook events lost on a crash, old events overwriting newer billing
(one open Checkout, `processing`/`done` events, state always read from Stripe); a switched super-admin was logged
out on reload (`TenantContext.runForOwnAccount`). The e2e suite runs billing against `test/e2e/fake-stripe.ts`.

Independent security review of #1668 (2026-11-27, at 2d425c23), fixed on this branch with tests:
- HIGH: `@ResolveField`s (`Warehouse.orders/users/carriers/devices`, `User.devices`, `Carrier.devices`) skipped the
  access guard, so a public store lookup listed a tenant's orders and customer contacts. Now
  `GRAPHQL_FIELD_ACCESS` + `fieldResolverEnhancers: ['guards']` (a store reads its own record only).
- MEDIUM: store / carrier / customer tokens are checked against their account like admin tokens (deleted, banned,
  or in another tenant = no login); removals and bans clear the 30 s account cache (`tenant/account-cache.ts`).
- MEDIUM: logins take exact strings only (no `{ $regex }`), look only in the request's tenant when it names one, and
  a login is blocked for 15 min after 10 wrong passwords (`services/auth/login-throttle.ts`, per process).
- MEDIUM: the first admin is no longer a platform super-admin. Only `SUPER_ADMIN_EMAIL` is, set at every boot
  (`services/admins/super-admin.ts`), and never while that admin still has the default password "admin".
- LOW: a `$unionWith` on a global collection and aggregations on global collections now scope their tenant reads.
  Still to note: a kept `?tenant=` link (shop-web-gatsby, Expo web, common-angular) wins over the host; revisit when
  custom domains come (a tenant's own domain should win).
Creates from the socket API drop server-side fields (`stripProtectedFields` on register / create paths). A caller's `_id` / `id` is dropped on creates too.

Re-review (at 81759342), fixed with tests:
- `SUPER_ADMIN_EMAIL` is looked up in the platform (default) tenant only (not deleted), and refused, without case, to
  signups and to admin registrations or email changes in any other tenant (`assertMayUseAdminEmail`).
- The login throttle counts per client address (and per tenant for customers), so nobody can lock others out;
  client addresses come from X-Forwarded-For only behind `TRUST_PROXY` (its last entry).
- `devicesIds` of stores, carriers and customers is a guarded field like `devices`; GraphQL `device` and
  `updateDevice` are admin-only (a device holds its push channel). The shops create devices and change their
  language over socket.io, which cannot change a channel.
- Client addresses follow `TRUST_PROXY` (default `loopback, uniquelocal`) on every path, by Express' rule: X-Forwarded-For
  is read only through trusted proxies, from the right (`tenant/client-address.ts`). Behind a CDN, add its ranges (e.g.
  Cloudflare's) or the CDN edge counts as the client; a directly exposed API keeps the socket address.

Follow-ups from the final review (low, no code yet):
- An admin of the default (platform) tenant can rename their own login to an unused `SUPER_ADMIN_EMAIL` and becomes
  super-admin at the next boot (platform staff only).
- socket.io `warehouse.get`, `warehouse.getAllActive`, `carrier.get` and `device.get` still return `devicesIds` /
  `channelId` (read-only: sending a push needs the push provider's server key).
- Custom domains: the kept `?tenant=` link (shop-web-gatsby, Expo web, common-angular) wins over the host; a tenant's own
  domain should win once custom domains ship.
- Store and carrier usernames stay in the public types (the apps show them; the throttle is per address);
  `CarrierCreateInput.isDeleted` is accepted but ignored.
Still open (follow-ups): customer flows have no ownership checks inside a
tenant (any caller can act on a customer by id, as before); tokens never expire (a removed admin's token still passes
token-argument checks); plan limits can be exceeded by parallel creates; admin / tenant caches are 30 s per process.

### Still to do

1. PR to `develop`: [ever-co/ever-demand#1668](https://github.com/ever-co/ever-demand/pull/1668). Owner review; CI on GitHub is off (builds run in-cluster).
2. Follow-ups: the admin customer page crash above (develop bug), Stripe Connect (tenants' own card payments), customer ownership checks, token expiry, email
   verification, custom domains, social login in multi-tenant mode (tenant in the OAuth state), docs of the app env
   (`docs/latest-stack/*.md` still list the env without `TENANT*`).

## How to run

- Node 26.13.1: `export PATH="/c/nvm/v26.13.1:$PATH"`. pnpm 12.23.
- `pnpm --filter @ever-platform/common build`, then in `packages/core`: `pnpm build`, `pnpm test`,
  `pnpm test:e2e` (single-tenant), `pnpm test:e2e:mt` (multi-tenant; own DB `ever_core_e2e_multi_tenant`, ports
  15600 / 12187 / 18543 / 12186). Mongo: `pnpm db:test:up` (Docker `ever-demand-core-mongo`, port 27018).
- **The Mongo container is shared with the latest-stack lanes**: run e2e with your own `CORE_E2E_DB_NAME` and
  `CORE_E2E_*PORT` values so two suites never drop each other's database.

## Env (API)

`MULTI_TENANT`, `SUPER_ADMIN_EMAIL` (the platform super-admin; empty = none), `TENANT_ACCESS_RECHECK_MS` (30000),
`TENANT_BASE_DOMAIN`, `TENANT_SIGNUP_ENABLED` (default = MULTI_TENANT), `TENANT_SIGNUPS_PER_HOUR`,
`ADMIN_APP_URL`, `STRIPE_BILLING_SECRET_KEY`, `STRIPE_BILLING_WEBHOOK_SECRET`, `BILLING_TRIAL_DAYS` (90),
`BILLING_PAST_DUE_GRACE_DAYS` (14), `MIGRATION_BACKUP_CONFIRMED` (production only, after a `mongodump`).
No secret is in the repo; the e2e uses fixed test-only values.

## Traps found

- `mongoose.set('strictQuery', true)` drops filter fields missing from a schema: `tenantId` must be in every
  tenant schema (it is, via `@TenantId()`), or the filter would silently vanish.
- RxJS callbacks run in the AsyncLocalStorage context of whoever calls `next()`: live streams must capture the
  subscriber's tenant (`TenantScopedSubject`), and socket observables are subscribed in the call's context.
- `WarehousesService.register` calls `super.create`: plan limits live in `DBService.beforeCreate`, not in a `create`
  override.
- `createPromotion` returns `{ success, message, data }` in a `Promotion` shape and swallows validation errors
  (an old quirk, unchanged); `promotions` without `findInput.warehouse` returns nothing.
- `packages/core/.gitignore` ignores `**/*.js`: every new JS config needs its own `!` line
  (`jest.e2e-mt.config.js` was missing).
- Windows reserves port ranges (e.g. 51988-52187, see `netsh int ipv4 show excludedportrange protocol=tcp`): an API
  port there fails with `listen EACCES`.
- pyro observables: the client sends `<callId>_subscribe` right after the call, so its listener is set up in
  `receivedCall` (synchronously), not in the async `handleRequest` (which waits for the access re-check).
- Long heredocs in the Bash tool fail with "unexpected EOF": write scripts to the scratchpad and run them.
- `RoutersService.reconnectAll` must close each engine.io connection once: a namespace DISCONNECT + CONNECT back to
  back makes the socket.io server drop the whole client ("invalid state").
- With a login token the socket handshake sends only the token (a kept `?tenant=` of another tenant would be refused);
  the admin app's super-admin switch sets `tenantWithToken` and `buildOnly`.
- Deploy: the admin image replaces `DOCKER_TENANT_BASE_DOMAIN`; the shop / merchant / carrier images take `TENANT` and
  `TENANT_BASE_DOMAIN` build args (white-label builds).
