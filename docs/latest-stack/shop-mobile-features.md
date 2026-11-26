# Ever Demand shop app: feature inventory (reference: `packages/shop-mobile-ionic`)

This file describes the customer shopping app as it works in the Ionic app at the base of the
latest-stack upgrade (`develop` @ `abd39940`, Angular 13 + Ionic 5 + Cordova). The Expo (React
Native) and Flutter lanes use it to reach feature parity. It is meant to be enough to rebuild the
app without reading the Angular code. Paths are relative to `packages/shop-mobile-ionic/src/app/`
unless they start with `packages/`.

Quirks of the reference app are kept here on purpose and marked **(quirk)**. A rebuild may fix a
quirk, but it should know what the reference app does first.

---

## 1. Backend surface

The app talks to the backend in three ways.

| Channel | Default | Env var | Used for |
| --- | --- | --- | --- |
| socket.io "pyro" RPC | `http://localhost:5500` | `SERVICES_ENDPOINT` | almost everything: orders, users, warehouses, invites, payments |
| GraphQL over HTTP | `http://localhost:8443/graphql` | `GQL_ENDPOINT` | product feed, merchant search, order history, order details |
| GraphQL subscriptions (graphql-ws) | `ws://localhost:2086/subscriptions` | `GQL_SUBSCRIPTIONS_ENDPOINT` | configured in the client, but **no subscription operation is used** |
| Plain HTTP GET | `${SERVICES_ENDPOINT}` | | server-up check at start (any HTTP error status means "down"; status `0` = unreachable) |
| Plain HTTP GET | `${SERVICES_ENDPOINT}/getLocationByIP` | | IP geolocation fallback, returns `{ latitude, longitude }` or null |
| Plain HTTP GET | `SETTINGS_MAINTENANCE_API_URL` | | maintenance status JSON (only when the URL is set) |
| Google Maps JS | `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,drawing&callback=__onGoogleLoaded` | `GOOGLE_MAPS_API_KEY` | maps on the order pages, Geocoder in invite by location |
| Stripe.js (`@stripe/stripe-js` 10; replaced the legacy Checkout `checkout.js`) | `https://js.stripe.com/endive/stripe.js` | `STRIPE_PUBLISHABLE_KEY` | the new-card form (Card Element) that makes a card token |

### 1.1 GraphQL client setup

- `Authorization: Bearer <token>` header when `localStorage.token` is set, else an empty
  `authorization` header. The shop app never sets `token`, so in practice it is always empty.
- Operations of type `subscription` go to the WebSocket link, everything else to HTTP.
- Default options: `watchQuery` uses `fetchPolicy: 'network-only'`, `errorPolicy: 'ignore'`;
  `query` uses `fetchPolicy: 'network-only'`, `errorPolicy: 'all'`. Cache: `InMemoryCache`.

### 1.2 The pyro socket.io RPC protocol

Source: `packages/common-angular/src/lib/router/*`, `packages/common-angular/src/lib/socket.service.ts`.

- Each router is its own socket.io **namespace**: `io(`${SERVICES_ENDPOINT}/${routerName}`, { reconnection: false })`.
  The client reconnects by hand: 1 s after a `disconnect` or `connect_error` it calls `socket.connect()`.
- **One-shot call** (`router.run(method, ...args)`): `socket.emit(method, ...args, ack)` where
  `ack(err, res)`. A non-null `err` rejects. If the socket drops after the request went out, the call
  rejects with "Connection lost before the server answered" (a fleet fix: a dropped socket must never
  leave a payment hanging). A call made while offline waits in the socket.io buffer and counts as
  sent on the next connect.
- **Observable call** (`router.runAndObserve(method, ...args)`): waits for `connect`, then
  `socket.emit(method, ...args, callId)` with `callId` a fresh UUID v4. On every (re)connect it emits
  `${callId}_subscribe` with a fresh `subscriptionId` (UUID v4) and listens to
  `${subscriptionId}_next` (value), `${subscriptionId}_error` (error, see below) and
  `${subscriptionId}_complete`. Unsubscribing emits `${subscriptionId}_unsubscribe`.
- Errors come serialised as `{ __isError__: true, name, message }`; the client rebuilds an `Error`
  with that `name` and `message`. Payment code checks `err.name === 'StripeCurrencyChangedError'`.
- Results are plain objects; the Angular client wraps them in entity classes from
  `packages/common/src/entities` (`Order`, `User`, `Warehouse`, `Invite`, `InviteRequest`, `Device`).
  A rebuild needs the computed getters it uses: `Order.status`, `Order.totalPrice`,
  `Order.getStatusText(lang)`, `InviteRequest.toAddressString()`, `getIdFromTheDate(order)`.

### 1.3 Router methods the shop app calls

Namespace / method (args) → return. "obs" = observable call (`runAndObserve`), the server pushes
updates; "call" = one-shot (`run`).

| Namespace | Method and args | Kind | Returns | Used by |
| --- | --- | --- | --- | --- |
| `device` | `create({ channelId: string\|null, language, type: 'browser'\|'android'\|'ios', uuid })` | call | Device | app start, when `_deviceId` is unset |
| `device` | `updateLanguage(deviceId, language)` | call | Device | commented out in the app (not called) |
| `invite` | `getInvitesSettings()` | call | `{ isEnabled: boolean }` | app start (ServerSettings) |
| `invite` | `getByCode({ location: ILocation\|undefined, inviteCode: string })` | obs, first value | Invite or null | invite by code |
| `invite` | `getByLocation({ apartment, house, streetAddress, city, countryId, notes })` | obs, first value | Invite or null | invite by location |
| `invite` | `create(inviteRequest)` (an InviteRequest used as create object) | call | Invite | invite by location when the invite system is off |
| `invite-request` | `create({ geoLocation: { loc, countryId, city, streetAddress, house, notes }, apartment, deviceId })` | call | InviteRequest | invite by location, no invite found |
| `user-auth` | `getRegistrationsSettings()` | call | `{ registrationRequiredOnStart: boolean }` | app start (ServerSettings) |
| `user-auth` | `register({ user: { apartment, geoLocation } })` | call | User | both invite flows |
| `user` | `get(userId)` | obs | User | `Store.isLogged()` (first value), product feed location (production), merchants location |
| `user` | `getCards(userId)` | call | `Stripe.Card[]` (uses `[0].id`, `[0].last4`) | payment component start |
| `user` | `updateEmail(userId, email)` | call | User | new-card payment, step 1 |
| `user` | `addPaymentMethod(userId, stripeTokenId)` | call | cardId (string) | new-card payment, step 2 |
| `user` | `getAboutUs(userId, deviceId, language)` | obs | HTML string | About page |
| `user` | `getHelp(userId, deviceId, language)` | obs | HTML string | Help page |
| `user` | `getPrivacy(userId, deviceId, language)` | obs | HTML string | Privacy page |
| `user` | `getTermsOfUse(userId, deviceId, language)` | obs | HTML string | Terms page |
| `user-products` | `getPlaceholder(userId, deviceId)` | obs | HTML string | product feed "nothing here" placeholder |
| `geo-location` | `getAddressByCoordinatesUsingArcGIS(lat, lng)` | call | `{ locality, thoroughfare, country }` or null | invite by location prefill |
| `warehouse` | `get(warehouseId, fullProducts = true)` | obs | Warehouse (`name`, `logo`, `isPaymentEnabled`, `products`, `contactPhone`, `geoLocation`, `orderBarcodeType`) | many, see pages |
| `warehouse-products` | `get(warehouseId, fullProducts)` | obs | WarehouseProduct[] | product details "sold out" watcher |
| `warehouse-orders` | `create({ warehouseId, products: [{ count, productId }], userId, orderType, waitForCompletion?, options: { autoConfirm: true } })` | call | Order | Buy |
| `warehouse-orders` | `addMore(warehouseId, userId, orderId, products)` | call | Order | Buy while an order is open (shopping cart) |
| `warehouse-orders` | `userComplete(orderId)` | call | Order | shopping cart "Confirm" |
| `warehouse-orders` | `cancel(orderId)` | call | Order | Undo / cancel / issue close |
| `order` | `get(orderId, { populateWarehouse: true, populateCarrier: true })` | obs | Order | live order tracking |
| `order` | `confirm(orderId)` | call | Order | after a new-card payment |
| `order` | `payWithStripe(orderId, cardId)` or `payWithStripe(orderId, cardId, shownCurrency)` | call | Order | saved card (2 args) / new card (3 args) |
| `order` | `getStripeCurrency()` | call | currency string, e.g. `usd` | payment component start |
| `order` | `refundWithStripe(orderId)` | call | Order | after cancel, when `order.isPaid` |
| `order` | `removeProducts(orderId, [productId])` | call | Order | order card, remove product |
| `order` | `addProductComment(orderId, orderProductId, comment)` | call | Order | order card, product comment |

