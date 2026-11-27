import type { TenantRole } from '@modules/server.common/interfaces/ITenant';
import type { ActorRole, TenantCtx } from '../../tenant/tenant-context';

/**
 * Who may call a GraphQL operation (a field of Query, Mutation or
 * Subscription). Every operation of the schema has an entry; an operation
 * without one is refused (graphql-access.spec.ts keeps the table complete).
 *
 * - `platform`: needs no tenant (tenant signup, logins by a username that is
 *   unique across tenants, tenant lookup).
 * - `public`: anyone, inside the tenant of the request (storefront reads and
 *   customer self-service of the shop apps).
 * - roles: a login token of the tenant with one of these roles; for admins,
 *   optionally only some tenant roles. A platform super-admin counts as an
 *   owner of whatever tenant they act in.
 * - `superAdmin`: platform super-admins only.
 *
 * Which app uses what was read from the apps' GraphQL documents
 * (DESIGN.md §3.4); within a tenant, what each role may touch is unchanged.
 */
export type GraphQLAccess =
	| 'platform'
	| 'public'
	| 'superAdmin'
	/**
	 * Global data of the install (currencies): super-admins, and the owners and
	 * admins of the platform (default) tenant, i.e. of a single-tenant install.
	 */
	| 'platformAdmin'
	| { roles: ActorRole[]; adminRoles?: TenantRole[] };

const admin = { roles: ['admin'] as ActorRole[] };
const manager = {
	roles: ['admin'] as ActorRole[],
	adminRoles: ['owner', 'admin'] as TenantRole[],
};
const owner = {
	roles: ['admin'] as ActorRole[],
	adminRoles: ['owner'] as TenantRole[],
};
const store = { roles: ['admin', 'warehouse'] as ActorRole[] };
/** creates or removes logins (members) and customers: not staff */
const storeManager = {
	roles: ['admin', 'warehouse'] as ActorRole[],
	adminRoles: ['owner', 'admin'] as TenantRole[],
};
const carrier = { roles: ['admin', 'carrier'] as ActorRole[] };
const staffApps = { roles: ['admin', 'warehouse', 'carrier'] as ActorRole[] };

