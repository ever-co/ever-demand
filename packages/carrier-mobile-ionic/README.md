# Ever Demand Carrier Mobile App (Ionic)

Angular 22 + Ionic 9 + Capacitor 8 app for couriers: log in, go online, take the nearest packaged
order, pick it up at the store and deliver it.

```sh
pnpm install                                   # from the repository root (Node 26, pnpm 12)
pnpm --filter @ever-platform/carrier-mobile-ionic start   # dev server on http://localhost:4203
pnpm --filter @ever-platform/carrier-mobile-ionic test    # Vitest unit tests
pnpm --filter @ever-platform/carrier-mobile-ionic build   # production build into www/
```

Settings come from `.env` (see `.env.template`); `scripts/configure.ts` writes
`src/environments/environment*.ts` before every build (`node scripts/configure.ts --environment=dev|prod`).

## Native apps (Capacitor)

The `android/` and `ios/` projects are committed. Sync them after every web build:

```sh
pnpm run build
npx cap sync
npx cap open android       # or: cd android && ./gradlew assembleDebug
npx cap open ios           # macOS + Xcode (Swift Package Manager)
```

Permissions, icons and how to run on a device: "Native builds" in
[docs/latest-stack/carrier-merchant.md](../../docs/latest-stack/carrier-merchant.md#native-builds).