### 1.4 GraphQL operations (copied verbatim)

`services/geo-location/geo-location-products.ts`: product feed. `watchQuery` with
`pollInterval: 2000`; the client keeps only rows where `warehouseProduct.isProductAvailable === true`
(after dropping null rows).

```graphql
query GeoLocationProductsByPaging(
	$geoLocation: GeoLocationFindInput!
	$options: GetGeoLocationProductsOptions
	$pagingOptions: PagingOptionsInput
	$searchText: String
) {
	geoLocationProductsByPaging(
		geoLocation: $geoLocation
		options: $options
		pagingOptions: $pagingOptions
		searchText: $searchText
	) {
		distance
		warehouseId
		warehouseLogo
		warehouseProduct {
			id
			price
			initialPrice
			count
			soldCount

			product {
				id
				title {
					locale
					value
				}
				description {
					locale
					value
				}
				details {
					locale
					value
				}
				images {
					locale
					url
					width
					height
					orientation
				}
			}
			isManufacturing
			isCarrierRequired
			isDeliveryRequired
			isProductAvailable
			isTakeaway
			deliveryTimeMin
			deliveryTimeMax
		}
	}
}
```

Variables: `geoLocation: { loc: { type: 'Point', coordinates: [lng, lat] } }`,
`pagingOptions: { skip, limit }`, `options: { isDeliveryRequired, isTakeaway, merchantIds,
imageOrientation, locale, withoutCount: true }`, `searchText` (search only).

```graphql
query GetCountOfGeoLocationProducts(
	$geoLocation: GeoLocationFindInput!
	$options: GetGeoLocationProductsOptions
	$searchText: String
) {
	getCountOfGeoLocationProducts(
		geoLocation: $geoLocation
		options: $options
		searchText: $searchText
	)
}
```

`services/merchants/warehouse-products.ts`: one warehouse product, used to check it still exists
before opening details, and to resume a buy after registration.

```graphql
query GetWarehouseProduct(
	$warehouseId: String!
	$warehouseProductId: String!
) {
	getWarehouseProduct(
		warehouseId: $warehouseId
		warehouseProductId: $warehouseProductId
	) {
		id
		price
		initialPrice
		count
		soldCount

		product {
			id
			title {
				locale
				value
			}
			description {
				locale
				value
			}
			details {
				locale
				value
			}
			images {
				locale
				url
				width
				height
				orientation
			}
		}
		isManufacturing
		isCarrierRequired
		isDeliveryRequired
		isProductAvailable
		isTakeaway
		deliveryTimeMin
		deliveryTimeMax
	}
}
```

`services/geo-location-merchants.service.ts`: merchants near the customer.

```graphql
query getCloseMerchants(
	$geoLocation: GeoLocationFindInput!
) {
	getCloseMerchants(geoLocation: $geoLocation) {
		id
		username
		name
		logo
	}
}
```

`services/merchants/merchants.service.ts`: merchant search by name (merchants page, search panel).

```graphql
query GetMerchantsBuyName(
	$searchName: String!
	$geoLocation: GeoLocationFindInput
) {
	getMerchantsBuyName(
		searchName: $searchName
		geoLocation: $geoLocation
	) {
		id
		username
		name
		logo
		isActive
	}
}
```

`services/orders/orders.service.ts`: `getOrder` takes the selection set as a string (`{status}` or
`{waitForCompletion}` are the only ones used).

```graphql
query GetOrder($id: String!) {
	getOrder(id: $id) ${getObject}
}
```

```graphql
query GenerateOrdersByCustomerId(
	$numberOfOrders: Int!
	$customerId: String!
) {
	generateOrdersByCustomerId(
		numberOfOrders: $numberOfOrders
		customerId: $customerId
	)
}
```

`services/users/users.service.ts` (`GetUser`): defined, **not called by any page**.

```graphql
query GetUser($id: String!) {
	user(id: $id) {
		apartment
		geoLocation {
			countryId
			countryName
			postcode
			city
			streetAddress
		}
	}
}
```

Order history and order details (`pages/+orders-history/*.model.ts`, fragments in
`components/order/order.model.ts` and `components/order/product/product.model.ts`):

```graphql
query OrdersHistoryPageQuery($userId: String!) {
	getOrders(userId: $userId) {
		...OrderFragment
	}
}

query OrderDetailsPageQuery($id: String!) {
	getOrder(id: $id) {
		...OrderFragment
	}
}

fragment OrderFragment on Order {
	id
	deliveryTime
	warehouseId
	deliveryTime
	createdAt
	status
	user {
		id
		geoLocation {
			countryName
			countryId
			streetAddress
			house
			postcode
			house
			city
		}
	}
	warehouse {
		id
		logo
	}
	products {
		...OrderProductFragment
	}
}

fragment OrderProductFragment on OrderProduct {
	count
	price
	isTakeaway
	product {
		images {
			locale
			orientation
			url
		}
		title {
			locale
			value
		}
		description {
			locale
			value
		}
	}
}
```

**(quirk)** the order card's "remove product" and "add comment" actions need `OrderProduct.id`,
`comment` and `product._id`, which these fragments do not select. They only work on orders that came
from the pyro `order.get` (the shopping-cart modal), not on history rows.

---

## 2. Configuration (`scripts/env.ts` → `src/environments/environment.ts`)

`scripts/configure.ts` reads `.env` (dotenv) through envalid and writes `environment.ts` and
`environment.prod.ts` (`--environment=prod` sets `production: true`). Everything is public (it
ships to the browser).

