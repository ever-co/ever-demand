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

The `android/` and `ios/` projects are not committed. Create them once, then sync after each build:

```sh
pnpm run build
npx cap add android        # or: npx cap add ios (macOS)
npx cap sync
npx cap open android
```

`resources/icon.png` and `resources/splash.png` can be turned into native icons and splash screens
with `npx @capacitor/assets generate --assetPath resources`.
