# Ever Demand multi-tenant SaaS: design

Status: **agreed on the three core questions** (owner, 2026-11-26, relayed by the lead session): customers per
tenant, a separate storefront per tenant, and every tenant-resolution variant supported (subdomain, header and
white-label build). The other questions in §10 use the recommended answer until the owner says otherwise. Branch
`feat/multi-tenant`, based on `feat/latest-stack` (PR #1660, still open).

## 1. Goal

Anyone can sign up at `app.everdemand.co`, on the free plan or a paid one, and get their own **tenant**: their own
stores (warehouses), products, categories, promotions, carriers, customers and orders. This works the way Ever Gauzy
works at `app.gauzy.co`: one deployment, many tenants, and every record carries a `tenantId`.

Self-hosted installs must keep working unchanged as one tenant (§3.9).

## 2. What the code does today (facts the design rests on)

| Area | Today | Where |
| --- | --- | --- |
| Tenancy | None. The only trace is `Tenant-Id` in the CORS allowed headers. | `packages/core/src/nest-bootstrap.ts:35` |
| Collections | 11 with their own collection: Admin, Carrier, Currency, Device, Invite, InviteRequest, Order, Product, ProductsCategory, Promotion, User, Warehouse. WarehouseProduct, OrderProduct, GeoLocation, PaymentGateway, ProductInfo and UserOrder are embedded sub-documents. | `packages/common/src/entities` |
| Data access | 27 Mongoose services extend `DBService`. Outside it there are 34 direct `X.Model.*` calls in 9 services and 34 more in the GraphQL resolvers (`insertMany`, `find`, a global `updateMany({}, {isDeleted:true})` in `data.resolver.ts`), 4 aggregations and 3 `$near` queries. | `@pyro/db-server/db-service.ts`, `services/**`, `graphql/**` |
| TypeORM | A second Mongo connection with repositories for the same entities; injected for Admin and Device. | `helpers/typeorm.ts`, `services/inversify.config.ts` |
| Live streams | Each service has one in-process `existence` Subject. `get(id)` / `getMultiple(ids)` filter it by id only and re-query on every event. | `db-service.ts` |
| Auth | One JWT secret, payload `{ id, role }`, role `admin` / `warehouse` / `carrier` / `user`, never expires. Every admin can see everything. | `services/auth/AuthService.ts` |
| GraphQL auth | **Of the 134 queries, mutations and subscriptions, 1 has a JWT guard** and a few store mutations check a `token` argument. 10 are gated only by the fake-data env flag. The rest are open, `registerAdmin` included. Today anyone who reaches `/graphql` can read every customer, order and store. | `graphql/**/*.resolver.ts` |
| Socket RPC | 27 routers, one socket.io namespace each (`/warehouse`, `/order`, ...), 130 listeners. Nothing is attached to the connection; a few calls take a `token` argument (merchant, carrier). Most customer flows are anonymous. | `@pyro/io/router/handler.ts`, `connection-handler.ts` |
| Unique indexes | `admins.email`, `users.email`, `warehouses.username`, `warehouses.barcodeData`, `carriers.username`, `carriers.email`, `currencies.currencyCode`; all global. | entities |
| Stripe | One platform key (`STRIPE_SECRET_KEY`) charges every customer's card for every store. | `helpers/stripe.ts`, `OrdersService`, `UsersService` |
| Shop discovery | The shop apps list stores and products near the customer, across the whole deployment. | `GeoLocationsWarehousesService`, `GeoLocationsProductsService` |

Prices already exist: the owner-approved ladder in `workspace/docs/billing/2026-10-pricing/TARGET-PRICING-SPEC.md` plus
its 2026-11-01 amendments, with Stripe lookup keys `ever_demand_cloud_{starter,small_business,enterprise}_{monthly,annual}`
(shown as Starter / Business / Unlimited). Demand Cloud is `coming_soon` on ever.co until this ships.

## 3. Decisions (recommended answers; the owner confirms in §10)

### 3.1 Customers are per tenant (owner: "keep per tenant")

A customer (`User`) belongs to exactly one tenant, and `email` is unique per tenant. The same person shopping at two
Demand businesses has two accounts, as with two Shopify shops.

- **Why:** tenants are separate businesses. Each one owns its customer list for GDPR (it is the controller), exports,
  marketing and deletion. A shared customer would mean shared addresses, saved cards and order history across
  businesses that never agreed to share them.
- **Rejected:** one global customer identity linked to many tenants. It needs a consent model and makes every customer
  query a join. It can be added later as "Sign in with Ever" (Ever Platform identity) without moving data.

### 3.2 Per-tenant storefront (owner: "separate per tenant"); a marketplace could come later as opt-in

A shop app shows **one tenant's** stores and products. The "nearby stores" query only sees stores of the resolved
tenant. A tenant with many stores (a franchise, or a local marketplace operator) still gets the nearby-stores
experience inside its own tenant, which is what the product does today.

- **Later (not MVP):** a public `everdemand.co` marketplace where tenants opt in (`settings.marketplaceListed`). It
  would be a separate read-only index. It is not a reason to weaken isolation.

### 3.3 How each app resolves its tenant (owner: "we need to support all variants")

Every variant works for every app: a subdomain, a `Tenant-Id` header (or socket handshake field) and a white-label
build-time id. A client sends whatever it knows, and the server applies one precedence. The server decides the
tenant for each request, in this order:

1. **JWT claim `tenantId`** (every login token carries it). It always wins.
2. **`Tenant-Id` header** (HTTP and GraphQL), or **`auth.tenant`** in the socket.io handshake. It holds a tenant slug or id.
3. **Subdomain:** `<slug>.everdemand.co` of the request's `Host` (API served on the tenant's host), else of its
   `Origin` (a page on `<slug>.everdemand.co` calling `api.everdemand.co`). Custom domains in `Tenant.domains` later.
