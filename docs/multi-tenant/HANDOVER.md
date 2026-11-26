# Ever Demand multi-tenant: handover

Last updated: 2026-11-26 ~17:00 CET by the multi-tenant session. Update this after every milestone, then commit and push.

## State

- Branch `feat/multi-tenant` (worktree `C:\Coding\Worktrees\ever-demand-multi-tenant`), based on `feat/latest-stack`
  (PR #1660, open). Merge `develop` in once #1660 merges.
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
| Client tenant resolution + socket handshake `auth` | `packages/common-angular/src/lib/tenant.ts`, `socket.service.ts` | typecheck |

Tests: core unit **658/658**, single-tenant API e2e **49/49** (`test:e2e`), multi-tenant isolation e2e **34/34**
(`test:e2e:mt`). Mutation check: with read filtering disabled, 12 of the 34 fail.

### Still to do

1. Admin app: signup page, tenant settings, billing, members, super-admin tenant switcher (Playwright).
2. Client apps: tenant config + `Tenant-Id` / socket `auth` in shop-web-angular, shop-mobile-ionic, merchant,
   carrier, shop-web-gatsby, shop-mobile-expo, shop-mobile-flutter.
3. Full verification (every package's tests and builds, Playwright incl. a multi-tenant project), then the PR.

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