| Key | Default | Meaning |
| --- | --- | --- |
| `production` | `false` | set from `--environment` |
| `VERSION` | `1.0.0` | |
| `PRODUCTS_VIEW_TYPE` | `slides` | `slides` or `list`: product feed layout |
| `ORDER_INFO_TYPE` | `page` | `page` or `popup`: order tracking as a page or as a modal |
| `API_FILE_UPLOAD_URL` | `https://api.cloudinary.com/v1_1/evereq/upload` | unused by the shop |
| `INVITE_BY_CODE_LOGO` | `assets/imgs/ever-logo.svg` | logo on invite by code |
| `NO_INTERNET_LOGO` | `assets/imgs/logo.png` | logo on server-down / connection-lost |
| `COMPANY_NAME` | `Ever Co. LTD` | connection-lost page |
| `GOOGLE_MAPS_API_KEY` | `''` | maps + geocoder (warning printed when empty) |
| `GOOGLE_ANALYTICS_API_KEY` | `''` | unused at runtime |
| `FAKE_UUID` | random UUID v4 at config time | device uuid in the browser |
| `MIXPANEL_API_KEY` | `''` | unused at runtime |
| `DEFAULT_LANGUAGE` | `en-US` | language used at start when set (see 4.1) and product-locale fallback |
| `DEFAULT_LOCALE` | `en-US` | product feed `locale` when no language yet |
| `DELIVERY_TIME_MIN` / `DELIVERY_TIME_MAX` | `30` / `60` | default "30-60 min" label |
| `SUPPORT_NUMBER` | `0888888888` | side menu "Call us"; the item hides when empty |
| `STRIPE_PUBLISHABLE_KEY` | `''` | card payments; empty = Pay says card payment is not available and Stripe.js is not loaded |
| `STRIPE_POP_UP_LOGO` | Ever avatar PNG URL | logo of the new-card form (was the Checkout popup image) |
| `MAP_MERCHANT_ICON_LINK` / `MAP_USER_ICON_LINK` / `MAP_CARRIER_ICON_LINK` | Google kml icon URLs | map markers |
| `DEFAULT_LATITUDE` / `DEFAULT_LONGITUDE` | `42.6459136` / `23.3332736` (Sofia) | **when both are set, the app never asks the device for its location** and uses these |
| `GQL_ENDPOINT` | `http://localhost:8443/graphql` | |
| `GQL_SUBSCRIPTIONS_ENDPOINT` | `ws://localhost:2086/subscriptions` | |
| `SERVICES_ENDPOINT` | `http://localhost:5500` | pyro socket.io + server check |
| `HTTPS_SERVICES_ENDPOINT` | `https://localhost:2087` | unused by the shop |
| `FAKE_INVITE_*` | id `1ae9d04f9010d834f8906881`, Sofia, 1700, Simeonovsko shose 104, apt 3, code `8321`, country `21` | dev invite code that registers without the server (see 3.3) |
| `SETTINGS_APP_TYPE` | `shop-mobile` | maintenance app type |
| `SETTINGS_MAINTENANCE_API_URL` | `''` | maintenance JSON URL; empty = no maintenance check |
| `MERCHANT_IDS` | `[]` | "single merchant" mode: feed limited to these warehouses, and no merchants page |
| `SHOPPING_CART` | `false` | orders stay open (`waitForCompletion`) and Buy adds to the same order |
| `WEB_CONCURRENCY`, `WEB_MEMORY`, `PORT` (4201) | | pm2 server only |

---

## 3. App start and global behaviour

### 3.1 Start-up sequence (`app.module.ts` APP_INITIALIZERs, in this order, all awaited)

1. **Server check** (`ServerConnectionService.load`): HTTP GET `SERVICES_ENDPOINT`. On an HTTP error,
   `localStorage.serverConnection = error.status` (so `0` when unreachable). **(quirk)** the check
   only "passes" because it fails: the API root answers 404 (or non-JSON), which stores `404`. A
   missing key reads as `Number(null) === 0`, i.e. "down", so a root that answered valid JSON would
   send the app to the server-down page. A rebuild should treat "unreachable" as down and anything
   else as up.
2. **Google Maps loader**: injects the Maps script and waits for its callback. **(quirk)** with no
   network to Google this never resolves and the app never starts.
3. **Maintenance** (`MaintenanceService.load(SETTINGS_APP_TYPE, SETTINGS_MAINTENANCE_API_URL)`):
   GET the URL, read `response.maintenance: [{ type, status, message }]`. If an entry with
   `type === 'api'` and `status` true, or `type === SETTINGS_APP_TYPE` and `status` true, exists:
   `localStorage.maintenanceMode = entry.type`; otherwise remove it. Any error removes it.
4. **Server settings** (`ServerSettings.load`), only when not in maintenance and
   `serverConnection != 0`: `invite.getInvitesSettings()` → `_inviteSystem = 'enabled'|'disabled'`;
   `user-auth.getRegistrationsSettings()` → `_registrationSystem = 'enabled'|'disabled'`.
   **(quirk)** the four steps start side by side, and this one reads `serverConnection` before
   step 1 has written it. On the very first start of a fresh install the key is missing, so the
   settings are skipped: `_registrationSystem` and `_inviteSystem` stay unset and the customer
   lands on the invite pages (by location) whatever the server says. From the next start on the
   settings apply.

Then `AppComponent`:

- Adds languages `en-US, bg-BG, he-IL, ru-RU, es-ES, fr-FR`, fallback `en-US`, then uses
  `DEFAULT_LANGUAGE` if set, else the browser language when it matches, else `en-US`.
- After `platform.ready()`: watches the network (3.4), sets the status bar to black opaque, hides
  the splash screen, and if `_deviceId` is unset calls `device.create({ channelId: null (no
  UrbanAirship), language: current language, type: 'browser' or device platform lowercased, uuid:
  device uuid or FAKE_UUID })` and stores `_deviceId = device.id`.

### 3.2 Top-level routes and guards

| Path | Page | Guard |
| --- | --- | --- |
| `` (all pages below) | `PagesModule` | `PagesModuleGuard`: `maintenanceMode` set → `/maintenance-info`; `serverConnection == 0` → `/server-down` |
| `maintenance-info` | Maintenance page | allowed only while `maintenanceMode` is set, else → `` |
| `server-down` | Server down page | none |
| `**` | redirect to `` | |
| `` (exact) | redirect to `invite` | |
| `invite` | Invite shell (children `by-code` (default), `by-location`) | `InviteModuleGuard`: `_userId` set **or** `_registrationSystem === 'disabled'` → `/products` |
| `invite/by-code` | Invite by code | `inviteSystem` off → `invite/by-location` |
| `invite/by-location` | Invite by location | `_inviteRequestId` set and `inviteSystem` on → `invite/by-code` |
| `products` | Product feed (child `order`) | load: not logged in (see `isLogged`) and `_registrationSystem === 'enabled'` → `/invite`. Activate: `_orderId` set and URL is exactly `/products` → `/products/order` |
| `products/order` | (legacy) `OrderPage` module | `_orderId` unset → `/products` |
| `products/product-details/:id?backUrl=&warehouseId=` | Product details | none |
| `orders-history` | Orders history | not logged in → `/invite` |
| `orders-history/:id` | Order details | (same module) |
| `order-info` | Delivery order tracking page | not logged in → `/invite`; `deliveryType === Takeaway` → `/order-info-takeaway` |
| `order-info-takeaway` | Takeaway order tracking page | not logged in → `/invite`; `deliveryType === Delivery` → `/order-info` |
| `merchants` | Merchants list | not logged in and registration `enabled` → `/invite` |
| `language` | Language selection | none |
| `info/about`, `info/help`, `info/privacy`, `info/terms-of-use` | Info pages | not logged in and registration `enabled` → `/invite` |
| `call-us` | "Call unsuccessful" page/modal | none |
| `errors/connection-lost` | Connection lost | none |