4. Nothing resolved: **reject** in multi-tenant mode. In single-tenant mode (self-hosted), use the default tenant.

Rules:

- A logged-in non-super-admin whose header names another tenant gets **403**.
- Only a platform super-admin token may switch tenant with the header.

| App | How it gets its tenant |
| --- | --- |
| admin-web-angular (`app.everdemand.co`) | From the login token. Super-admin: tenant switcher, sends `Tenant-Id`. |
| shop-web-angular, shop-web-gatsby | Subdomain `<slug>.everdemand.co`, read at runtime. Dev: `?tenant=` or env `TENANT`. Sent as `Tenant-Id` + socket `auth.tenant`. |
| shop-mobile-ionic, shop-mobile-expo, shop-mobile-flutter | **White-label build-time `TENANT`** (app config / env), sent as `Tenant-Id` + socket `auth.tenant`. A tenant ships its own branded app. The Ionic shop also runs as a web build, where the subdomain applies. |
| merchant-tablet-ionic, carrier-mobile-ionic | From the login token (see 3.5). Before login they send build-time `TENANT` or the subdomain when set. |

Client order, the same in every app: a build-time `TENANT` wins, then the `<slug>` of a `<slug>.<TENANT_BASE_DOMAIN>`
page host, then a `?tenant=` query (dev), else nothing (the server then applies its own fallback). The server
resolves a slug or an id in the header the same way.

### 3.4 Roles

| Role | Scope | Can |
| --- | --- | --- |
| `owner` | one tenant | everything, plus billing, plan, deleting the tenant, managing admins. Exactly one per tenant (transferable). |
| `admin` | one tenant | everything in the tenant except billing and tenant deletion |
| `staff` | one tenant | read everything; manage orders, products and stock. No settings, no members, no billing. |
| super-admin | platform | flag `isSuperAdmin` on an Admin of the platform tenant. Lists all tenants, switches into any of them (audited), suspends tenants. |
| `warehouse`, `carrier`, `user` | one tenant | unchanged (store tablet, courier, customer) |

The admin app's GraphQL operations get a **default-deny guard**: an operation needs an admin token of the tenant
with a sufficient role, unless it is marked `@Public()` (storefront reads and customer self-service). This is
required: without it, tenant isolation only moves today's "anyone reads everything" down to "anyone reads
everything of tenant X".

### 3.5 Logins: staff accounts stay globally unique; customers are per tenant

- `Admin.email`, `Warehouse.username` and `Carrier.username` stay **globally unique**. Login needs no tenant: the
  tenant comes from the account and goes into the token. The merchant and carrier apps need no new login field.
  The only cost is a "username taken" message when another tenant already uses the name.