export const GRAPHQL_ACCESS: Readonly<Record<string, GraphQLAccess>> = {
	// tenants, signup and billing (tenant.types.graphql)
	signupTenant: 'platform',
	isTenantSlugAvailable: 'platform',
	tenantPlans: 'platform',
	tenantBySlug: 'platform',
	currentTenant: 'public',
	updateTenant: manager,
	tenantUsage: admin,
	tenantMembers: admin,
	setAdminRole: manager,
	removeAdmin: manager,
	createBillingCheckout: owner,
	createBillingPortal: owner,
	tenants: 'superAdmin',
	setTenantStatus: 'superAdmin',

	// admins
	admin: store,
	adminAuthenticated: 'platform',
	adminByEmail: admin,
	adminLogin: 'platform',
	registerAdmin: manager,
	updateAdmin: admin,
	updateAdminPassword: admin,
	adminAppSettings: admin,

	// carriers
	carrierLogin: 'platform',
	getActiveCarriers: store,
	getCarrier: staffApps,
	getCarrierByUsername: store,
	getCarriers: store,
	getCountOfCarriers: store,
	registerCarrier: storeManager,
	removeCarrier: storeManager,
	removeCarriersByIds: storeManager,
	updateCarrier: staffApps,
	updateCarrierEmail: carrier,
	updateCarrierPassword: carrier,
	updateCarrierStatus: staffApps,
	getCarrierCurrentOrder: staffApps,
	getCarrierOrders: staffApps,
	getCarrierOrdersHistory: staffApps,
	getCountOfCarrierOrdersHistory: staffApps,

	// currencies are shared by all tenants
	currencies: 'public',
	createCurrency: 'platformAdmin',

	// demo data (also behind FAKE_DATA_GENERATOR)
	clearAll: manager,
	generate1000Customers: admin,
	generate1000InviteRequests: admin,
	generate1000InvitesConnectedToInviteRequests: admin,
	generateActiveAndAvailableOrdersPerCarrier: admin,
	generatePastOrdersPerCarrier: admin,
	generateRandomOrdersCurrentStore: admin,
	generateOrdersByCustomerId: 'public',
	addOrdersToTake: admin,
	addTakenOrders: admin,

	// devices (shop apps register theirs)
	device: 'public',
	devices: admin,
	createDevice: 'public',
	updateDevice: 'public',
	updateDeviceLanguage: 'public',
	removeDevice: admin,
	removeDeviceByIds: admin,
	deviceCreated: admin,

	// storefront: products and stores near the customer
	geoLocationProducts: 'public',
	geoLocationProductsByPaging: 'public',
	getCountOfGeoLocationProducts: 'public',
	getCloseMerchants: 'public',
	getOrderForWork: carrier,
	getOrdersForWork: carrier,
	getCountOfOrdersForWork: carrier,

	// invites (invite-only shops)
	invite: 'public',
	getInviteByCode: 'public',
	getInviteByLocation: 'public',
	invites: admin,
	getCountOfInvites: admin,
	createInvite: admin,
	updateInvite: admin,
	removeInvite: admin,
	removeInvitesByIds: admin,
	createInviteRequest: 'public',
	inviteRequest: 'public',
	invitesRequests: admin,
	getCountOfInvitesRequests: admin,
	updateInviteRequest: admin,
	removeInviteRequest: admin,
	removeInvitesRequestsByIds: admin,

	// orders
	getOrder: 'public',
	createOrder: 'public',
	payOrderWithStripe: 'public',
	orders: store,
	getCompletedOrdersInfo: store,
	getOrderedUsersInfo: store,
	getUsersOrdersCountInfo: admin,
	getMerchantsOrdersCountInfo: admin,
	getOrdersChartTotalOrders: admin,
	getDashboardCompletedOrders: admin,
	getDashboardCompletedOrdersToday: admin,
	updateOrderCarrierStatus: carrier,
	updateOrderWarehouseStatus: store,

	// products and categories
	product: 'public',
	products: 'public',
	getCountOfProducts: store,
	createProduct: store,
	saveProduct: store,
	removeProductsByIds: admin,
	productsCategories: 'public',
	productsCategory: 'public',
	createProductsCategory: admin,
	updateProductsCategory: admin,
	removeProductsCategoriesByIds: admin,
	promotions: 'public',
	createPromotion: store,
	updatePromotion: store,
	removePromotion: store,
	removePromotionsByIds: store,

	// customers
	user: 'public',
	getOrders: 'public',
	registerUser: 'public',
	updateUser: 'public',
	userLogin: 'public',
	addUserRegistrationInfo: 'public',
	updateUserEmail: 'public',
	updateUserPassword: 'public',
	isUserExists: 'public',
	isUserEmailExists: 'public',
	getSocial: admin,
	users: store,
	getCountOfUsers: admin,
	getCustomerMetrics: admin,
	banUser: manager,
	unbanUser: manager,
	removeUsersByIds: manager,

	// stores
	warehouse: 'public',
	warehouseLogin: 'platform',
	warehouses: store,
	getAllStores: store,
	getAllActiveStores: 'public',
	getMerchantsBuyName: 'public',
	getStoreProducts: 'public',
	getStoreAvailableProducts: 'public',
	getStoreCustomers: store,
	countStoreCustomers: store,
	getCountExistingCustomers: store,
	getCountExistingCustomersToday: store,
	getCountOfMerchants: store,
	hasExistingStores: store,
	nearbyStores: store,
	registerWarehouse: manager,
	removeWarehousesByIds: manager,
	updateStoreGeoLocation: store,
	updateWarehousePassword: store,
	getStoreCarriers: store,
	getNextOrderNumber: store,
	getStoreOrders: store,
	getStoreOrdersTableData: store,
	getCountOfStoreOrders: store,
	getMerchantsOrders: admin,
	getDashboardOrdersChartOrders: admin,
	getOrdersInDelivery: store,
	removeUserOrders: store,

	// store products
	getWarehouseProduct: 'public',
	getProductsWithPagination: 'public',
	getProductsCount: 'public',
	addWarehouseProducts: store,
	removeWarehouseProducts: store,
	updateWarehouseProduct: store,
};