`Store.isLogged()`: if `_userId` is set, `user.get(_userId)` first value; success → true; error →
clear `_userId`, false. No `_userId` → false.

### 3.3 Side menu (`components/menu`)

Two `ion-menu`s with the same content: `ltr` (side start) and `rtl` (side end); on language change
the `rtl` one is enabled for `he-IL`, the `ltr` one otherwise. Opening it loads
`warehouse.get(inStore, false)` when "in store" mode is on. Title `SIDE_MENU.TITLE`. Items:

- (no title group) Products → `/products`; Orders history → `/orders-history`.
- Store group (**(quirk)** never shown: the submenu's `merchant` is never set): Call waiter, About
  `<merchant name>`.
- Settings: Language → `/language`.
- Info: FAQ → `/info/help`; Call us (only when `SUPPORT_NUMBER` is not empty: dials it; on failure
  opens the "call unsuccessful" modal `CallPage`); About us → `/info/about`.
- Legals: Privacy → `/info/privacy`; Terms of use → `/info/terms-of-use`.

### 3.4 Connection handling

- **Server down at start** → `/server-down`: logo `NO_INTERNET_LOGO`, text `NO_SERVER_VIEW.NO_SERVER`.
  Every 5 s it re-runs the server check; when `serverConnection != 0` it navigates to ``.
- **Network lost** (Cordova network plugin `onDisconnect`) → `/errors/connection-lost`: logo,
  `CONNECTION_ERROR_VIEW.TITLE`, company name. On reconnect → `location.back()`.
- **Maintenance** → `/maintenance-info`: shows `getMessage(maintenanceMode)` (the `message` of the
  entry); every 5 s checks `api.status && <app type>.status`; when false, clears `maintenanceMode`
  and navigates to ``.

### 3.5 Global modal blur

Pages that open an order modal pass a `modalChange` EventEmitter into it; while it reports `true`
the page content gets the `blur-filter` class and a `blur-lighter` overlay.

---

## 4. Flows and pages

### 4.1 Language selection (`/language`)

Radio list: English `en-US`, Bulgarian `bg-BG`, Hebrew `he-IL`, Russian `ru-RU`, Spanish `es-ES`,
French `fr-FR` (labels `ENGLISH`, `BULGARIAN`, `HEBREW`, `RUSSIAN`, `SPANISH`, `FRENCH`). Choosing
one: `_language = lang`, `translate.use(lang)`, `<html dir>` = `rtl` for `he-IL` else `ltr`,
`<html lang>` = first 2 letters, then `location.back()`. Header: menu button, title
`LANGUAGE_VIEW.TITLE`, Back (`BACK`).

Start language (`Store._initLanguage`): `_language` from storage if set; otherwise the device
language (Cordova Globalization) or browser language mapped by its 2-letter prefix (`he, ru, bg, en,
es, fr`), else `en-US`. `AppComponent` then also applies `DEFAULT_LANGUAGE` when set, which wins
over the stored one at start **(quirk, fleet task T-2805 is fixing this)**.

### 4.2 First run: invite by code (`/invite/by-code`)

Shown when the invite system is on and the user has no `_userId`.

- Logo `INVITE_BY_CODE_LOGO`, text `INVITE_VIEW.BY_CODE.LOGO.DETAILS`.
- Not yet requested an invite (`_inviteRequestId` unset): button "Get in by address"
  (`INVITE_VIEW.GET_IN_BY_ADDRESS`) → `invite/by-location`; Facebook / Google buttons (no action);
  "or … `INVITE_VIEW.BY_CODE.OR_WHAT`".
- Already requested (`_inviteRequestId` set): `INVITE_VIEW.INVITED_TEXT.TITLE`/`DETAILS` with the
  saved `inviteAddress`, and `INVITE_VIEW.BY_CODE.INVITED`.
- A numeric input (placeholder `INVITE_VIEW.BY_CODE.INVITE_CODE`), 4 digits max. As soon as the
  value is 1000-9999 it submits and clears the field:
  1. If the code equals `FAKE_INVITE.CODE` (8321): build an invite from `FAKE_INVITE_*` at
     `[DEFAULT_LONGITUDE, DEFAULT_LATITUDE]`, register (step 3), then
     `generateOrdersByCustomerId(40, userId)` (GraphQL) to seed 40 demo orders.
  2. Else get the device location (may fail, then `location` is undefined) and call
     `invite.getByCode({ location, inviteCode })`. Null → `alert('Wrong code!')`.
  3. Register: `user-auth.register({ user: { apartment, geoLocation } })` from the invite,
     `_userId = user.id`. If `_backToDetails` is set → product details of that id (with
     `backUrl=/products&warehouseId=<_warehouseId>`) and clear `_backToDetails`; else →
     `/products` (skipLocationChange).

### 4.3 First run: invite by location (`/invite/by-location`)

Form: city, street, house (number), apartment (number) with a "no apartment" toggle
(`isApartment`), country (default `Country.IL`), optional notes (`LOCATION_NOTES`,
`ENTER_NOTES_HERE`, toggled textarea). While detecting it shows `INVITE_VIEW.DETECTING_LOCATION`.
Title `INVITE_VIEW.YOUR_ADDRESS`, submit `INVITE_VIEW.GET_IN`, `INVITE_VIEW.LAUNCH_NOTIFICATION`,
Back.

- **Prefill** (50 ms after open): coordinates = `DEFAULT_LATITUDE/LONGITUDE` when set, else device
  GPS (`timeout 30000`, `enableHighAccuracy`). Reverse geocode with
  `geo-location.getAddressByCoordinatesUsingArcGIS(lat, lng)`; if null, Google `Geocoder` by
  location. Fill `city ← locality`, `streetAddress ← thoroughfare` (only if empty),
  `country ← Country[address.country]`.
- **Valid** when city and street are non-empty strings, house and country are non-zero numbers,
  and apartment is a non-zero number or "no apartment" is set. Invalid submit →
  `alert('Some of the information missing!')`.
- **Submit**: `invite.getByLocation({ apartment: isApartment ? apartment : '0', house, streetAddress,
  city, countryId, notes })`.
  - Invite found → register (as 4.2 step 3, but it writes `localStorage._userId` directly).
  - Not found → create an invite request: coordinates from a Google forward geocode of
    `"<street> <house>, <city>"` restricted to the country (needs country, locality, route and
    street_number in the result), else the device / default coordinates, else throw.
    `invite-request.create({ geoLocation: { loc, countryId, city, streetAddress, house, notes },
    apartment, deviceId: _deviceId })`. Then:
    - invite system **on**: `_inviteRequestId = request.id`,
      `inviteAddress = request.toAddressString()`, → `invite/by-code` (wait for a code);
    - invite system **off**: `invite.create(request)` then register with that invite.

### 4.4 Product feed (`/products`)

Header (toolbar `primary`): menu button; in store mode the merchant name + `PRODUCTS_VIEW.TITLE`;
when not in store and no open order, a Takeaway / Delivery toggle (`PRODUCTS_VIEW.TAKEAWAY`,
`PRODUCTS_VIEW.DELIVERY`); search icon (no open order); store sign (opens `/merchants`, or toggles
single-merchant mode when `MERCHANT_IDS` is set); when an order is open, an order sign that opens the
order info.

- **Location**: production with `_userId` → `user.get(userId).geoLocation`; otherwise the current
  location: `DEFAULT_LATITUDE/LONGITUDE` if set, else device GPS, else browser geolocation, else
  `GET /getLocationByIP`. No location → `_registrationSystem = 'once'` and → `/invite`.
- **Delivery type** `deliveryType` (`0` Delivery, `1` Takeaway): in store mode it is forced to
  Takeaway. Toggling it (no open order) reloads the feed from scratch.
- **Merchant filter** (`merchantIds` in options): `MERCHANT_IDS` if set; else `[inStore]` in store
  mode; else, when an order is open, `GetOrder {status}`: status `< Delivered (2)` → only that
  order's warehouse; otherwise the order is finished: remove `startDate`, `endTime`, `_orderId`.
- **Loading**: first `GetCountOfGeoLocationProducts`, then `GeoLocationProductsByPaging` with
  `skip = products loaded so far`, `limit = 10`, `imageOrientation` = `1` (slides) or `0` (list),
  `locale` = current language or `DEFAULT_LOCALE`, `withoutCount: true`. The first poll result is
  appended; later polls (every 2 s) only update `soldOut = count === 0` on rows already shown.
  Products with `count === 0` are hidden.
- **Placeholder**: when logged in, `user-products.getPlaceholder(userId, deviceId)` gives HTML shown
  when the feed is empty.
- **Slides view** (`PRODUCTS_VIEW_TYPE=slides`, full-screen vertical card per product, swiper
  options `autoHeight, resistance, watchSlidesProgress, longSwipes: false`): image (locale-picked),
  discount badge, delivery-info badge over the image, merchant logo, title, description shortened
  to 45 chars (`…` after 42), Buy button "`PRODUCTS_VIEW.BUY_BUTTON.PRE` <price>$
  `PRODUCTS_VIEW.BUY_BUTTON.SUF`" (or `PRODUCTS_VIEW.NOT_AVAILABLE` when sold out, disabled), and
  Details (`PRODUCTS_VIEW.DETAILS.DETAILS`). When the slide about to show is the last or second to
  last, it loads 10 more. A progress bar (`ng-progress`) sits on top (its progress updates are
  commented out).
- **List view** (`PRODUCTS_VIEW_TYPE=list`): cards with logo, title, description shortened to 53,
  delivery info, image, discount, Buy and Details buttons; infinite scroll (threshold 100px) loads
  10 more until `productsCount <= products.length`.
- **Discount badge**: `floor((1 - price / initialPrice) * 100)` %, hidden when 0 (no
  `initialPrice` or equal prices).
- **Delivery info badge**: icon `fa-bolt` (takeaway) or `fa-motorcycle` (delivery). Delivery:
  "`min`-`max` `PRODUCTS_VIEW.MINUTES`" (product times, else `DELIVERY_TIME_MIN/MAX`). Takeaway:
  `deliveryTimeMax` null or ≤ 15 is "instant" and shows `PRODUCTS_VIEW.READYFOR` ("Ready for");
  otherwise "`min`-`max` `PRODUCTS_VIEW.MINUTES`". The second line is `PRODUCTS_VIEW.DELIVERY`
  or `PRODUCTS_VIEW.TAKEAWAY`.
- **Details button**: `GetWarehouseProduct(warehouseId, warehouseProduct.id)`; found → product
  details with `backUrl=/products&warehouseId=…`; not found → mark the row sold out.
- **Search** (search icon, replaces the feed): text input (`SEARCH_VIEW.SEARCH_PLACEHOLDER`), on
  change runs `GetMerchantsBuyName(searchInput, { loc })` (first 5, "View more" adds 5) and
  `GeoLocationProductsByPaging(…, { limit: 10, skip }, { isDeliveryRequired, isTakeaway },
  searchInput)` plus the count ("View more" adds 10). Merchants show open/closed
  (`SEARCH_VIEW.OPEN` / `SEARCH_VIEW.CLOSED` from `isActive`), empty result `SEARCH_VIEW.EMPTY_LIST`.
  Tapping a product opens its details as above.

### 4.5 Buy / create order

Used by the feed Buy button and the product details Buy button.

1. Not registered and `_registrationSystem === 'disabled'` ("browse first" mode): set
   `_registrationSystem = 'once'`, `_buyProduct = warehouseProduct.id` (feed) or product id
   (details), `_warehouseId = warehouseId`, (details also sets `_backToDetails = product id`), go to
   `/invite`. After registration the feed (`continueOrder` on init) reloads the product with
   `GetWarehouseProduct` and buys it, then clears `_buyProduct` and `_warehouseId`. Product details
   does the same on load.
2. Otherwise, input: `{ warehouseId, products: [{ count: 1, productId: product.id }], userId,
   orderType: deliveryType, waitForCompletion: SHOPPING_CART (feed only), options: { autoConfirm:
   true } }`.
   - No open order → `warehouse-orders.create(input)`; `_orderId = order.id`,
     `_currOrderWarehouseId = order.warehouseId`. In popup mode the feed keeps only that merchant's
     products.
   - Open order (feed only) → `warehouse-orders.addMore(warehouseId, userId, _orderId, products)`.
   - Error (sold out, closed) → mark the row sold out.
3. Show the order info:
   - `SHOPPING_CART` and `GetOrder {waitForCompletion}` is true → the **order info modal**
     (`OrderInfoModalComponent`): full order card (`order.get(_orderId, { populateWarehouse: true })`
     first value) with "Confirm" and "Add more" buttons; both dismiss with `true`, which calls
     `warehouse-orders.userComplete(_orderId)` and then shows the order info again.
   - `ORDER_INFO_TYPE=popup` → modal `OrderPage` (delivery) or `OrderTakeawayInfoPopup` (takeaway).
   - `ORDER_INFO_TYPE=page` → `navigateRoot('/order-info')` (delivery) or `'/order-info-takeaway'`.
   - In popup mode the feed also opens the modal on load when an order is open.

### 4.6 Product details (`/products/product-details/:id?backUrl&warehouseId`)

`warehouse.get(warehouseId, true)` first value → logo and the warehouse product whose
`product.id === :id`. Header: menu, title `PRODUCTS_VIEW.DETAILS.DETAILS`, Back
(`PRODUCTS_VIEW.DETAILS.BACK`, goes to `backUrl`). Body: logo, title, description (53), delivery
info, discount, images, details (`PRODUCTS_VIEW.DETAILS.INCLUDES` + product `details`), Buy button
(as feed; disabled when sold out).

Images: one image → shown alone. Several: horizontal = `orientation === 2`, vertical = others. One
of each → the horizontal one alone. Else a carousel (2 per view, 5px apart) of the vertical ones
(or horizontal when only horizontal ones exist).

Sold out: `warehouse-products.get(warehouseId, false)` (live); sold out when the product is missing
or `count <= 0`.

### 4.7 Order tracking: delivery (`OrderPage` modal and `/order-info` page)

Live order: `order.get(_orderId, { populateWarehouse: true, populateCarrier: true })`. Payments
shown only when `warehouse.get(_currOrderWarehouseId).isPaymentEnabled`. On open, if `startDate` is
unset it stores `startDate = JSON.stringify(new Date().toString())`.

- **Status step** (`DeliveryStatus`): `0` Warehouse, `1` Carrier (`carrierStatus >=
  CarrierPickedUpOrder (2)`), `2` Customer (`carrierStatus >= CarrierArrivedToCustomer (4)`), `3`
  Completed (`isCompleted && !isCancelled`). Three steps shown: We / Carrier / You
  (`BUY_POPUP.DELIVERY_STATUS.*`), the carrier icon flips in RTL.
- **Texts**: `BUY_POPUP.STATUSES.<step>.TITLE`, `.DETAILS` (with `%t` = delivery time range: the
  largest `deliveryTimeMin` and `deliveryTimeMax` of the order products, "min-max", one of them, or
  `30-60`), `.NOT_PAID_NOTE` (with `%s` = `totalPrice.toFixed(2)` + `$`). For a cancelled order the
  key is `BUY_POPUP.CANCEL.STATUSES.<step>.*`.
- **Elapsed time** (`e-cu-elapsed-time`): `mm : ss` (or `h : mm : ss`) since `startDate`, ticking
  every second; when the customer step ends the value is frozen into `endTime`.
- "View order products" (`BUY_POPUP.VIEW_ORDER_PRODUCTS`) → order info modal (order card).
- **Issues**: delivery issue = `carrierStatus >= IssuesDuringDelivery (204)`
  (`BUY_POPUP.DELIVERY_WRONG.DELIVERY_WRONG`, `TRY_AGAIN`, a "Call for details" text with no action); warehouse
  issue = `warehouseStatus >= AllocationFailed (200)` (`PROCESSING_WRONG`, `TRY_AGAIN`).
- Buttons while not completed and no issue: **Undo** (`BUY_POPUP.BUTTONS.UNDO`) → cancel modal
  (4.10), and the **payment** component (4.9).
- Completed: **End** (`BUY_POPUP.BUTTONS.END`, "Bon appetit!") → clear `startDate`, `endTime`,
  `_orderId`; modal: dismiss; page: `navigateRoot('/products')`. With an issue the modal's close
  first cancels the order (`warehouse-orders.cancel`) and refunds when paid.
- Modal close (×) / page Back → back to products, keeping the order. **(quirk)** the page clears
  the order on leave (`ngOnDestroy` → `closePopup`) unless Back was used.
- **Page only**: header `ORDER_INFO` + Back; two maps: carrier → customer directions (Google
  `DirectionsService`) when a carrier is set, and the user + warehouse markers map
  (`MAP_USER_ICON_LINK`, `MAP_MERCHANT_ICON_LINK`) fitted to both. When an issue appears it opens
  the **issue modal** (4.11) once.

### 4.8 Order tracking: takeaway (`OrderTakeawayInfoPopup` modal and `/order-info-takeaway` page)

Same live order and `isPaymentEnabled` sources as 4.7.

- Paid banner: `BUY_POPUP.ORDER_PAID` + `totalPrice` + `!`.
- **Title** (`e-cu-order-takeaway-info-title`): status title/details/not-paid note (same keys as
  4.7), "View order products".
- **Store info**: `STORE_INFO`, merchant name, full address "`city`, `street` `house`, [`postcode`, ]
  `country name`", map link (popup: opens the **map modal** with customer → store directions,
  title `MAP`, Close), and the merchant phone (`contactPhone`) with a call button (dials; failure
  only logs).
