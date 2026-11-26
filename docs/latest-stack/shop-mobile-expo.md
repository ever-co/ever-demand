# Lane notes: Expo / React Native shop app (`packages/shop-mobile-expo`)

Branch `feat/latest-stack-expo`, cut from `feat/latest-stack` @ `e3e00b80`. Parity source:
`docs/latest-stack/shop-mobile-features.md` (shop-mobile lane, `bb9cd06d`), referred to below as
"inventory §n".

The old package (Expo 44, React Native 0.64, React 17, about 9.6k lines) had a different flow
(email sign-in / sign-up through GraphQL mutations) and covered a small part of the Ionic app. It was
rebuilt on the latest stack with the Ionic app's flows, data sources and translations. Assets
(icons, splash, logo) were kept.

## Versions

| Package | Version | Note |
| --- | --- | --- |
| expo | ~58.0.26 | latest SDK |
| react-native | 0.88.1 | SDK 58 |
| react / react-dom | 19.3.0 | SDK pin (19.3.1 exists; React Native needs the renderer's exact React) |
| react-native-web | ~0.21.4 | latest |
| @react-navigation/native / drawer | ^7.5.2 / ^7.14.5 | latest |
| react-native-paper | ^5.15.5 | latest |
| @reduxjs/toolkit / react-redux | ^2.15.0 / ^9.3.1 | latest |
| @apollo/client | ^4.3.8 | latest; hooks from `@apollo/client/react` |
| graphql | ^16.15.0 | contract default; 17.1.0 exists, Apollo 4 accepts it; follow the core lane |
| graphql-ws | ^6.4.3 | latest; `GraphQLWsLink` from `@apollo/client/link/subscriptions` |
| socket.io-client | ^4.8.4 | latest |
| rxjs | ^7.8.2 | latest |
| i18next / react-i18next | ^27.2.9 / ^18.0.3 | latest |
| @stripe/stripe-react-native | 0.81.0 | SDK pin (0.85.1 exists) |
| @stripe/stripe-js / @stripe/react-stripe-js | ^10.4.0 / ^7.1.0 | latest (web card form) |
| react-native-maps | 1.29.11 | SDK pin |
| react-native-reanimated / worklets | 4.7.1 / 0.13.0 | SDK pins (4.8.0 / 0.14.0 exist) |
| react-native-gesture-handler | ~3.3.0 | SDK pin (3.5.0 exists) |
| react-native-screens / safe-area-context | ~4.30.1 / ~5.11.1 | SDK pins |
| react-native-svg / react-native-webview | 15.16.0 / 14.0.1 | SDK pins (svg 15.16.1 exists) |
| @react-native-async-storage/async-storage | 2.2.0 | SDK pin (3.1.1 exists) |
| @react-native-community/netinfo | 12.0.1 | SDK pin |
| expo-camera / -location / -localization / -splash-screen / -crypto / -linking | ~58.x | SDK pins |
| react-native-qrcode-svg / jsbarcode | ^6.3.55 / ^3.12.3 | latest |
| typescript | ~6.0.3 | contract (7.0.2 held back for every lane) |
| jest / jest-expo / @testing-library/react-native | ^30.5.2 / ~58.0.15 / ^14.1.0 | latest |
| @babel/core | ^7.29.13 | 8.1.3 exists; `babel-preset-expo` and `@expo/metro-config` require Babel 7 |

"SDK pin" means the version `expo install --fix` picks for SDK 58 (from `expo/bundledNativeModules.json`).
For native modules that is the latest version the SDK supports, which the latest-versions rule
accepts; newer npm releases are not tested against React Native 0.88 by Expo.

## Decisions

- **No `packages/common` import.** Its entities pull in mongoose and typeorm decorators. Enums,
  object shapes and the computed getters the app needs (`Order.status`, `isCompleted`, `totalPrice`,
  `getStatusText`, `getIdFromTheDate`, `InviteRequest.toAddressString`, the country list) are
  copied into `src/domain`, with tests.
- **pyro RPC client** (`src/rpc`): same wire protocol as `common-angular/src/lib/router`: one
  namespace per router, `reconnection: false` and a manual reconnect 1 s after a drop, one-shot calls
  with an ack that reject with `SocketDisconnectedError` when the socket drops after sending (the
  fleet fix), observable calls with `callId` / `subscriptionId`, errors rebuilt from
  `{ __isError__, name, message }`. Two protocol differences, both fixes:
  - the server emits `_${subscriptionId}_complete`; the Angular client listened to
    `${subscriptionId}_complete` and never completed. The Expo client listens to both.
  - after a reconnect the Angular client re-sent `${callId}_subscribe` on the new socket, where the
    server no longer has that call. The Expo client calls the method again with a fresh call id.
  - results are JSON, so entity getters are lost; `normalizeEntity` adds `id` (from `_id`) and
    `createdAt` (from `_createdAt`) to every nested object.
- **GraphQL**: the Ionic documents verbatim (`src/graphql/documents.ts`), default options as in
  Ionic (`watchQuery` `errorPolicy: 'ignore'`, `query` `errorPolicy: 'all'`, `network-only`), declared
  through Apollo 4's `DeclareDefaultOptions`. The feed polls every 2 s like Ionic.
- **State**: Redux Toolkit. `session` holds every Ionic `localStorage` key (inventory §5), saved to
  AsyncStorage under `ever-shop-session` (localStorage on the web). `ui` holds the open modal (the
  Ionic `ModalController`) and the order ids with a card payment in flight (memory only, #1645/#1646).
- **Navigation**: one React Navigation 7 drawer (the side menu) with every page; web paths are the
  Ionic URLs (`/invite/by-code`, `/products/product-details/:id`, `/order-info`, ...). Guards are
  pure functions (`src/navigation/guards.ts`) run on focus. The menu sits on the right in Hebrew,
  and `<html dir lang>` follows the language on the web.
- **Payments** (inventory §4.9, fleet fixes #1645-#1654) live in `src/services/payment.ts`; every
  rule has a test. The Ionic app used legacy Stripe Checkout (`checkout.js`) to get a card token. The
  Expo app shows its own card form (email + card) and creates the same kind of token:
  `@stripe/stripe-react-native` `CardField` + `createToken({ type: 'Card' })` on iOS / Android,
  Stripe Elements `CardElement` + `stripe.createToken` on the web. The token then goes through the
  unchanged server calls: `user.updateEmail`, `user.addPaymentMethod`, `order.payWithStripe(id,
  card, currency)`, `order.confirm`.
- **Maps**: `react-native-maps` on native with user / store / carrier markers and a line between
  them; the web build lists the points with an OpenStreetMap "open in maps" link (react-native-maps
  has no web version). The Ionic app drew Google driving directions; that needs a Google
  Directions key and is not done.
- **Native features**: expo-location (GPS, platform geocoder), expo-camera (store QR scan),
  NetInfo (connection lost), `Linking` `tel:` (call store / support), expo-localization (device
  language), react-native-qrcode-svg + jsbarcode + react-native-svg (takeaway order code).

## Replaced libraries

| Old | Now |
| --- | --- |
| expo-app-loading | expo-splash-screen (`preventAutoHideAsync` / `hideAsync`) |
| react-native-flash-message | `notify()` (Alert on native, `window.alert` on the web, like Ionic `alert`) |
| react-native-global-props | Paper theme |
| redux-logger, lodash, validate.js | removed (plain code) |
| react-native-pager-view | `FlatList` with `pagingEnabled` (slides view) |
| @react-navigation/native-stack | drawer only |
| metro-react-native-babel-preset, metro-config | babel-preset-expo, `expo/metro-config` |
| scripts/configure.ts + env.ts (ts-node, dotenv, envalid, yargs), app.json | `app.config.ts` + `EXPO_PUBLIC_*` (`src/config/env.ts`, `.env.template`) |
| eslint 7 + @react-native-community config | removed with the old code; not re-added (no lane lints yet) |
| Cordova plugins (Ionic) | expo-location, expo-camera, NetInfo, Linking, expo-localization |
| Stripe Checkout `checkout.js` (Ionic) | Stripe React Native / Stripe Elements card form |
| ngx-barcode, qrcode (Ionic) | jsbarcode (object renderer) + react-native-svg, react-native-qrcode-svg |

## Held back

| Item | Held at | Blocker |
| --- | --- | --- |
| Expo-pinned native modules (Stripe RN, async-storage, reanimated, worklets, gesture handler, svg) | SDK 58 pins | newer majors / minors are not in SDK 58's tested set; `expo-doctor` flags them |
| react / react-dom 19.3.1 | 19.3.0 | React Native 0.88 ships its renderer for exactly 19.3.0 |
| graphql 17 | 16.15.0 | contract default until the core lane picks the server version |
| @babel/core 8 | 7.29.13 | Expo's Babel preset and Metro config are on Babel 7 |
| TypeScript 7 | 6.0.3 | contract |

## Jest notes

- `jest-expo` preset (iOS). RNTL 14 is async: `await render(...)`, `await fireEvent...`.
- Reanimated 4's Jest mock needs native modules, so Reanimated is made unavailable and
  `@react-navigation/drawer` is replaced by `src/test/drawerMock.tsx` (same `DrawerRouter`, renders
  the focused screen and the open menu). Other native modules use their official mocks
  (`jest.setup.ts`).
- `transformIgnorePatterns` adds `immer`, `@reduxjs`, `redux`, `reselect`, `react-redux` (ESM only)
  to the jest-expo list.
- Screen tests render the whole app (`AppRoot`) at one route with mocked routers, GraphQL services
  (or an Apollo `MockLink`) and location (`src/test/harness.tsx`).

## Feature parity checklist

| Feature (inventory) | Ionic | Expo | Tests |
| --- | --- | --- | --- |
| Start-up: server check, maintenance, server settings, device registration, user check (§3.1) | `app.module.ts`, `app.component.ts`, `services/server-settings.ts`, `store.service.ts isLogged` | `services/bootstrap.ts`, `App.tsx` | `services.test.ts` (app start) |
| Guards and start route (§3.2) | `*.module.guard.ts` | `navigation/guards.ts`, `hooks/useGuard.ts` | `store.test.ts` (route guards), screen tests |
| Side menu, call us, call unsuccessful (§3.3, §4.12) | `components/menu/*`, `+call/call.page` | `navigation/DrawerContent.tsx`, `modals/SmallModals.tsx CallModal` | `pages.test.tsx` (side menu); e2e `flows` menu |
| Server down, connection lost, maintenance (§3.4) | `+server-down`, `+errors/+connection-lost`, `maintenance-info` | `screens/SimpleScreens.tsx`, NetInfo watcher in `RootNavigator.tsx` | `pages.test.tsx`; e2e `smoke` |
| Language selection, RTL, start language (§4.1) | `+language/language.page`, `Store._initLanguage` | `LanguageScreen`, `i18n/index.ts`, `App.tsx` | `store.test.ts` (i18n), `pages.test.tsx`; e2e Hebrew RTL |
| Invite by code, fake code 8321 + 40 demo orders, back to details (§4.2) | `+invite/+by-code` | `screens/InviteByCodeScreen.tsx`, `hooks/useRegister.ts` | `invite.test.tsx`; e2e buy flow |
| Invite by location, prefill, invite request, invite system off (§4.3) | `+invite/+by-location` | `screens/InviteByLocationScreen.tsx` | `invite.test.tsx` |
| Product feed: location, delivery type, merchant filter, paging + 2 s poll, sold out, placeholder (§4.4) | `+products/products.page`, `geo-location-products.ts` | `screens/ProductsScreen.tsx`, `hooks/useProductFeed.ts` | `products.test.tsx`; e2e feed |
| Slides and list views, discount, delivery badge (§4.4) | `products-view/*`, `components/products/*` | `components/ProductViews.tsx`, `components/ProductBits.tsx` | `products.test.tsx`, `domain.test.ts` |
| Search merchants + products (§4.4) | `+searchProducts` | `components/SearchPanel.tsx` | `products.test.tsx`; e2e search |
| Store mode / single merchant (§4.4, §4.14) | `products.page changeStoreMode` | `ProductsScreen` store sign | `products.test.tsx` |
| Buy: create, add more (cart), browse-first invite and resume (§4.5) | `products.page buyItem`, `product-details buyItem` | `services/orders.ts buy`, `hooks/useOrderFlow.ts` | `services.test.ts`, `products.test.tsx`; e2e buy |
| Order info modal + shopping cart confirm (§4.5) | `order-info-modal` | `modals/OrderProductsModal.tsx` | `orders.test.tsx` (shopping cart) |
| Product details, images, live sold out (§4.6) | `product-details/*` | `screens/ProductDetailsScreen.tsx` | `products.test.tsx` (details); e2e details |
| Delivery tracking page + popup, steps, elapsed time, texts, issues, End (§4.7) | `+order/order.page`, `+order-info/*` | `screens/OrderInfoScreens.tsx`, `modals/OrderModal.tsx`, `components/OrderTracking.tsx`, `OrderMap` | `orders.test.tsx`; e2e buy |
| Takeaway tracking page + popup, store info, map modal, QR / barcode, I'm here, Got it (§4.8) | `+order/takeaway/*` | `OrderTakeawayInfoScreen`, `modals/TakeawayModal.tsx`, `components/TakeawayInfo.tsx`, `components/OrderCode.tsx` | `orders.test.tsx` |
| Payment: saved card, new card, currency, paying guard, messages (§4.9) | `common/payment/payment.component` | `components/PaymentButtons.tsx`, `modals/NewCardModal.tsx`, `components/CardForm(.web).tsx`, `services/payment.ts` | `services.test.ts` (payment rules), `orders.test.tsx` (Payment) |
| Cancel (Undo) with refund (§4.10) | `+cancel/cancel.page` | `modals/SmallModals.tsx CancelModal`, `services/orders.ts` | `orders.test.tsx`, `services.test.ts`; e2e cancel |
| Issue modal (§4.11) | `issue/issue.page` | `IssueModal` | `orders.test.tsx` |
| Orders history and details, order card, comment, remove (§4.13) | `+orders-history/*`, `components/order/*` | `screens/OrdersHistoryScreens.tsx`, `components/OrderCard.tsx` | `pages.test.tsx`; e2e history |
| Merchants: close / by name / scan / enter store (§4.14) | `+merchants/*` | `screens/MerchantsScreen.tsx`, `components/QrScanner.tsx` | `pages.test.tsx`; e2e merchants |
| Info pages (§4.15) | `+info/*` | `InfoScreen` (`SimpleScreens.tsx`) | `pages.test.tsx`; e2e about |
| pyro RPC protocol (§1.2, §1.3) | `common-angular/src/lib/router/*` | `src/rpc/*` | `router.test.ts`, `routers.test.ts` |
| GraphQL documents (§1.4) | `services/*`, `*.model.ts` | `src/graphql/*` | `api.test.ts` |
| i18n, 6 languages (§6) | `assets/i18n/*.json` | `src/i18n` (files copied verbatim + `EXPO.*` extras in English) | `store.test.ts` (i18n) |

### Quirks of the Ionic app (inventory "quirk" notes)

Kept: the store group of the side menu is not shown; "Call for details" has no action; the order
card's comment / remove only work on orders from `order.get` (GraphQL history rows lack the ids);
in the shopping-cart modal every button confirms the cart.

Fixed: the server check now stores `200` on success (Ionic never reset it at start); a stored
`_language` wins over `DEFAULT_LANGUAGE` (T-2805); leaving the delivery order page no longer
clears the open order; after a new-card payment in popup mode the popup that opens matches the
delivery type (Ionic always opened the delivery popup); a customer whose location cannot be read
stays on the feed instead of bouncing between the invite and the feed; a user the server returns as
`null` is forgotten like one that errors.

Not ported: the Google Maps JS geocoder fallback for the address prefill (the server ArcGIS
reverse geocode is used, and the platform geocoder for the typed address on native); Google driving
directions (straight line).

## API / other lanes

- No schema or router change is needed: every Ionic operation has a GraphQL document or pyro call.
- pyro: the server's `_${subscriptionId}_complete` event name differs from what the Angular client
  listens to (`${subscriptionId}_complete`); harmless today because no shop observable completes,
  but worth aligning in core or common-angular.
- `GOOGLE_MAPS_API_KEY` (native builds) and `STRIPE_MERCHANT_IDENTIFIER` are build-time settings in
  `app.config.ts`.

## Store application ids

The three shop apps can be published side by side; the Flutter and React Native ids are derived
from the Ionic one (owner decision, 2026-11-26).

| App | Id (Android `package` / iOS `bundleIdentifier`) |
| --- | --- |
| Ionic shop (`shop-mobile-ionic`) | `co.ever.customer` (unchanged; the Cordova widget id) |
| Flutter shop (`shop-mobile-flutter`) | `co.ever.customer.flutter` |
| React Native / Expo shop (`shop-mobile-expo`) | `co.ever.customer.reactnative` |
| Carrier / merchant | `co.ever.carrier` / `co.ever.merchant` (unchanged) |

This app sets it in `app.config.ts` (`ios.bundleIdentifier` and `android.package`; it was
`co.ever.shop.expo`). The deep-link `scheme` stays `evershop` (no other app registers it).

## How to run

See `packages/shop-mobile-expo/README.md`. Short version, from the repo root:

```sh
pnpm install --filter @ever-platform/shop-mobile-expo...
pnpm --filter @ever-platform/shop-mobile-expo typecheck
pnpm --filter @ever-platform/shop-mobile-expo test
pnpm --filter @ever-platform/shop-mobile-expo export:web && pnpm --filter @ever-platform/shop-mobile-expo serve:web
pnpm --filter @ever-platform/e2e exec playwright test --project=shop-expo
```

Docker (web build + nginx on 8081): `.deploy/shop-mobile-expo/Dockerfile`; `EXPO_PUBLIC_*` values are
build args because Expo inlines them.

## Verification (2026-11-25, Node 26.13.1, pnpm 12.23.0)

| Check | Result |
| --- | --- |
| `pnpm install --filter @ever-platform/shop-mobile-expo...` (isolated node_modules) | ok, no peer warnings; Metro resolves the pnpm layout without workarounds |
| `tsc --noEmit` | no errors |
| `jest --maxWorkers=1` | 11 suites, 161 tests passed |
| `expo export --platform web` | ok, 2172 modules, one 4 MB bundle |
| `expo export --platform android` | ok, 2825 modules, Hermes bytecode 7.1 MB (no Android SDK on this PC: JS side only) |
| `expo-doctor` 1.21.8 | 20/20 checks passed |
| Playwright `--project=shop-expo` against the local API (5500 / 8443 / 2086) and the served web build | 11 passed (smoke: shell, deep links, Hebrew RTL, connection lost, no console errors; flows: first visit, browse-first Buy → invite → order page → cancel, details, search, menu / history / about / language, merchants → store mode, stale user) |

Not verified: iOS / Android on a device or emulator (no SDK on this PC; the native modules are the
SDK 58 pins and the Android bundle builds), card payments with a real Stripe test key (the rules are
unit and screen tested with mocks), the camera scanner on a device.