- `User.email`, `Warehouse.barcodeData`, `Carrier.email` and every other unique key become **compound
  `{ tenantId, key }`**.
- **MVP:** one Admin account belongs to one tenant. One email in several tenants (a membership table, then a tenant
  picker at login) comes later.

### 3.6 Plans and limits

The owner's rule: plans are priced by **members and usage, never by features**. Every plan has every feature.

| Plan | Price (cloud) | Members included | Extra member | Trial |
| --- | --- | --- | --- | --- |
| Starter | $0 | 15 | none (upgrade) | none |
| Business | $49/mo, or $34/mo billed $408/yr | 25 | $5/mo ($60/yr) | 90 days, card required |
| Unlimited | $499/mo, or $349/mo billed $4,188/yr | Option 1: unlimited, one company. Option 2: 50, unlimited companies | Option 2: $10/mo ($120/yr) | 90 days |

- **Member** = an admin login (owner/admin/staff) + a carrier + a store login (merchant tablet). Customers are never
  members.
- **Company** = a store (warehouse). Proposal: Starter and Business allow up to 3 stores; Unlimited Option 1 allows
  1 store with unlimited members; Option 2 allows unlimited stores. **Owner to confirm (Q6).**
- No order or transaction caps, and no transaction fees (D-83).
- **Enforcement:** `PlanLimitsService.assertCanAdd('member' | 'store')` runs before creating an Admin, Carrier or
  Warehouse. When over the limit it returns a typed `PlanLimitReachedError` with an upgrade link. A downgrade never
  deletes anything; it only blocks new members or stores until the tenant is back under the limit.

### 3.7 Billing: Stripe Billing on Ever's platform Stripe account

- **Checkout:** `POST /billing/checkout` takes `{ plan, interval, extraMembers }` and creates a Checkout Session.
  `mode: subscription`, prices found by the existing lookup keys `ever_demand_cloud_<tier>_<interval>`, an optional
  seat line item `ever_seat_demand_cloud_<tier>_<interval>`, `trial_period_days: 90` on paid plans,
  `client_reference_id = tenantId`, and `automatic_tax` as on ever.co.
- **Customer portal:** `POST /billing/portal` opens a portal session for the tenant's `stripeCustomerId`.
- **Webhooks:** `POST /billing/webhook`, raw body, signature checked with `STRIPE_BILLING_WEBHOOK_SECRET`.
  - It handles `checkout.session.completed`, `customer.subscription.created|updated|deleted`,
    `invoice.payment_failed` and `invoice.paid`.
  - It is idempotent on `event.id` (a `billingevents` collection).
  - The plan is read **from the subscription's price lookup key**, never from client input.
- **Lifecycle:**
  - Past due: 14 days of grace, then read-only.
  - Cancelled: falls back to Starter limits.
  - Data is never deleted by billing.