- **Order code**: QR code of `order.id` (default, or `orderBarcodeType === QR (0)`), or a 1-D
  barcode (`jsbarcode`) for `CODE128 (1)`, `CODE39 (2, bar width 0.5)`, `pharmacode (3)`, `MSI (4)`;
  plus the short order number `getIdFromTheDate(order)`.
- **Steps**: "I'm here" (`BUY_POPUP.BUTTONS.IM_HERE`, in store mode "Got it!") switches to the
  products view (product list, QR / products toggle `SHOW_QR_CODE` / `SHOW_PRODUCTS` in the popup);
  "Got it!" (`GOT_IT`) completes (clear `startDate`, `endTime`, `_orderId`, → products). Page: "Got
  it!" only once `warehouseStatus >= PackagingFinished (6)`. Undo / Cancel (`UNDO` /
  `BUY_POPUP.BUTTONS.CANCEL`) → cancel modal. Payment component on each step.
- Warehouse issue (`warehouseStatus >= 200`): popup shows `PROCESSING_WRONG` + OK (cancel + refund
  when paid, clear the order). The page opens the issue modal once.

### 4.9 Payment (`e-cu-payment`, `pages/+products/+order/common/payment`)

Inputs: `order`, `modalChange`, `smallButtons`. This is where most fleet fixes landed; keep every
rule.

