import type { GraphQLAccess } from '../../../graphql/access/graphql-access';

/**
 * Who may call a socket.io (pyro RPC) listener, `<router>.<method>`. Same
 * levels as GRAPHQL_ACCESS: `platform` (no tenant needed), `public` (anyone,
 * inside the tenant of the socket), roles (the login token sent in the
 * handshake `auth.token`), `superAdmin`. A listener without an entry is
 * refused (socket-access.spec.ts keeps the table complete).
 *
 * The roles come from the handshake: the merchant, carrier and admin apps
 * send their login token there (common-angular SOCKET_AUTH) and reconnect
 * after a login. Listeners that also take a `token` argument keep checking
 * it. Customer flows of the shops stay public, as before (DESIGN.md §5,
 * follow-up: customer ownership checks).
 */
export type SocketAccess = GraphQLAccess;

const admin = { roles: ['admin'] as any };
const manager = {
	roles: ['admin'] as any,
	adminRoles: ['owner', 'admin'] as any,
};
const store = { roles: ['admin', 'warehouse'] as any };
/** creates logins (members): owners / admins of the tenant, and stores for their carriers */
const storeManager = {
	roles: ['admin', 'warehouse'] as any,
	adminRoles: ['owner', 'admin'] as any,
};
const carrier = { roles: ['admin', 'carrier'] as any };
const staffApps = { roles: ['admin', 'warehouse', 'carrier'] as any };