- **Keys:** a new env `STRIPE_BILLING_SECRET_KEY` (Ever's account). It is kept separate from `STRIPE_SECRET_KEY`,
  which charges shop customers. Both come from env / OpenBao, never from the repo.
- **Ever Platform:** `app.ever.co` has provisioning and entitlements. In the MVP Demand bills on its own, as Gauzy
  does. Wiring Demand into Ever Platform entitlements is a later step (Q8).

### 3.8 Paying the tenant: customer card payments

Today every order is charged with Ever's single Stripe key, so with tenants all shop money would land in Ever's
account. That cannot go live for third-party tenants.

- **Recommended:** **Stripe Connect** (Express accounts). Each tenant onboards from its billing page. Charges become
  destination charges to `tenant.stripeAccountId`. No platform fee (D-83).
- **In the MVP:** a tenant without a connected account offers **cash / pay on delivery only**. The default tenant
  keeps `STRIPE_SECRET_KEY` as today. The Connect onboarding itself is a follow-up PR, unless the owner wants it in
  the MVP (Q5).

### 3.9 Single-tenant mode (self-hosted) stays

With env `MULTI_TENANT=false` (the default for self-hosted builds):

- every request resolves to the default tenant;
- signup and billing routes are off;
- the apps behave exactly as today.

The cloud deployment sets `MULTI_TENANT=true`. One code path; the mode only changes how the tenant is resolved.

## 4. Data model

### 4.1 `Tenant` (new, `packages/common/src/entities/Tenant.ts`, collection `tenants`, global)

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | business name |
| `slug` | string, unique | subdomain; `[a-z0-9-]{3,40}`; reserved: `app`, `api`, `www`, `admin`, `default`, ... |
| `status` | `active` / `suspended` / `deleted` | suspended blocks writes and logins (not the super-admin) |
| `ownerId` | Admin id | |
| `plan` | `starter` / `business` / `unlimited` | written only by webhooks or a super-admin |
| `billing` | `{ stripeCustomerId, stripeSubscriptionId, status, interval, extraMembers, trialEndsAt, currentPeriodEnd, option }` | from Stripe |
| `connect` | `{ stripeAccountId, chargesEnabled }` | §3.8, follow-up |
| `settings` | `{ currency, language, logoUrl, domains[], marketplaceListed }` | |
| `isPlatform` | boolean | the platform tenant where super-admins live |

### 4.2 `tenantId` on every tenant-owned collection

These collections get `tenantId: ObjectId` (required, indexed):

- Admin, Carrier, Device, Invite, InviteRequest, Order, Product, ProductsCategory, Promotion, User, Warehouse.

Not affected:

- Embedded documents (WarehouseProduct, OrderProduct, ...) inherit the tenant of their parent.
- `Currency` stays global reference data.

Implementation: a `TenantAwareDBObject` base class in `@pyro/db` (Mongoose `@Schema` + TypeORM `@Column`), which
the 11 entities extend instead of `DBObject`. `tenantId` is added to each `I<Entity>CreateObject` as optional; the
server always overwrites it.

### 4.3 Indexes

| Collection | Today | Becomes |
| --- | --- | --- |
| users | `email` unique | `{tenantId, email}` unique |
| warehouses | `username` unique, `barcodeData` unique sparse | `username` stays global (3.5); `{tenantId, barcodeData}` unique sparse; `{tenantId, geoLocation.loc}` 2dsphere |
| carriers | `username` unique, `email` unique sparse | `username` global; `{tenantId, email}` unique sparse |
| orders | (none) | `{tenantId, warehouse, orderNumber}`, `{tenantId, createdAt}` |
| all tenant collections | | `{tenantId: 1}` as the first field of every list index |

2dsphere can be compound with a leading equality field, so the `$near` store search stays a single index scan.

## 5. Tenant context and enforcement

### 5.1 Context (`packages/core/src/tenant/`)

```ts
interface TenantCtx { tenantId: string; actor?: { id: string; role: Role; isSuperAdmin: boolean }; system?: true }
const store = new AsyncLocalStorage<TenantCtx>();
TenantContext.run(ctx, fn); TenantContext.current(); TenantContext.require(); TenantContext.runAsSystem(reason, fn);
```

Where the context is set:

- **HTTP / GraphQL:** a Nest middleware runs before Apollo and the controllers and resolves the tenant per §3.3.
- **graphql-ws:** resolved in `onConnect` from `connectionParams` (`authorization`, `tenant`). Each operation runs
  in `TenantContext.run`.
- **socket.io:** a `Namespace.use()` middleware on every pyro namespace.
  - It resolves `socket.handshake.auth.{token,tenant}` (or headers) once per connection and stores the result in
    `socket.data.tenant`. An unknown or suspended tenant gets `connect_error`.
  - `BaseListenerHandler.handle()` wraps each listener call in `TenantContext.run(socket.data.tenant, ...)`.
  - A `token` passed as a method argument must belong to the same tenant.
- **System work:** migrations, the Stripe webhook (it resolves the tenant from the Stripe object, then runs inside
  it), fake-data seeding and startup jobs use an explicit `runAsSystem` / `run(tenant)`.

### 5.2 Enforcement layers (defence in depth)

| # | Layer | What it does |
| --- | --- | --- |
| L1 | **Mongoose tenant plugin**, registered globally before any model compiles | Query middleware on find\*, findOne\*, count\*, update\*, delete\*, replaceOne, distinct, findOneAndX: adds `tenantId = ctx.tenantId`. `save` / `insertMany` / `create`: stamps `tenantId` and rejects a different one. `aggregate`: puts `{ $match: { tenantId } }` first, or injects it into `$geoNear.query` when that stage leads. **Fail-closed**: a tenant-owned model queried with no context throws `TenantContextMissingError`; only `runAsSystem` bypasses it. This catches the 68 direct `Model.*` calls without depending on each one being fixed. |
| L2 | **`DBService`** | Explicit filter on every method (the same as L1, so reading the code shows it), plus `create` stamping. `getCurrent(id)` becomes `findOne({_id, tenantId})`. `findAll` / `removeAll` are scoped. |
| L3 | **Hand fixes** | The 34 service + 34 resolver `Model.*` calls, the 4 aggregations, the 3 `$near` queries, `data.resolver.ts`'s global `updateMany({})`, and cross-entity lookups (an order's warehouse, carrier and user must be in the order's tenant). Each is fixed explicitly and covered by a test. |
| L4 | **TypeORM** (Admin, Device repositories) | A `TenantScopedRepository<T>` wrapper that adds `where: { tenantId }` and stamps on save. The repository is not exported raw any more. |
| L5 | **Existence streams** | `get(id)` / `getMultiple(ids)` capture the tenant **at call time**. They drop events whose `value?.tenantId ?? lastValue?.tenantId` differs, and run their re-queries inside `TenantContext.run(captured)`. RxJS callbacks run in the context of whoever called `next()`, which may be another tenant's request or a system job. |
| L6 | **Indexes** | §4.3. |
| L7 | **Auth** | The default-deny GraphQL guard (§3.4). The JWT now carries `tenantId` and expires: 7 days for staff, 90 days for customers. Old tokens without `tenantId` are refused in multi-tenant mode. |

### 5.3 Ids are not secrets

ObjectIds are guessable (time + counter). Every isolation check assumes an attacker knows tenant B's ids, and the
tests use real B ids.

## 6. Signup, onboarding and the admin app

- **`/auth/signup`** (admin app): business name, slug (checked live), owner name, email, password, plan.
  - It calls `signupTenant`, a public GraphQL mutation that is rate limited and checks a captcha-ready hook (off by
    default).
  - In one step it creates the Tenant, the owner Admin, a default store and the default categories.
  - It returns a token. A paid plan then redirects to Stripe Checkout.
  - Email verification: a verification link, with login allowed for 7 days before it is required. This uses the
    existing mailer if one exists; otherwise it is a follow-up (Q9).
- **Settings → Tenant:** name, slug, logo, currency, language, domains (display only in the MVP).
- **Settings → Billing:** current plan, members used / included, Upgrade (Checkout), Manage (portal), invoices via
  the portal.
- **Settings → Members:** invite admin/staff (the existing `registerAdmin`, now owner/admin only and stamped with the
  tenant).
- **Super-admin:** a tenant list (plan, status, members, created) and a tenant switcher in the header. Switching
  sends `Tenant-Id`, and every switch is logged.
- **The existing first-admin bootstrap** (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) becomes the owner of the default tenant
  and a super-admin.

## 7. Migration (existing data)

`packages/core/src/migrations/0001-default-tenant.ts` runs at API startup. It is idempotent and guarded by a lock
document in `migrations`. It works in this order:

1. **Backup-first:** the runbook requires a `mongodump` of the database before the first deploy of this version.
   The migration refuses to run if `MIGRATION_BACKUP_CONFIRMED` is unset in production.
2. Create the default Tenant (`slug: default`, plan `unlimited`, `isPlatform: true`) if it is missing.
3. For each tenant collection: `updateMany({ tenantId: { $exists: false } }, { $set: { tenantId } })`.
4. Make the existing admins `owner` (the first one) or `admin` (the rest), and make the `ADMIN_EMAIL` admin the
   super-admin.
5. Rebuild the indexes:
   - drop `users.email_1`, `warehouses.barcodeData_1` and `carriers.email_1`;
   - create the compound indexes (§4.3);
   - this drops no data.
6. Record `0001` as done.

Rollback: the old code ignores `tenantId`. The dropped unique indexes are recreated by the old code's `autoIndex` on
boot, as long as no duplicates were written in between. The runbook says so.

## 8. Tests

| Suite | Where | What |
| --- | --- | --- |
| Unit | `core/src/tenant/*.spec.ts` | the plugin adds the filter for every query type; it throws with no context; it stamps on create / insertMany; it rejects a foreign `tenantId`; aggregate / `$geoNear` injection; header vs JWT rules; existence filtering |
| Jest API e2e | `core/test/e2e/multi-tenant.e2e-spec.ts` | Seeds tenants A and B (admin, store, product, category, promotion, carrier, customer, order each). **GraphQL:** with A's admin token, every list query returns only A's records. Every by-id query or mutation with a B id returns null, NotFound or Forbidden, and B is unchanged afterwards. `Tenant-Id: B` with A's token gets 403. Anonymous with `Tenant-Id: A` only sees A's storefront. Admin-only operations without a token are refused. **socket.io:** a connection with `auth.tenant = A` calls `warehouse.get(B)`, `order.get(B)`, `geo-location-warehouses.getStores(near B)`, `user-orders.get(B user)` and gets null or empty. An update to a B record emits nothing on A's open streams. A create from A's socket stamps A. |
| Billing e2e | same folder | The webhook with a signed fixture event sets the plan. A bad signature gets 400. A replayed event is a no-op. A limit is enforced at the member boundary. Stripe is stubbed; no network. |
| Playwright | `e2e/tests/multi-tenant/*.spec.ts` | Sign up tenant A in the admin app. A creates a store and a product. A second signup creates B. B's store list and product list do not show A's. A super-admin switches into A and sees them. The shop web app on A's tenant lists only A's stores. |

Every isolation test is written to fail first against the code before the change.

## 9. Delivery plan (after the owner signs off)

The work is one branch, `feat/multi-tenant`, with commits per milestone and the handover in
`docs/multi-tenant/HANDOVER.md`. Each milestone ends green before the next one starts.

1. `Tenant` entity, `TenantAwareDBObject`, `tenantId` on 11 entities, the context, the Mongoose plugin (L1) and its
   unit tests.
2. DBService (L2), the hand fixes (L3), TypeORM (L4), streams (L5), indexes (L6), and the migration.
3. Context on HTTP / GraphQL / graphql-ws / socket.io, the JWT claim, the default-deny guard (L7), and the e2e
   isolation suite.
4. Signup, plans and limits, Stripe Billing (Checkout, portal, webhooks), and the billing e2e.
5. Admin app: signup, tenant settings, billing, members, super-admin switcher; Playwright.
6. Client apps: tenant config and headers in shop-web-angular, shop-web-gatsby, shop-mobile-ionic, shop-mobile-expo,
   shop-mobile-flutter, merchant and carrier; their unit tests.
7. Full verification: every package's tests, the core e2e, Playwright, Docker image boot. Then the PR against
   `develop` (after #1660 merges; until then the PR's base is `feat/latest-stack`).

Not in the MVP: Stripe Connect payouts (unless Q5 says otherwise), custom domains, the public marketplace, one email
in several tenants, per-tenant push and email branding, data export, tenant deletion with a grace period.

## 10. Open questions for the owner

Each question has a recommended answer. Questions 4-10 are built with the recommended answer until the owner says otherwise.

1. ~~**Customers:**~~ **answered: per tenant.**
2. ~~**Storefront:**~~ **answered: a separate storefront per tenant.**
3. ~~**Tenant resolution:**~~ **answered: support all variants** (subdomain, header, white-label build), §3.3.
4. **Staff logins:** keep admin email and store / carrier usernames globally unique, with no tenant field at login
   (recommended)? Or make them unique per tenant and add a business code to every login?
5. **Customer card payments:** Stripe Connect as a follow-up PR, with cash / pay on delivery for new tenants until
   then (recommended)? Or build Connect in this MVP?
6. **Limits:** members = admins + carriers + store logins; stores capped at 3 on Starter / Business, 1 on Unlimited
   Option 1, unlimited on Option 2. OK, or other numbers?
7. **Trial:** 90 days with a card required on Business and Unlimited, as the pricing spec says?
8. **Billing home:** Demand bills its own tenants with the existing `ever_demand_cloud_*` Stripe prices
   (recommended, like Gauzy)? Or does it go through Ever Platform (`app.ever.co`) entitlements now?
9. **Email verification at signup:** required within 7 days (recommended), required before first login, or not in
   the MVP?
10. **Domains:** admin at `app.everdemand.co`, API at `api.everdemand.co`, shops at `<slug>.everdemand.co`. Is that
    right, and should deploying it (DNS, k8s, Stripe webhook endpoint) be part of this task or a later one?