On create: `user.getCards(_userId)` → `userCard = cards[0]` (or none); and
`order.getStripeCurrency()` → `stripeCurrency = result.toUpperCase()`, `loadingStripeCurrency` true
while it runs; a failure only logs (never rejects).

Buttons:

- `!order.isPaid && !userCard` → **Pay with card** (`BUY_POPUP.BUTTONS.PAY_NOW`), disabled while
  `paying` or while waiting for the first currency load (`stripeCurrency == null &&
  loadingStripeCurrency`).
- `!order.isPaid && userCard` → **Pay with *1234 [card icon]** (`BUY_POPUP.BUTTONS.PAY_WITH_FIXED_CARD`
  + `*last4`), disabled while `paying`.
- `order.isPaid` → disabled **Paid** (`BUY_POPUP.BUTTONS.PAID`).

`paying` = this component's flag **or** `Store.isPaying(_orderId)`. The set of orders being paid
lives in the root `Store` (memory only, not storage), so a second payment component created while a
payment runs (takeaway "I'm here", popup re-open) keeps its buttons disabled. (#1645/#1646)

**Saved card** (`payWithUserCard`): return if paying (local or Store); throw "Can't pay in app"
without `STRIPE_PUBLISHABLE_KEY`; throw if no card. Mark paying (local + `Store.startPaying`),
`order.payWithStripe(_orderId, userCard.id)` (2 args, no currency). On any error: alert
`BUY_POPUP.PAYMENT_FAILED` (translated, never the server text) and log; it resolves, never rejects.
Finally clear both paying flags. (#1652)

**New card** (`toPaymentStage`):

1. Return if paying. Throw "Can't pay in app" without a key.
2. `currency = stripeCurrency`. If null: when not loading, alert `BUY_POPUP.PAYMENT_FAILED` and
   reload the currency; return either way (the popup must open straight from the tap, so it never
   waits on the network). (#1648)
3. Popup mode: dismiss the current modal first.
4. (Ionic since `feat/latest-stack-stripe-elements`: Stripe.js not loaded yet → alert
   `BUY_POPUP.CARD_FORM_NOT_LOADED` and load it again (#1663); otherwise the new-card modal with the
   same options and callbacks: logo, product, email, Stripe Card Element, "Pay {{amount}}", Cancel;
   `stripe.createToken(card, { name: email })` gives the token `{ id, email }`.) Before, the legacy
   Stripe Checkout: `StripeCheckout.configure({ panelLabel: 'Pay {{amount}}', key, image:
   STRIPE_POP_UP_LOGO, currency, allowRememberMe: false, token, closed })` and
   `handler.open({ name: <product title>, description: <product description>, amount:
   order.products[0].price * 100 })` (first product only).
5. `token(token)`: return if paying; mark paying **before the first await**; then
   1. `user.updateEmail(_userId, token.email)`; failure → alert `BUY_POPUP.EMAIL_NOT_SAVED` (it does
      not say whether the email has an account) (#1649, #1654);
   2. `user.addPaymentMethod(user.id, token.id)` → `cardId`; failure → alert
      `BUY_POPUP.PAYMENT_FAILED`;
   3. `order.payWithStripe(_orderId, cardId, currency)` (3 args: the server refuses when its
      currency is no longer the one shown); failure → alert `BUY_POPUP.PAYMENT_FAILED`, and when
      `err.name === 'StripeCurrencyChangedError'` set `stripeCurrency = null` and reload it;
   4. `order.confirm(_orderId)`; failure only logs.
   Finally clear the paying flags, then `close()`.
6. `close()` runs from the token handler and from Checkout's `closed` callback; in popup mode the
   first one to run opens the delivery order modal (`OrderPage`) and emits `modalChange(true)`; the
   second does nothing, so the modal opens **once** per Checkout session. (#1651)

All alerts use `translate.instant(key)` with the 6 locales (#1654). Pending fleet work the lead
ports at merge: T-2806 (Pay buttons when there is no Stripe key), T-2807 ("already paid" message).

### 4.10 Cancel order (`CancelPage` modal, "Undo")

Title `BUY_POPUP.UNDO_POPUP.TITLE`, text `BUY_POPUP.UNDO_POPUP.DETAILS.0/1/2`, buttons Yes (`YES`)
and Back.

- Yes: emit `modalChange(false)`; `warehouse-orders.cancel(_orderId)`; remove `startDate`,
  `endTime`; if the returned order `isPaid` → `order.refundWithStripe(order.id)`; `_orderId = null`;
  page mode → `navigateRoot('/products')`; dismiss.
- Back: dismiss; popup mode → reopen the order modal (delivery or takeaway); page mode → emit
  `modalChange(false)`.

### 4.11 Order issue (`IssuePage` modal)

Props: `order`, `areIssuesDuringDelivery`, `areIssuesDuringWarehouseProcessing`, `modalChange`.
Shows the matching `BUY_POPUP.DELIVERY_WRONG.*` text. OK: `warehouse-orders.cancel(order.id)`,
refund when `order.isPaid`, remove `startDate`, `endTime`, `_orderId = null`,
`navigateRoot('/products')`, dismiss.

### 4.12 Call carrier / merchant / support

- Merchant phone (takeaway store info) and support number (side menu "Call us"): Cordova
  `CallNumber.callNumber(number, true)`. A rebuild can open `tel:<number>`.
- Delivery issue text has a "Call for details" anchor (`BUY_POPUP.DELIVERY_WRONG.CALL_FOR_DETAILS`) with no href or handler **(quirk)**.
- Failure of "Call us" opens `CallPage`: `SIDE_MENU.GROUPS.INFO.CALL.WE_APPOLOGISE`,
  `…CALL_UNSUCCESSFULL`, OK closes.

### 4.13 Orders history (`/orders-history`) and order details (`/orders-history/:id`)

- History: `OrdersHistoryPageQuery { userId: _userId }` (watchQuery). Title
  `ORDER_HISTORY_VIEW.TITLE`. Empty: `LAST_PURCHASES_VIEW.NOTHING_ORDERED` and a button
  `LAST_PURCHASES_VIEW.TO_PRODUCTS` → `/products`. Each order is an **order card** with at most 3
  products and "`N` `MORE`" for the rest.
- Details: `OrderDetailsPageQuery { id }`, the same card with all products.
- **Order card / order component**: warehouse logo, "`TO`: `countryName` `postcode`, `city`",
  created date, status badge (`badge-energized` cancelled, `badge-assertive` issue,
  `badge-balanced` otherwise), state text: `PENDING` while `status < Delivered`; after that
  `COMPLETED` for takeaway, otherwise the delivery time ("m:ss min" between `createdAt` and
  `deliveryTime`), `IN_DELIVERY`, `CANCELED` or `FAILED`. Total = Σ `count * price`. Tapping an
  in-progress order in page mode → the tracking page. Each product: locale image (current language,
  else `en-US`; class vertical / horizontal / square from `orientation` 1 / 2 / other), title,
  description (53), count, `count * price`, "details" link (`ORDER_HISTORY_VIEW.DETAILS`). While in
  progress: comment (add / edit, `order.addProductComment`) and remove (`order.removeProducts`,
  the price shows 0 afterwards).

### 4.14 Merchants (`/merchants`)

Header `MERCHANTS`, Back (→ `products`). Search bar (`MERCHANTS_VIEW.NAME`); empty search →
`getCloseMerchants({ loc })` (`MERCHANTS_VIEW.CLOSE_TO_YOU`), else
`GetMerchantsBuyName(searchName, { loc })` (`MERCHANTS_VIEW.WITH_NAME '<name>'`); none →
`NOT_FOUND`. Location as in the feed (production with `_userId` → user location, else current
location). **Scan** (`SCAN`): barcode scanner → `warehouse.get(scannedText)` first value → puts its
name in the search box. Tapping a merchant: `inStore = merchant.id` → `products` (store mode:
takeaway only, feed limited to that merchant, header shows its name, the store sign leaves the
store).

### 4.15 Info pages (`/info/about`, `/info/help`, `/info/privacy`, `/info/terms-of-use`)

Each shows server HTML (initially `<h1>Loading...</h1>`) from `user.getAboutUs` / `getHelp` /
`getPrivacy` / `getTermsOfUse(_userId, _deviceId, _language || 'en-US')`. Titles
`ABOUT_VIEW.TITLE`, `HELP_VIEW.TITLE`, `PRIVACY_VIEW.TITLE`, `TERMS_OF_USE_VIEW.TITLE`.
**(quirk)** opened before the device is registered (first start), `_deviceId` is still empty and
the server answers "Device with id 'null' does not exists!": the page keeps showing Loading.

---

## 5. Local storage keys (`services/store.service.ts`)

All in `window.localStorage` (synchronous; `@ionic/storage` is set up but unused).

| Key | Values | Written by | Read by |
| --- | --- | --- | --- |
| `token` | string | never by the shop | GraphQL auth header |
| `_userId` | user id | registration; cleared when `user.get` fails | everything "logged in" |
| `_deviceId` | device id | app start (`device.create`) | invite request, placeholder, info pages |
| `_inviteRequestId` | invite request id | invite by location (invite system on) | invite guards, by-code text |
| `inviteAddress` | address string | invite by location | invite by code |
| `_inviteSystem` | `enabled` / `disabled` | app start | invite guards, by-location |
| `_registrationSystem` | `enabled` / `disabled` / `once` | app start; set to `once` before a forced invite | guards, Buy |
| `_language` | `en-US` … | language page | start language, info pages |
| `_orderId` | open order id | Buy; cleared on end / cancel / issue / finished | all order pages, payment |
| `_currOrderWarehouseId` | warehouse id of the open order | Buy | `isPaymentEnabled`, feed filter |
| `deliveryType` | `0` Delivery / `1` Takeaway | feed (toggle, store mode) | Buy, guards, badges |
| `startDate` | JSON string of a date string | order pages on open | elapsed time |
| `endTime` | JSON of `{ timePassed: 'mm : ss' }` | delivery page when the customer step ends | elapsed time (frozen) |
| `inStore` | merchant id | merchants page, single-merchant toggle; `clearInStore()` | feed, menu, takeaway |
| `_buyProduct` | warehouse product id (or product id) | Buy before registration | feed / details resume |
| `_warehouseId` | warehouse id | Buy before registration | resume, back to details |
| `_backToDetails` | product id | details Buy before registration | invite → back to details |
| `shoppingCartData` | string | (getter/setter only, unused) | |
| `maintenanceMode` | `api` or app type | maintenance check | guards, maintenance page |
| `serverConnection` | HTTP status (`0` = down) | server check, server-down page | guards, settings |

In memory only: the set of order ids with a card payment in flight (`Store.isPaying`,
`startPaying`, `stopPaying`).

---

## 6. i18n

- Languages: `en-US`, `bg-BG`, `he-IL` (RTL), `ru-RU`, `es-ES`, `fr-FR`. Files:
  `src/assets/i18n/<lang>.json` (ngx-translate JSON, nested keys, `{{param}}` interpolation). Copy
  them verbatim; key counts: en 162, bg 162, fr 163, es 157, he 157, ru 156 (missing keys fall back
  to `en-US`).
- `CURRENT_DIRECTION` (`ltr` / `rtl`) is read from the translation and set as `dir` on most pages.
  `SIDEBAR_SIDE` likewise.
- Top-level groups: `INVITE_VIEW`, `PRODUCTS_VIEW`, `HELP_VIEW`, `ORDER_HISTORY_VIEW`,
  `LAST_PURCHASES_VIEW`, `ABOUT_VIEW`, `TERMS_OF_USE_VIEW`, `PRIVACY_VIEW`, `LANGUAGE_VIEW`,
  `SEARCH_VIEW`, `BUY_POPUP`, `SIDE_MENU`, `TIMER`, `CONNECTION_ERROR_VIEW`, `MERCHANTS_VIEW`,
  `NO_SERVER_VIEW`, plus single words (`OR`, `OR_LOWERCASE`, `YES`, `NO`, `OK`, `CITY`, `STREET`,
  `HOUSE`, `APARTMENT`, `BACK`, `MORE`, `TO`, `STORE_INFO`, `MAP`, `ORDER_INFO`, `CLOSE`, `SCAN`,
  `MERCHANTS`, `NOT_FOUND`, `IN_STORE`, `EXIT_STORE`, `FAILED`, `CANCELED`, `IN_DELIVERY`,
  `PENDING`, `COMPLETED`, `BROWSE`, language names, `SELECT`, `LOCATION_NOTES`,
  `ENTER_NOTES_HERE`).
- Arrays are indexed by number: `BUY_POPUP.STATUSES.0..3.TITLE|DETAILS|NOT_PAID_NOTE`,
  `BUY_POPUP.CANCEL.STATUSES.0.*`, `BUY_POPUP.UNDO_POPUP.DETAILS.0..2`.
- Payment messages (all 6 locales): `BUY_POPUP.PAYMENT_FAILED`, `BUY_POPUP.EMAIL_NOT_SAVED`.
- Order status text in the history comes from `Order.getStatusText(lang)` in
  `packages/common/src/entities/Order.ts` (hard-coded per language), not from the JSON.
- Product texts: `title`, `description`, `details` and `images` are `[{ locale, value|url }]`;
  pick the entry whose `locale` starts with the current language, else with `DEFAULT_LANGUAGE`,
  else the first.
- Untranslated literal keys used in the order info modal: `'Order Info'`, `'Confirm'`,
  `'Add More'` (they render as-is).

---

## 7. Native features (Cordova today) and what they do

After the latest-stack upgrade the Ionic app uses Capacitor 8 plugins for these (mapping in
`docs/latest-stack/shop-mobile-ionic.md`); the behaviour below is unchanged.

| Feature | Cordova / ionic-native (before the upgrade) | Used for |
| --- | --- | --- |
| Geolocation | `@ionic-native/geolocation` | feed, invite, merchants (skipped when the default lat/lng are set) |
| Device | `@ionic-native/device` | `platform`, `uuid` for `device.create` |
| Network | `@ionic-native/network` | connection lost / back |
| Status bar | `@ionic-native/status-bar` | `styleBlackOpaque()` at start |
| Splash screen | `@ionic-native/splash-screen` | `hide()` at start (config: 3000 ms, fade 300 ms) |
| Globalization | `@ionic-native/globalization` | device language at first start |
| Call number | `@ionic-native/call-number` | merchant phone, support number |
| Barcode scanner | `@ionic-native/barcode-scanner` (phonegap plugin) | merchants page "Scan" |
| In-app browser, dialogs, vibration, camera, local notifications, Google Analytics, Mixpanel, Intercom, unique device id | listed as dependencies / providers | **not called by any page** |

App id (Cordova `config.xml`): `co.ever.customer`, name `ever.shop.mobile`, version 0.2.0. Allowed
intents: http(s), `tel:`, `sms:`, `mailto:`, `geo:`, `market:` (Android), `itms:`/`itms-apps:` (iOS).

## 8. Visual identity

- Ionic colours: primary `#2a2c39` (dark toolbar), secondary `#bd4742` (red accents, toggle,
  buttons), tertiary `#7044ff`, success `#10dc60`, warning `#ffce00`, danger `#f04141`, dark
  `#222428`, medium `#989aa2`, light `#f4f5f8`. Product feed background is black (`color="black"`).
- Fonts: Roboto, Jura, Open Sans Hebrew (`src/theme/fonts`); Font Awesome 4 icons (`fa-*`) and
  Ionicons (`search`, `logo-facebook`, `logo-google`, `hand-left`, `information-circle`, menu).
- Page title: "Ever Mobile Shop App"; theme colour `#4e8ef7`; PWA manifest `src/manifest.json`.

## 9. Test data hints for e2e

- With the default env, location = Sofia (`42.6459136, 23.3332736`), language `en-US`,
  `ORDER_INFO_TYPE=page`, `PRODUCTS_VIEW_TYPE=slides`.
- The fake invite code `8321` registers a user without needing a matching invite on the server
  (it still calls `user-auth.register` and seeds 40 orders through GraphQL).
- Default admin `admin@ever.co` / `admin` exists on a fresh API (admin app, not this one).