export const SOCKET_ACCESS: Readonly<Record<string, SocketAccess>> = {
	// carrier-orders (carrier app)
	'carrier-orders.selectedForDelivery': carrier,
	'carrier-orders.getCount': staffApps,
	'carrier-orders.skipOrders': carrier,
	'carrier-orders.updateStatus': carrier,
	'carrier-orders.cancelDelivery': carrier,
	'carrier-orders.getAvailable': staffApps,
	'carrier-orders.get': staffApps,
	'carrier-orders.getCarrierOrders': staffApps,
	'carrier-orders.getCarrierCurrentOrder': staffApps,
	'carrier-orders.getCountOfCarrierOrdersHistory': staffApps,
	'carrier-orders.getCarrierOrdersHistory': staffApps,

	// carriers
	'carrier.get': 'public', // shops track the carrier of an order
	'carrier.getAllActive': staffApps,
	'carrier.register': storeManager,
	'carrier.login': 'platform',
	'carrier.updateStatus': staffApps,
	'carrier.updateActivity': staffApps,
	'carrier.updateEmail': staffApps,
	'carrier.updateGeoLocation': staffApps,
	'carrier.updateById': staffApps,

	// devices of the shops
	'device.get': 'public',
	'device.create': 'public',
	'device.updateLanguage': 'public',

	// geo
	'geo-location-orders.get': carrier,
	'geo-location-orders.getCountOfOrdersForWork': carrier,
	'geo-location-orders.getOrdersForWork': carrier,
	'geo-location-products.get': 'public',
	'geo-location-products.getCountOfGeoLocationProducts': 'public',
	'geo-location-products.geoLocationProductsByPaging': 'public',
	'geo-location.getAddressByCoordinatesUsingArcGIS': 'public',
	'geo-location-warehouses.get': 'public',
	'geo-location-warehouses.getMerchants': 'public',

	// invites (invite-only shops)
	'invite-request.get': 'public',
	'invite-request.create': 'public',
	'invite-request.getInvitesRequests': admin,
	'invite.get': 'public',
	'invite.getInvitedStreetLocations': 'public',
	// Open shops (invites off): a new customer's shop creates the invite for their
	// address, then registers (shop-web byLocation, Ionic by-location, Expo
	// InviteByLocationScreen). Invite-only shops: only admins invite. Read when
	// called, so loading this table does not load the env.
	get 'invite.create'(): SocketAccess {
		const { env } =
			require('../../../env') as typeof import('../../../env');

		return env.SETTING_INVITES_ENABLED ? admin : 'public';
	},
	'invite.getInvitesSettings': 'public',
	'invite.getByCode': 'public',
	'invite.getByLocation': 'public',
	'invite.getInvites': admin,

	// orders: customers follow, pay, confirm, comment and cancel their orders
	'order.get': 'public',
	'order.getStripeCurrency': 'public',
	'order.payWithStripe': 'public',
	'order.refundWithStripe': 'public',
	'order.confirm': 'public',
	'order.removeProducts': 'public',
	'order.addProductComment': 'public',
	'order.cancel': 'public',
	'order.updateCarrierStatus': staffApps,
	'order.updateWarehouseStatus': store,
	'order.addProducts': store,
	'order.decreaseOrderProducts': store,
	'order.paid': store,
	'order.getStoreOrdersChartTotalOrders': store,
	'order.getOrdersChartTotalOrders': admin,
	'order.getDashboardCompletedOrdersToday': admin,
	'order.getOrderedUsersInfo': store,
	'order.getDashboardCompletedOrders': admin,
	'order.getOrdersInDelivery': store,

	// catalog
	'products-category.get': 'public',
	'products-category.create': admin,
	'products-category.update': admin,
	'products-category.remove': admin,
	'product.get': 'public',
	'product.getProducts': 'public',
	'product.create': store,
	'product.update': store,
	'product.save': store,

	// customers (shops)
	'user-auth.register': 'public',
	'user-auth.updatePassword': 'public',
	'user-auth.addRegistrationInfo': 'public',
	'user-auth.login': 'public',
	'user-auth.getRegistrationsSettings': 'public',
	'user-orders.get': 'public',
	'user-products.getPlaceholder': 'public',
	'user.updateUser': 'public',
	'user.get': 'public',
	'user.getCards': 'public',
	'user.addPaymentMethod': 'public',
	'user.updateEmail': 'public',
	'user.updateGeoLocation': 'public',
	'user.getAboutUs': 'public',
	'user.getTermsOfUse': 'public',
	'user.getPrivacy': 'public',
	'user.getHelp': 'public',

	// stores
	'warehouse-carriers.get': store,
	'warehouse-carriers.updatePassword': store,
	'warehouse-orders.get': store,
	'warehouse-orders.create': 'public',
	'warehouse-orders.userComplete': 'public',
	'warehouse-orders.addMore': 'public',
	'warehouse-orders.createByProductType': 'public',
	'warehouse-orders.cancel': 'public',
	'warehouse-products.get': 'public',
	'warehouse-products.getProductsWithPagination': 'public',
	'warehouse-products.getProductsCount': 'public',
	'warehouse-products.getAvailable': 'public',
	'warehouse-products.getTopProducts': 'public',
	'warehouse-products.getProduct': 'public',
	'warehouse-products.remove': store,
	'warehouse-products.add': store,
	'warehouse-products.increaseCount': store,
	'warehouse-products.increaseSoldCount': store,
	'warehouse-products.saveUpdated': store,
	'warehouse-products.changePrice': store,
	'warehouse-products.decreaseCount': store,
	'warehouse-products.decreaseSoldCount': store,
	'warehouse-products.changeProductAvailability': store,
	'warehouse-products.changeProductTakeaway': store,
	'warehouse-products.changeProductDelivery': store,
	'warehouse.getAllActive': 'public',
	'warehouse.getAllStores': store,
	'warehouse.register': manager,
	'warehouse.updatePassword': store,
	'warehouse.login': 'platform',
	'warehouse.get': 'public',
	'warehouse.updateGeoLocation': store,
	'warehouse.updateAvailability': store,
	'warehouse.save': store,
	'warehouse-users.get': store,
	'warehouse-users.getPromise': store,
};

export function socketAccessKey(
	routerName: string,
	listenerName: string,
): string {
	return `${routerName}.${listenerName}`;
}
