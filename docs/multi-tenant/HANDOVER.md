# Ever Demand multi-tenant: handover

Last updated: 2026-11-26 ~21:30 CET by the multi-tenant session. Update this after every milestone, then commit and push.

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

Tests (2026-11-26, after the develop merge): core unit **706/706**, single-tenant API e2e **50/50** (`test:e2e`),
multi-tenant isolation e2e **41/41** (`test:e2e:mt`); admin 134, shop-web 118, shop-mobile-ionic 318, merchant 54,
carrier 69 (Vitest); Expo 195 (Jest), Gatsby 75, Flutter 216 (before the merge, untouched by it). Mutation check:
with read filtering disabled, 12 of the 34 isolation specs of that time failed.

### Security review (independent reader, 2026-11-26)

Fixed: socket.io listeners were open to anyone naming a tenant (now default deny); `stripeCustomerId` was
client-writable (now server-only); REST product create was open; staff could manage members; an admin could edit the
owner's login email; anyone could remove a super-admin; signup rate limit behind a proxy (`TRUST_PROXY`);
`currentTenant` showed billing to shops. Still open (follow-ups): customer flows have no ownership checks inside a
tenant (any caller can act on a customer by id, as before); tokens never expire (a removed admin's token still passes
token-argument checks); plan limits can be exceeded by parallel creates; admin / tenant caches are 30 s per process.

### Still to do

1. Full Playwright run on the final branch (all projects, single- and multi-tenant API), then the PR to `develop`.
2. Follow-ups: Stripe Connect (tenants' own card payments), customer ownership checks, token expiry, email
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

`MULTI_TENANT`, `TENANT_BASE_DOMAIN`, `TENANT_SIGNUP_ENABLED` (default = MULTI_TENANT), `TENANT_SIGNUPS_PER_HOUR`,
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
- Long heredocs in the Bash tool fail with "unexpected EOF": write scripts to the scratchpad and run them.
- `RoutersService.reconnectAll` must close each engine.io connection once: a namespace DISCONNECT + CONNECT back to
  back makes the socket.io server drop the whole client ("invalid state").
- With a login token the socket handshake sends only the token (a kept `?tenant=` of another tenant would be refused);
  the admin app's super-admin switch sets `tenantWithToken` and `buildOnly`.
- Deploy: the admin image replaces `DOCKER_TENANT_BASE_DOMAIN`; the shop / merchant / carrier images take `TENANT` and
  `TENANT_BASE_DOMAIN` build args (white-label builds).
