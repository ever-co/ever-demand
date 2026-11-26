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

The `android/` and `ios/` projects are not committed. Create them once, then sync after each build:

```sh
pnpm run build
npx cap add android        # or: npx cap add ios (macOS)
npx cap sync
npx cap open android
```

`resources/icon.png` and `resources/splash.png` can be turned into native icons and splash screens
with `npx @capacitor/assets generate --assetPath resources`.
