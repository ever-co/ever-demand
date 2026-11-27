# Ever Shop Mobile App (Flutter)

The Ever Demand customer shop app in Flutter, with the feature set of `packages/shop-mobile-ionic`:
invite by code / address, product feed (slides or list), product details, delivery and takeaway
orders with live tracking, card payments (saved card or a new card through Stripe), orders history,
merchants with QR scan, six languages (Hebrew right to left), info pages, connection / server /
maintenance pages.

- Flutter 3.50.1, Dart 3.14, Material 3 (`material_ui`), Riverpod 3, go_router 18.
- Backend: the Ever Demand API. socket.io "pyro" RPC at `SERVICES_ENDPOINT` (default
  `http://localhost:5500`), GraphQL at `GQL_ENDPOINT` (`http://localhost:8443/graphql`), subscriptions
  over graphql-ws at `GQL_SUBSCRIPTIONS_ENDPOINT` (`ws://localhost:2086/subscriptions`). On the Android
  emulator `localhost` becomes `10.0.2.2`.

## Run

```sh
flutter pub get
flutter run --dart-define=STRIPE_PUBLISHABLE_KEY=pk_test_...
```

All settings are `--dart-define` values with the names of the Ionic app's `.env`; see
`docs/latest-stack/shop-mobile-flutter.md` (configuration, architecture, parity checklist).

Multi-tenant API (docs/multi-tenant/DESIGN.md §3.3): the app sends its tenant as `Tenant-Id`, in
the graphql-ws `connectionParams` and in every socket handshake. A white-label build sets
`--dart-define=TENANT=<slug or 24-hex id>`. The web build also finds it from a
`<slug>.<TENANT_BASE_DOMAIN>` page host (`--dart-define=TENANT_BASE_DOMAIN=everdemand.co`) or a
`?tenant=<slug>` link (kept for later visits). With none, the API decides (single-tenant installs
use their default tenant). Code: `lib/config/tenant.dart`, `tenantProvider` in `lib/providers.dart`.

## Test and build without a local Flutter (Docker)

```sh
tool/docker-test.sh                      # analyze, test, integration, web release, debug APK
tool/docker-test.sh analyze test         # only some steps
```

Logs and artifacts go to `tool/out/`.

## Translations

`lib/l10n/*.arb` are generated from `packages/shop-mobile-ionic/src/assets/i18n/*.json`:
`dart tool/ionic_i18n_to_arb.dart`.
