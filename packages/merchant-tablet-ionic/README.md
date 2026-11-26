# Ever Demand Merchant Tablet App (Ionic)

Angular 22 + Ionic 9 + Capacitor 8 tablet app for stores: orders and their warehouse statuses,
products, carriers, customers, promotions and store settings.

```sh
pnpm install                                   # from the repository root (Node 26, pnpm 12)
pnpm --filter @ever-platform/merchant-tablet-ionic start   # dev server on http://localhost:4202
pnpm --filter @ever-platform/merchant-tablet-ionic test    # Vitest unit tests
pnpm --filter @ever-platform/merchant-tablet-ionic build   # production build into www/
```

Settings come from `.env` (see `.env.template`); `scripts/configure.ts` writes
`src/environments/environment*.ts` before every build (`node scripts/configure.ts --environment=dev|prod`).

## Native apps (Capacitor)

The `android/` and `ios/` projects are committed. Sync them after every web build:

```sh
pnpm run build
npx cap sync
npx cap open android       # or: cd android && ./gradlew assembleDebug
npx cap open ios           # macOS + Xcode + CocoaPods (cap sync ios runs pod install)
```

Permissions, icons and how to run on a device: "Native builds" in
[docs/latest-stack/carrier-merchant.md](../../docs/latest-stack/carrier-merchant.md#native-builds).