/** Whether `ctx` may run an operation with `access` (see GRAPHQL_ACCESS). */
export function isAllowed(
	access: GraphQLAccess | undefined,
	ctx: TenantCtx | undefined,
): boolean {
	if (access === undefined) {
		return false;
	}

	if (access === 'platform') {
		return true;
	}

	if (ctx?.tenantId == null) {
		return false;
	}

	if (access === 'public') {
		return true;
	}

	const actor = ctx.actor;

	if (actor == null) {
		return false;
	}

	if (access === 'superAdmin') {
		return actor.role === 'admin' && actor.isSuperAdmin === true;
	}

	if (access === 'platformAdmin') {
		return isPlatformAdmin(actor, ctx.tenantId);
	}

	if (!access.roles.includes(actor.role)) {
		return false;
	}

	if (actor.role === 'admin' && access.adminRoles && !actor.isSuperAdmin) {
		return access.adminRoles.includes(actor.tenantRole ?? 'admin');
	}

	return true;
}

/** Access to a field resolver (`@ResolveField`) of an object type. */
export interface FieldAccess {
	access: GraphQLAccess;
	/**
	 * Logins of these roles may resolve the field on their own record only
	 * (a store its own orders, a carrier its own devices); admins on any.
	 */
	ownRecordRoles?: ActorRole[];
}

/**
 * Who may resolve each field resolver, `<Type>.<field>`. The operation that
 * returned the parent was checked by GRAPHQL_ACCESS, but these fields read
 * more records (a public store lookup must not list the store's orders,
 * customers or carriers). The guard checks them too (fieldResolverEnhancers);
 * a field resolver without an entry is refused, and graphql-access.spec.ts
 * keeps the table complete.
 */
export const GRAPHQL_FIELD_ACCESS: Readonly<Record<string, FieldAccess>> = {
	// shops follow their order: its store and carrier (public profiles)
	'Order.warehouse': { access: 'public' },
	'Order.carrier': { access: 'public' },
	// a store's orders, customers, carriers and devices: admins, or the store itself
	'Warehouse.orders': { access: store, ownRecordRoles: ['warehouse'] },
	'Warehouse.users': { access: store, ownRecordRoles: ['warehouse'] },
	'Warehouse.carriers': { access: store, ownRecordRoles: ['warehouse'] },
	'Warehouse.devices': { access: store, ownRecordRoles: ['warehouse'] },
	// devices hold push channels: admins, or the carrier itself
	'Carrier.devices': { access: carrier, ownRecordRoles: ['carrier'] },
	'User.devices': { access: admin },
};

/** Whether `ctx` may resolve the field `key` (`<Type>.<field>`) of `parent`. */
export function isFieldAllowed(
	key: string,
	ctx: TenantCtx | undefined,
	parent: { id?: unknown; _id?: unknown } | null | undefined,
): boolean {
	const rule = GRAPHQL_FIELD_ACCESS[key];

	if (!rule || !isAllowed(rule.access, ctx)) {
		return false;
	}

	const actor = ctx?.actor;

	if (actor && rule.ownRecordRoles?.includes(actor.role)) {
		const id = parent?.id ?? parent?._id;
		return id != null && String(id) === actor.id;
	}

	return true;
}

/** A super-admin, or an owner / admin of the platform (default) tenant. */
function isPlatformAdmin(
	actor: NonNullable<TenantCtx['actor']>,
	tenantId: string,
): boolean {
	if (actor.role !== 'admin') {
		return false;
	}

	if (actor.isSuperAdmin === true) {
		return true;
	}

	// read when needed: the directory loads the env and the database layer
	const { tenantDirectory } =
		require('../../tenant/tenant-directory') as typeof import('../../tenant/tenant-directory');

	return (
		tenantId === tenantDirectory.getDefaultTenantId() &&
		['owner', 'admin'].includes(actor.tenantRole ?? 'admin')
	);
}
