# @ever-platform/shop-mobile-expo

Ever Demand customer shop app built with Expo (React Native) for iOS, Android and the web. It has
the feature scope of the Ionic shop app (`packages/shop-mobile-ionic`) and talks to the same API:
the socket.io "pyro" RPC routers and GraphQL.

Stack: Expo SDK 58, React Native 0.88, React 19.3, React Navigation 7, react-native-paper 5,
Redux Toolkit 2, Apollo Client 4 + graphql-ws, socket.io-client 4.8, i18next, TypeScript 6.
Details, versions and the feature parity checklist: `docs/latest-stack/shop-mobile-expo.md`.

## Run

From the repo root (pnpm 12, Node 26):

```sh
pnpm install --filter @ever-platform/shop-mobile-expo...
cd packages/shop-mobile-expo
cp .env.template .env          # optional, defaults point at http://localhost:5500 etc.
pnpm start                     # Expo dev server (press a / i / w)
pnpm web                       # web dev server on http://localhost:8081
```

The API must run at the endpoints in `.env` (`pnpm run:server` from the root).

## Build and test

```sh
pnpm typecheck                 # tsc --noEmit
pnpm test                      # Jest (jest-expo) + React Native Testing Library
pnpm export:web                # static web build in dist/
pnpm serve:web                 # serves dist/ on :8081 for the Playwright suite
pnpm export:android            # Android JS bundle (no Android SDK needed)
pnpm doctor                    # expo-doctor
```

e2e (Playwright, web build): `pnpm --filter @ever-platform/e2e exec playwright test --project=shop-expo`
with the web build served on port 8081.

## Layout

    src/
      App.tsx            providers, start-up checks, language
      config/env.ts      EXPO_PUBLIC_* settings
      domain/            enums, server object types, order / product helpers (no packages/common import)
      rpc/               pyro socket.io RPC client + typed routers
      graphql/           Apollo client, the Ionic GraphQL documents, services
      store/             Redux Toolkit: session (persisted) and ui (modals, payments in flight)
      services/          start-up, location, orders, payments
      navigation/        drawer navigator, web paths, guards, side menu
      screens/ modals/ components/
      i18n/              i18next + the Ionic translation files
      test/              Jest harness, fixtures, drawer mock
