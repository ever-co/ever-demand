// tslint:disable

type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
	Date: any;
	Any: any;
	Void: any;
};

export type AdditionalUserRegistrationInfo = {
	email: Scalars['String'];
	password: Scalars['String'];
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
	phone?: Maybe<Scalars['String']>;
};

export type Admin = {
	_id: Scalars['String'];
	id: Scalars['String'];
	name: Scalars['String'];
	email: Scalars['String'];
	pictureUrl: Scalars['String'];
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
};

export type AdminCreateInput = {
	name: Scalars['String'];
	email: Scalars['String'];
	pictureUrl: Scalars['String'];
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
};

export type AdminLoginInfo = {
	admin: Admin;
	token: Scalars['String'];
};

export type AdminPasswordUpdateInput = {
	current: Scalars['String'];
	new: Scalars['String'];
};

export type AdminRegisterInput = {
	admin: AdminCreateInput;
	password: Scalars['String'];
};

export type AdminUpdateInput = {
	name?: Maybe<Scalars['String']>;
	email?: Maybe<Scalars['String']>;
	pictureUrl?: Maybe<Scalars['String']>;
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
};

export type Carrier = {
	_id: Scalars['String'];
	id: Scalars['String'];
	firstName: Scalars['String'];
	lastName: Scalars['String'];
	username: Scalars['String'];
	phone: Scalars['String'];
	logo: Scalars['String'];
	email?: Maybe<Scalars['String']>;
	numberOfDeliveries: Scalars['Int'];
	skippedOrderIds?: Maybe<Array<Scalars['String']>>;
	status: Scalars['Int'];
	geoLocation: GeoLocation;
	devicesIds: Array<Scalars['String']>;
	apartment?: Maybe<Scalars['String']>;
	isActive?: Maybe<Scalars['Boolean']>;
	isSharedCarrier?: Maybe<Scalars['Boolean']>;
	devices: Array<Device>;
	isDeleted: Scalars['Boolean'];
};

export type CarrierCreateInput = {
	email?: Maybe<Scalars['String']>;
	firstName: Scalars['String'];
	lastName: Scalars['String'];
	geoLocation: GeoLocationCreateInput;
	status?: Maybe<Scalars['Int']>;
	username: Scalars['String'];
	password: Scalars['String'];
	phone: Scalars['String'];
	logo: Scalars['String'];
	numberOfDeliveries?: Maybe<Scalars['Int']>;
	skippedOrderIds?: Maybe<Array<Scalars['String']>>;
	deliveriesCountToday?: Maybe<Scalars['Int']>;
	totalDistanceToday?: Maybe<Scalars['Float']>;
	isSharedCarrier?: Maybe<Scalars['Boolean']>;
	devicesIds?: Maybe<Array<Scalars['String']>>;
	isDeleted?: Maybe<Scalars['Boolean']>;
};

export type CarrierLoginInfo = {
	carrier: Carrier;
	token: Scalars['String'];
};

export type CarrierOrder = {
	_id: Scalars['String'];
	id: Scalars['String'];
	isConfirmed: Scalars['Boolean'];
	isCancelled: Scalars['Boolean'];
	isPaid: Scalars['Boolean'];
	warehouseStatus: Scalars['Int'];
	carrierStatus: Scalars['Int'];
	orderNumber: Scalars['Int'];
	_createdAt?: Maybe<Scalars['Date']>;
	user: CarrierOrderUser;
	warehouse: CarrierOrderWarehouse;
	carrier: CarrierOrderCarrier;
	products: Array<CarrierOrderProducts>;
};

export type CarrierOrderCarrier = {
	id: Scalars['String'];
};

export type CarrierOrderProducts = {
	count: Scalars['Int'];
	isManufacturing: Scalars['Boolean'];
	isCarrierRequired: Scalars['Boolean'];
	isDeliveryRequired: Scalars['Boolean'];
	isTakeaway?: Maybe<Scalars['Boolean']>;
	initialPrice: Scalars['Float'];
	price: Scalars['Float'];
	product: CarrierOrderProductsProduct;
};

export type CarrierOrderProductsProduct = {
	_id: Scalars['String'];
	id: Scalars['String'];
	title: Array<TranslateType>;
	description: Array<TranslateType>;
	details: Array<TranslateType>;
	images: Array<ImageType>;
	categories?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type CarrierOrdersOptions = {
	populateWarehouse: Scalars['Boolean'];
	completion: Scalars['String'];
};

export type CarrierOrderUser = {
	_id: Scalars['String'];
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
	geoLocation: GeoLocation;
};

export type CarrierOrderWarehouse = {
	logo: Scalars['String'];
	name: Scalars['String'];
	geoLocation: GeoLocation;
};

export type CarrierPasswordUpdateInput = {
	current: Scalars['String'];
	new: Scalars['String'];
};

export type CarrierRegisterInput = {
	carrier: CarrierCreateInput;
	password: Scalars['String'];
};

export type CarriersFindInput = {
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
	email?: Maybe<Scalars['String']>;
	phone?: Maybe<Scalars['String']>;
	isDeleted?: Maybe<Scalars['Boolean']>;
	status?: Maybe<Scalars['Int']>;
	isSharedCarrier?: Maybe<Scalars['Boolean']>;
	_id?: Maybe<Scalars['Any']>;
};

export enum CarrierStatus {
	Online = 'Online',
	Offline = 'Offline',
	Blocked = 'Blocked',
}

export type CarrierUpdateInput = {
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
	geoLocation?: Maybe<GeoLocationUpdateInput>;
	status?: Maybe<Scalars['Int']>;
	username?: Maybe<Scalars['String']>;
	phone?: Maybe<Scalars['String']>;
	email?: Maybe<Scalars['String']>;
	logo?: Maybe<Scalars['String']>;
	numberOfDeliveries?: Maybe<Scalars['Int']>;
	skippedOrderIds?: Maybe<Array<Scalars['String']>>;
	deliveriesCountToday?: Maybe<Scalars['Int']>;
	totalDistanceToday?: Maybe<Scalars['Float']>;
	devicesIds?: Maybe<Array<Scalars['String']>>;
	isSharedCarrier?: Maybe<Scalars['Boolean']>;
	isActive?: Maybe<Scalars['Boolean']>;
};

export type Category = {
	id?: Maybe<Scalars['String']>;
	name: Array<TranslateType>;
};

export type CompletedOrderInfo = {
	totalOrders: Scalars['Int'];
	totalRevenue: Scalars['Float'];
};

export type Currency = {
	_id: Scalars['String'];
	currencyCode: Scalars['String'];
};

export type CurrencyCreateInput = {
	currencyCode: Scalars['String'];
};

export type CustomerMetrics = {
	totalOrders?: Maybe<Scalars['Int']>;
	canceledOrders?: Maybe<Scalars['Int']>;
	completedOrdersTotalSum?: Maybe<Scalars['Float']>;
};

export type CustomersByStore = {
	storeId: Scalars['String'];
	customersCount: Scalars['Int'];
};

export type DashboardCompletedOrder = {
	warehouseId: Scalars['String'];
	totalPrice: Scalars['Float'];
};

export type Device = {
	_id: Scalars['String'];
	id: Scalars['String'];
	channelId?: Maybe<Scalars['String']>;
	type: Scalars['String'];
	uuid: Scalars['String'];
	language?: Maybe<Scalars['String']>;
};

export type DeviceCreateInput = {
	channelId: Scalars['String'];
	language?: Maybe<Scalars['String']>;
	type: Scalars['String'];
	uuid: Scalars['String'];
};

export type DeviceFindInput = {
	channelId?: Maybe<Scalars['String']>;
	language?: Maybe<Scalars['String']>;
	type?: Maybe<Scalars['String']>;
	uuid?: Maybe<Scalars['String']>;
};

export type DeviceUpdateInput = {
	channelId?: Maybe<Scalars['String']>;
	language?: Maybe<Scalars['String']>;
	type?: Maybe<Scalars['String']>;
	uuid?: Maybe<Scalars['String']>;
};

export type ExistingCustomersByStores = {
	total: Scalars['Int'];
	perStore: Array<CustomersByStore>;
};

export type GenerateOrdersResponse = {
	error: Scalars['Boolean'];
	message?: Maybe<Scalars['String']>;
};

export type GeoLocation = {
	_id?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['String']>;
	_createdAt?: Maybe<Scalars['Date']>;
	createdAt?: Maybe<Scalars['Date']>;
	_updatedAt?: Maybe<Scalars['Date']>;
	updatedAt?: Maybe<Scalars['Date']>;
	countryId: Scalars['Int'];
	countryName?: Maybe<Scalars['String']>;
	city: Scalars['String'];
	streetAddress: Scalars['String'];
	house: Scalars['String'];
	postcode?: Maybe<Scalars['String']>;
	loc: Loc;
	coordinates: GeoLocationCoordinates;
};

export type GeoLocationCoordinates = {
	lng: Scalars['Float'];
	lat: Scalars['Float'];
};

export type GeoLocationCreateInput = {
	countryId: Scalars['Int'];
	city: Scalars['String'];
	streetAddress: Scalars['String'];
	house: Scalars['String'];
	postcode?: Maybe<Scalars['String']>;
	loc: LocInput;
};

export type GeoLocationCreateObject = {
	loc: Location;
	countryId: Scalars['Int'];
	city: Scalars['String'];
	postcode: Scalars['String'];
	streetAddress: Scalars['String'];
	house: Scalars['String'];
};

export type GeoLocationFindInput = {
	countryId?: Maybe<Scalars['Int']>;
	city?: Maybe<Scalars['String']>;
	streetAddress?: Maybe<Scalars['String']>;
	house?: Maybe<Scalars['String']>;
	postcode?: Maybe<Scalars['String']>;
	loc?: Maybe<LocInput>;
};

export type GeoLocationInput = {
	countryId: Scalars['Int'];
	countryName?: Maybe<Scalars['String']>;
	city: Scalars['String'];
	streetAddress: Scalars['String'];
	house: Scalars['String'];
	postcode?: Maybe<Scalars['String']>;
	loc: Location;
};

export type GeoLocationOrdersOptions = {
	sort?: Maybe<Scalars['String']>;
	limit?: Maybe<Scalars['Int']>;
	skip?: Maybe<Scalars['Int']>;
};

export type GeoLocationUpdateInput = {
	countryId?: Maybe<Scalars['Int']>;
	city?: Maybe<Scalars['String']>;
	streetAddress?: Maybe<Scalars['String']>;
	house?: Maybe<Scalars['String']>;
	postcode?: Maybe<Scalars['String']>;
	loc?: Maybe<LocInput>;
};

export type GeoLocationUpdateObjectInput = {
	loc: Location;
};

export type GetGeoLocationProductsOptions = {
	isDeliveryRequired?: Maybe<Scalars['Boolean']>;
	isTakeaway?: Maybe<Scalars['Boolean']>;
	merchantIds?: Maybe<Array<Maybe<Scalars['String']>>>;
	imageOrientation?: Maybe<Scalars['Int']>;
	locale?: Maybe<Scalars['String']>;
	withoutCount?: Maybe<Scalars['Boolean']>;
};

export type ImageInput = {
	locale: Scalars['String'];
	url: Scalars['String'];
	width: Scalars['Int'];
	height: Scalars['Int'];
	orientation: Scalars['Int'];
};

export type ImageType = {
	locale: Scalars['String'];
	url: Scalars['String'];
	width: Scalars['Int'];
	height: Scalars['Int'];
	orientation: Scalars['Int'];
};

export type Invite = {
	_id: Scalars['String'];
	id: Scalars['String'];
	code: Scalars['String'];
	apartment: Scalars['String'];
	geoLocation: GeoLocation;
};

export type InviteByCodeInput = {
	location: Location;
	inviteCode: Scalars['String'];
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
};

export type InviteByLocationInput = {
	countryId: Scalars['Int'];
	city: Scalars['String'];
	streetAddress: Scalars['String'];
	house: Scalars['String'];
	apartment: Scalars['String'];
	postcode?: Maybe<Scalars['String']>;
};

export type InviteCreateInput = {
	code?: Maybe<Scalars['String']>;
	apartment: Scalars['String'];
	geoLocation: GeoLocationCreateInput;
};

export type InviteInput = {
	code: Scalars['String'];
	apartment: Scalars['String'];
	geoLocation: GeoLocationInput;
	isDeleted: Scalars['Boolean'];
};

export type InviteRequest = {
	_id: Scalars['String'];
	id: Scalars['String'];
	apartment: Scalars['String'];
	geoLocation: GeoLocation;
	isManual?: Maybe<Scalars['Boolean']>;
	isInvited?: Maybe<Scalars['Boolean']>;
	invitedDate?: Maybe<Scalars['Date']>;
};

export type InviteRequestCreateInput = {
	apartment: Scalars['String'];
	geoLocation: GeoLocationCreateInput;
	isManual?: Maybe<Scalars['Boolean']>;
	invitedDate?: Maybe<Scalars['Date']>;
	isInvited?: Maybe<Scalars['Boolean']>;
};

export type InviteRequestUpdateInput = {
	apartment?: Maybe<Scalars['String']>;
	geoLocation?: Maybe<GeoLocationUpdateInput>;
	isManual?: Maybe<Scalars['Boolean']>;
	invitedDate?: Maybe<Scalars['Date']>;
	isInvited?: Maybe<Scalars['Boolean']>;
};

export type InvitesFindInput = {
	code?: Maybe<Scalars['String']>;
	apartment?: Maybe<Scalars['String']>;
};

export type InvitesRequestsFindInput = {
	apartment?: Maybe<Scalars['String']>;
	isManual?: Maybe<Scalars['Boolean']>;
	isInvited?: Maybe<Scalars['Boolean']>;
	invitedDate?: Maybe<Scalars['Date']>;
};

export type InviteUpdateInput = {
	code?: Maybe<Scalars['String']>;
	apartment?: Maybe<Scalars['String']>;
	geoLocation?: Maybe<GeoLocationUpdateInput>;
};

export enum Language {
	He_Il = 'he_IL',
	En_Us = 'en_US',
	Ru_Ru = 'ru_RU',
	Bg_Bg = 'bg_BG',
}

export type Loc = {
	type: Scalars['String'];
	coordinates: Array<Scalars['Float']>;
};

export type Location = {
	type: Scalars['String'];
	coordinates: Array<Scalars['Float']>;
};

export type LocInput = {
	type: Scalars['String'];
	coordinates: Array<Scalars['Float']>;
};

export type MerchantsOrders = {
	_id?: Maybe<Scalars['String']>;
	ordersCount?: Maybe<Scalars['Int']>;
};

export type Mutation = {
	registerAdmin: Admin;
	adminLogin?: Maybe<AdminLoginInfo>;
	updateAdmin: Admin;
	updateAdminPassword?: Maybe<Scalars['Void']>;
	registerCarrier: Carrier;
	updateCarrierEmail: Carrier;
	updateCarrier: Carrier;
	removeCarrier?: Maybe<Scalars['Void']>;
	carrierLogin?: Maybe<CarrierLoginInfo>;
	updateCarrierPassword?: Maybe<Scalars['Void']>;
	removeCarriersByIds?: Maybe<Scalars['String']>;
	updateCarrierStatus?: Maybe<Carrier>;
	createCurrency?: Maybe<MutationResponse>;
	createDevice: Device;
	updateDevice: Device;
	removeDevice?: Maybe<Scalars['Void']>;
	removeDeviceByIds?: Maybe<Remove>;
	updateDeviceLanguage: Device;
	createInvite: Invite;
	updateInvite: Invite;
	removeInvite?: Maybe<Scalars['Void']>;
	removeInvitesByIds?: Maybe<Remove>;
	createInviteRequest: InviteRequest;
	updateInviteRequest: InviteRequest;
	removeInviteRequest?: Maybe<Scalars['Void']>;
	removeInvitesRequestsByIds?: Maybe<Remove>;
	updateOrderCarrierStatus: Order;
	updateOrderWarehouseStatus?: Maybe<Order>;
	payOrderWithStripe?: Maybe<Order>;
	createProduct: Product;
	saveProduct: Product;
	removeProductsByIds?: Maybe<Remove>;
	updateUser: User;
	registerUser: User;
	userLogin?: Maybe<UserLoginInfo>;
	removeUsersByIds: Scalars['String'];
	updateUserPassword?: Maybe<Scalars['Void']>;
	addUserRegistrationInfo?: Maybe<Scalars['Void']>;
	banUser?: Maybe<User>;
	unbanUser?: Maybe<User>;
	registerWarehouse: Warehouse;
	warehouseLogin?: Maybe<WarehouseLoginInfo>;
	removeWarehousesByIds?: Maybe<Scalars['Void']>;
	updateWarehousePassword?: Maybe<Scalars['Void']>;
	updateStoreGeoLocation: Warehouse;
	createOrder: Order;
	removeWarehouseProducts?: Maybe<Scalars['Boolean']>;
	addWarehouseProducts?: Maybe<Array<WarehouseProduct>>;
	updateWarehouseProduct: WarehouseProduct;
	createProductsCategory: ProductsCategory;
	updateProductsCategory: ProductsCategory;
	removeProductsCategoriesByIds?: Maybe<Remove>;
};

export type MutationRegisterAdminArgs = {
	registerInput: AdminRegisterInput;
};

export type MutationAdminLoginArgs = {
	email: Scalars['String'];
	password: Scalars['String'];
};

export type MutationUpdateAdminArgs = {
	id: Scalars['String'];
	updateInput: AdminUpdateInput;
};

export type MutationUpdateAdminPasswordArgs = {
	id: Scalars['String'];
	password: AdminPasswordUpdateInput;
};

export type MutationRegisterCarrierArgs = {
	registerInput: CarrierRegisterInput;
};

export type MutationUpdateEmailArgs = {
	id: Scalars['String'];
	email: Scalars['String'];
};

export type MutationUpdateCarrierArgs = {
	id: Scalars['String'];
	updateInput: CarrierUpdateInput;
};

export type MutationRemoveCarrierArgs = {
	id: Scalars['String'];
};

export type MutationCarrierLoginArgs = {
	username: Scalars['String'];
	password: Scalars['String'];
};

export type MutationUpdateCarrierPasswordArgs = {
	id: Scalars['String'];
	password: CarrierPasswordUpdateInput;
};

export type MutationRemoveCarriersByIdsArgs = {
	ids: Array<Scalars['String']>;
};

export type MutationUpdateCarrierStatusArgs = {
	id: Scalars['String'];
	status?: Maybe<CarrierStatus>;
};

export type MutationCreateCurrencyArgs = {
	createInput: CurrencyCreateInput;
};

export type MutationCreateDeviceArgs = {
	createInput: DeviceCreateInput;
};

export type MutationUpdateDeviceArgs = {
	id: Scalars['String'];
	updateInput: DeviceUpdateInput;
};

export type MutationRemoveDeviceArgs = {
	id: Scalars['String'];
};

export type MutationRemoveDeviceByIdsArgs = {
	ids: Array<Scalars['String']>;
};

export type MutationUpdateDeviceLanguageArgs = {
	deviceId: Scalars['String'];
	language: Language;
};

export type MutationCreateInviteArgs = {
	createInput: InviteCreateInput;
};

export type MutationUpdateInviteArgs = {
	id: Scalars['String'];
	updateInput: InviteUpdateInput;
};

export type MutationRemoveInviteArgs = {
	id: Scalars['String'];
};

export type MutationRemoveInvitesByIdsArgs = {
	ids: Array<Scalars['String']>;
};

export type MutationCreateInviteRequestArgs = {
	createInput: InviteRequestCreateInput;
};

export type MutationUpdateInviteRequestArgs = {
	id: Scalars['String'];
	updateInput: InviteRequestUpdateInput;
};

export type MutationRemoveInviteRequestArgs = {
	id: Scalars['String'];
};

export type MutationRemoveInvitesRequestsByIdsArgs = {
	ids: Array<Scalars['String']>;
};

export type MutationUpdateOrderCarrierStatusArgs = {
	orderId: Scalars['String'];
	status: OrderCarrierStatus;
};

export type MutationUpdateOrderWarehouseStatusArgs = {
	orderId: Scalars['String'];
	status: OrderWarehouseStatus;
};

export type MutationPayOrderWithStripeArgs = {
	orderId: Scalars['String'];
	cardId: Scalars['String'];
};

export type MutationCreateProductArgs = {
	product: ProductCreateInput;
};

export type MutationSaveProductArgs = {
	product: ProductSaveInput;
};

export type MutationRemoveProductsByIdsArgs = {
	ids: Array<Scalars['String']>;
};

export type MutationUpdateUserArgs = {
	id: Scalars['String'];
	updateObject: UserUpdateObjectInput;
};

export type MutationRegisterUserArgs = {
	registerInput: UserRegisterInput;
};

export type MutationUserLoginArgs = {
	email: Scalars['String'];
	password: Scalars['String'];
};

export type MutationRemoveUsersByIdsArgs = {
	ids: Array<Maybe<Scalars['String']>>;
};

export type MutationUpdateUserPasswordArgs = {
	id: Scalars['String'];
	password: UserPasswordUpdateInput;
};

export type MutationAddUserRegistrationInfoArgs = {
	id: Scalars['String'];
	registrationInfo: AdditionalUserRegistrationInfo;
};

export type MutationBanUserArgs = {
	id: Scalars['String'];
};

export type MutationUnbanUserArgs = {
	id: Scalars['String'];
};

export type MutationRegisterWarehouseArgs = {
	registerInput: WarehouseRegisterInput;
};

export type MutationWarehouseLoginArgs = {
	username: Scalars['String'];
	password: Scalars['String'];
};

export type MutationRemoveWarehousesByIdsArgs = {
	ids: Array<Scalars['String']>;
};

export type MutationUpdateWarehousePasswordArgs = {
	id: Scalars['String'];
	password: WarehousePasswordUpdateInput;
};

export type MutationUpdateStoreGeoLocationArgs = {
	storeId: Scalars['String'];
	geoLocation: GeoLocationCreateObject;
};

export type MutationCreateOrderArgs = {
	createInput: OrderCreateInput;
};

export type MutationRemoveWarehouseProductsArgs = {
	warehouseId: Scalars['String'];
	productsIds: Array<Scalars['String']>;
};

export type MutationAddWarehouseProductsArgs = {
	warehouseId: Scalars['String'];
	products: Array<WarehouseProductInput>;
};

export type MutationUpdateWarehouseProductArgs = {
	warehouseId: Scalars['String'];
	productId: Scalars['String'];
	updateInput: WarehouseProductUpdateInput;
};

export type MutationCreateProductsCategoryArgs = {
	createInput?: Maybe<ProductsCategoriesCreateInput>;
};

export type MutationUpdateProductsCategoryArgs = {
	id: Scalars['String'];
	updateInput: ProductsCategoriesCreateInput;
};

export type MutationRemoveProductsCategoriesByIdsArgs = {
	ids: Array<Scalars['String']>;
};

export type MutationResponse = {
	success: Scalars['Boolean'];
	message?: Maybe<Scalars['String']>;
	data?: Maybe<Currency>;
};

export type Order = {
	_id: Scalars['String'];
	id: Scalars['String'];
	user: User;
	warehouse: Warehouse;
	warehouseId: Scalars['String'];
	carrier?: Maybe<Carrier>;
	carrierId?: Maybe<Scalars['String']>;
	products: Array<OrderProduct>;
	isConfirmed: Scalars['Boolean'];
	isCancelled: Scalars['Boolean'];
	isPaid: Scalars['Boolean'];
	isCompleted: Scalars['Boolean'];
	totalPrice: Scalars['Float'];
	orderType?: Maybe<Scalars['Int']>;
	deliveryTime?: Maybe<Scalars['Date']>;
	finishedProcessingTime?: Maybe<Scalars['Date']>;
	startDeliveryTime?: Maybe<Scalars['Date']>;
	deliveryTimeEstimate?: Maybe<Scalars['Int']>;
	warehouseStatus: Scalars['Int'];
	carrierStatus: Scalars['Int'];
	orderNumber: Scalars['Int'];
	carrierStatusText: Scalars['String'];
	warehouseStatusText: Scalars['String'];
	status?: Maybe<Scalars['Int']>;
	createdAt?: Maybe<Scalars['Date']>;
	_createdAt?: Maybe<Scalars['Date']>;
	updatedAt?: Maybe<Scalars['Date']>;
	_updatedAt?: Maybe<Scalars['Date']>;
};

export enum OrderCarrierStatus {
	NoCarrier = 'NoCarrier',
	CarrierSelectedOrder = 'CarrierSelectedOrder',
	CarrierPickedUpOrder = 'CarrierPickedUpOrder',
	CarrierStartDelivery = 'CarrierStartDelivery',
	CarrierArrivedToCustomer = 'CarrierArrivedToCustomer',
	DeliveryCompleted = 'DeliveryCompleted',
	IssuesDuringDelivery = 'IssuesDuringDelivery',
	ClientRefuseTakingOrder = 'ClientRefuseTakingOrder',
}

export type OrderChartPanel = {
	isCancelled: Scalars['Boolean'];
	isCompleted: Scalars['Boolean'];
	totalPrice: Scalars['Float'];
	_createdAt: Scalars['Date'];
};

export type OrderCountTnfo = {
	id?: Maybe<Scalars['String']>;
	ordersCount?: Maybe<Scalars['Int']>;
};

export type OrderCreateInput = {
	userId: Scalars['String'];
	warehouseId: Scalars['String'];
	products: Array<OrderProductCreateInput>;
	options?: Maybe<WarehouseOrdersRouterCreateOptions>;
};

export type OrderedUserInfo = {
	user: User;
	ordersCount: Scalars['Int'];
	totalPrice: Scalars['Float'];
};

export type OrderProduct = {
	_id: Scalars['String'];
	count: Scalars['Int'];
	isManufacturing: Scalars['Boolean'];
	isCarrierRequired: Scalars['Boolean'];
	isDeliveryRequired: Scalars['Boolean'];
	isTakeaway?: Maybe<Scalars['Boolean']>;
	initialPrice: Scalars['Float'];
	price: Scalars['Float'];
	product: Product;
};

export type OrderProductCreateInput = {
	count: Scalars['Int'];
	productId: Scalars['String'];
};

export type OrdersFindInput = {
	user?: Maybe<Scalars['String']>;
	warehouse?: Maybe<Scalars['String']>;
	carrier?: Maybe<Scalars['String']>;
	isConfirmed?: Maybe<Scalars['Boolean']>;
	isCancelled?: Maybe<Scalars['Boolean']>;
	isPaid?: Maybe<Scalars['Boolean']>;
	warehouseStatus: Scalars['Int'];
	carrierStatus: Scalars['Int'];
	orderNumber?: Maybe<Scalars['Int']>;
};

export enum OrderWarehouseStatus {
	NoStatus = 'NoStatus',
	ReadyForProcessing = 'ReadyForProcessing',
	WarehouseStartedProcessing = 'WarehouseStartedProcessing',
	AllocationStarted = 'AllocationStarted',
	AllocationFinished = 'AllocationFinished',
	PackagingStarted = 'PackagingStarted',
	PackagingFinished = 'PackagingFinished',
	GivenToCarrier = 'GivenToCarrier',
	AllocationFailed = 'AllocationFailed',
	PackagingFailed = 'PackagingFailed',
}

export type PagingOptionsInput = {
	sort?: Maybe<PagingSortInput>;
	limit?: Maybe<Scalars['Int']>;
	skip?: Maybe<Scalars['Int']>;
};

export type PagingSortInput = {
	field: Scalars['String'];
	sortBy: Scalars['String'];
};

export type Product = {
	_id: Scalars['String'];
	id: Scalars['String'];
	title: Array<TranslateType>;
	description: Array<TranslateType>;
	details: Array<TranslateType>;
	images: Array<ImageType>;
	categories?: Maybe<Array<Maybe<Scalars['String']>>>;
	detailsHTML: Array<TranslateType>;
	descriptionHTML: Array<TranslateType>;
	_createdAt?: Maybe<Scalars['Date']>;
	_updatedAt?: Maybe<Scalars['Date']>;
};

export type ProductCreateInput = {
	title: Array<TranslateInput>;
	description: Array<TranslateInput>;
	details?: Maybe<Array<TranslateInput>>;
	images: Array<ImageInput>;
	categories?: Maybe<Array<ProductsCategoryInput>>;
	detailsHTML?: Maybe<Array<TranslateInput>>;
	descriptionHTML?: Maybe<Array<TranslateInput>>;
};

export type ProductInfo = {
	warehouseProduct: WarehouseProduct;
	distance: Scalars['Float'];
	warehouseId: Scalars['String'];
	warehouseLogo: Scalars['String'];
};

export type ProductSaveInput = {
	_id: Scalars['String'];
	id?: Maybe<Scalars['String']>;
	title: Array<TranslateInput>;
	description: Array<TranslateInput>;
	details?: Maybe<Array<TranslateInput>>;
	images: Array<ImageInput>;
	categories?: Maybe<Array<ProductsCategoryInput>>;
	detailsHTML?: Maybe<Array<TranslateInput>>;
	descriptionHTML?: Maybe<Array<TranslateInput>>;
};

export type ProductsCategoriesCreateInput = {
	name: Array<TranslateInput>;
	image?: Maybe<Scalars['String']>;
};

export type ProductsCategoriesFindInput = {
	noop?: Maybe<Scalars['Void']>;
};

export type ProductsCategoriesUpdatenput = {
	name?: Maybe<Array<TranslateInput>>;
};

export type ProductsCategory = {
	_id: Scalars['String'];
	id: Scalars['String'];
	name: Array<TranslateType>;
	image?: Maybe<Scalars['String']>;
	_createdAt?: Maybe<Scalars['Date']>;
	_updatedAt?: Maybe<Scalars['Date']>;
};

export type ProductsCategoryInput = {
	_id: Scalars['String'];
	name?: Maybe<Array<TranslateInput>>;
};

export type ProductsFindInput = {
	title?: Maybe<TranslateInput>;
	description?: Maybe<TranslateInput>;
	details?: Maybe<TranslateInput>;
	image?: Maybe<ImageInput>;
};

export type QuantityUpdateInput = {
	change?: Maybe<Scalars['Int']>;
	to?: Maybe<Scalars['Int']>;
};

export type Query = {
	adminByEmail?: Maybe<Admin>;
	admin?: Maybe<Admin>;
	adminAuthenticated: Scalars['Boolean'];
	getCarrierByUsername?: Maybe<Carrier>;
	getCarrier?: Maybe<Carrier>;
	getCarriers: Array<Carrier>;
	getActiveCarriers: Array<Maybe<Carrier>>;
	getCountOfCarriers: Scalars['Int'];
	getCarrierOrders: Array<CarrierOrder>;
	getCarrierCurrentOrder?: Maybe<Order>;
	getCarrierOrdersHistory: Array<Maybe<Order>>;
	getCountOfCarrierOrdersHistory: Scalars['Int'];
	currencies?: Maybe<Array<Maybe<Currency>>>;
	clearAll: Scalars['Boolean'];
	device?: Maybe<Device>;
	devices: Array<Device>;
	geoLocationProducts?: Maybe<Array<Maybe<ProductInfo>>>;
	geoLocationProductsByPaging: Array<Maybe<ProductInfo>>;
	getCountOfGeoLocationProducts: Scalars['Int'];
	invite?: Maybe<Invite>;
	invites: Array<Invite>;
	getInviteByCode?: Maybe<Invite>;
	getInviteByLocation?: Maybe<Invite>;
	generate1000InvitesConnectedToInviteRequests?: Maybe<Scalars['Void']>;
	getCountOfInvites: Scalars['Int'];
	inviteRequest?: Maybe<InviteRequest>;
	invitesRequests?: Maybe<Array<InviteRequest>>;
	notifyAboutLaunch?: Maybe<Scalars['Void']>;
	generate1000InviteRequests?: Maybe<Scalars['Void']>;
	getCountOfInvitesRequests: Scalars['Int'];
	getOrder?: Maybe<Order>;
	orders: Array<Order>;
	getDashboardCompletedOrders: Array<DashboardCompletedOrder>;
	getDashboardCompletedOrdersToday: Array<Order>;
	getOrdersChartTotalOrders: Array<OrderChartPanel>;
	getCompletedOrdersInfo: CompletedOrderInfo;
	getOrderedUsersInfo: Array<OrderedUserInfo>;
	generateOrdersByCustomerId?: Maybe<Scalars['Void']>;
	addTakenOrders?: Maybe<Scalars['Void']>;
	addOrdersToTake?: Maybe<Scalars['Void']>;
	generateActiveAndAvailableOrdersPerCarrier?: Maybe<Scalars['Void']>;
	generatePastOrdersPerCarrier?: Maybe<Scalars['Void']>;
	getUsersOrdersCountInfo?: Maybe<Array<Maybe<OrderCountTnfo>>>;
	getMerchantsOrdersCountInfo?: Maybe<Array<Maybe<OrderCountTnfo>>>;
	generateRandomOrdersCurrentStore: GenerateOrdersResponse;
	product?: Maybe<Product>;
	products?: Maybe<Array<Product>>;
	getCountOfProducts: Scalars['Int'];
	user?: Maybe<User>;
	users: Array<Maybe<User>>;
	getOrders: Array<Order>;
	isUserExists: Scalars['Boolean'];
	getSocial?: Maybe<User>;
	isUserEmailExists: Scalars['Boolean'];
	generate1000Customers?: Maybe<ResponseGenerate1000Customers>;
	getCountOfUsers: Scalars['Int'];
	getCustomerMetrics?: Maybe<CustomerMetrics>;
	warehouse?: Maybe<Warehouse>;
	warehouses: Array<Maybe<Warehouse>>;
	nearbyStores: Array<Warehouse>;
	countStoreCustomers: Scalars['Int'];
	getAllActiveStores: Array<Warehouse>;
	getStoreCustomers: Array<User>;
	getStoreProducts: Array<WarehouseProduct>;
	getStoreAvailableProducts: Array<WarehouseProduct>;
	getCountExistingCustomers: ExistingCustomersByStores;
	getCountExistingCustomersToday: ExistingCustomersByStores;
	hasExistingStores: Scalars['Boolean'];
	getCountOfMerchants: Scalars['Int'];
	getAllStores: Array<Warehouse>;
	getMerchantsBuyName: Array<Maybe<Warehouse>>;
	getStoreCarriers?: Maybe<Array<Carrier>>;
	getStoreOrders: Array<Order>;
	getNextOrderNumber: Scalars['Int'];
	getDashboardOrdersChartOrders: Array<Order>;
	getMerchantsOrders?: Maybe<Array<Maybe<MerchantsOrders>>>;
	getStoreOrdersTableData: StoreOrdersTableData;
	getCountOfStoreOrders: Scalars['Int'];
	getOrdersInDelivery: Array<Maybe<Order>>;
	removeUserOrders?: Maybe<RemovedUserOrdersObj>;
	getProductsWithPagination?: Maybe<Array<WarehouseProduct>>;
	getProductsCount?: Maybe<Scalars['Int']>;
	getWarehouseProduct?: Maybe<WarehouseProduct>;
	getCoseMerchants: Array<Maybe<Warehouse>>;
	getOrderForWork?: Maybe<Order>;
	getOrdersForWork: Array<Maybe<Order>>;
	getCountOfOrdersForWork: Scalars['Int'];
	productsCategory?: Maybe<ProductsCategory>;
	productsCategories: Array<ProductsCategory>;
	temp__?: Maybe<Scalars['Boolean']>;
};

export type QueryAdminByEmailArgs = {
	email: Scalars['String'];
};

export type QueryAdminArgs = {
	id: Scalars['String'];
};

export type QueryGetCarrierByUsernameArgs = {
	username: Scalars['String'];
};

export type QueryGetCarrierArgs = {
	id: Scalars['String'];
};

export type QueryGetCarriersArgs = {
	carriersFindInput?: Maybe<CarriersFindInput>;
	pagingOptions?: Maybe<PagingOptionsInput>;
};

export type QueryGetCountOfCarriersArgs = {
	carriersFindInput?: Maybe<CarriersFindInput>;
};

export type QueryGetCarrierOrdersArgs = {
	carrierId: Scalars['String'];
	options?: Maybe<CarrierOrdersOptions>;
};

export type QueryGetCarrierCurrentOrderArgs = {
	carrierId: Scalars['String'];
};

export type QueryGetCarrierOrdersHistoryArgs = {
	carrierId: Scalars['String'];
	options?: Maybe<GeoLocationOrdersOptions>;
};

export type QueryGetCountOfCarrierOrdersHistoryArgs = {
	carrierId: Scalars['String'];
};

export type QueryDeviceArgs = {
	id?: Maybe<Scalars['String']>;
};

export type QueryDevicesArgs = {
	findInput?: Maybe<DeviceFindInput>;
};

export type QueryGeoLocationProductsArgs = {
	geoLocation: GeoLocationFindInput;
};

export type QueryGeoLocationProductsByPagingArgs = {
	geoLocation: GeoLocationFindInput;
	pagingOptions?: Maybe<PagingOptionsInput>;
	options?: Maybe<GetGeoLocationProductsOptions>;
	searchText?: Maybe<Scalars['String']>;
};

export type QueryGetCountOfGeoLocationProductsArgs = {
	geoLocation: GeoLocationFindInput;
	options?: Maybe<GetGeoLocationProductsOptions>;
	searchText?: Maybe<Scalars['String']>;
};

export type QueryInviteArgs = {
	id: Scalars['String'];
};

export type QueryInvitesArgs = {
	findInput?: Maybe<InvitesFindInput>;
	pagingOptions?: Maybe<PagingOptionsInput>;
};

export type QueryGetInviteByCodeArgs = {
	info: InviteByCodeInput;
};

export type QueryGetInviteByLocationArgs = {
	info?: Maybe<InviteByLocationInput>;
};

export type QueryGenerate1000InvitesConnectedToInviteRequestsArgs = {
	defaultLng: Scalars['Float'];
	defaultLat: Scalars['Float'];
};

export type QueryInviteRequestArgs = {
	id: Scalars['String'];
};

export type QueryInvitesRequestsArgs = {
	findInput?: Maybe<InvitesRequestsFindInput>;
	pagingOptions?: Maybe<PagingOptionsInput>;
	invited?: Maybe<Scalars['Boolean']>;
};

export type QueryNotifyAboutLaunchArgs = {
	invite?: Maybe<InviteInput>;
	devicesIds: Array<Scalars['String']>;
};

export type QueryGenerate1000InviteRequestsArgs = {
	defaultLng: Scalars['Float'];
	defaultLat: Scalars['Float'];
};

export type QueryGetCountOfInvitesRequestsArgs = {
	invited?: Maybe<Scalars['Boolean']>;
};

export type QueryGetOrderArgs = {
	id: Scalars['String'];
};

export type QueryOrdersArgs = {
	findInput?: Maybe<OrdersFindInput>;
};

export type QueryGetCompletedOrdersInfoArgs = {
	storeId?: Maybe<Scalars['String']>;
};

export type QueryGetOrderedUsersInfoArgs = {
	storeId: Scalars['String'];
};

export type QueryGenerateOrdersByCustomerIdArgs = {
	numberOfOrders: Scalars['Int'];
	customerId: Scalars['String'];
};

export type QueryAddTakenOrdersArgs = {
	carrierIds: Array<Scalars['String']>;
};

export type QueryGetUsersOrdersCountInfoArgs = {
	usersIds?: Maybe<Array<Scalars['String']>>;
};

export type QueryGetMerchantsOrdersCountInfoArgs = {
	merchantsIds?: Maybe<Array<Scalars['String']>>;
};

export type QueryGenerateRandomOrdersCurrentStoreArgs = {
	storeId: Scalars['String'];
	storeCreatedAt: Scalars['Date'];
	ordersLimit: Scalars['Int'];
};

export type QueryProductArgs = {
	id: Scalars['String'];
};

export type QueryProductsArgs = {
	findInput?: Maybe<ProductsFindInput>;
	pagingOptions?: Maybe<PagingOptionsInput>;
	existedProductsIds?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type QueryGetCountOfProductsArgs = {
	existedProductsIds?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type QueryUserArgs = {
	id: Scalars['String'];
};

export type QueryUsersArgs = {
	findInput?: Maybe<UserFindInput>;
	pagingOptions?: Maybe<PagingOptionsInput>;
};

export type QueryGetOrdersArgs = {
	userId: Scalars['String'];
};

export type QueryIsUserExistsArgs = {
	conditions: UserMemberInput;
};

export type QueryGetSocialArgs = {
	socialId: Scalars['String'];
};

export type QueryIsUserEmailExistsArgs = {
	email: Scalars['String'];
};

export type QueryGenerate1000CustomersArgs = {
	defaultLng: Scalars['Float'];
	defaultLat: Scalars['Float'];
};

export type QueryGetCustomerMetricsArgs = {
	id: Scalars['String'];
};

export type QueryWarehouseArgs = {
	id: Scalars['String'];
};

export type QueryWarehousesArgs = {
	findInput?: Maybe<WarehousesFindInput>;
	pagingOptions?: Maybe<PagingOptionsInput>;
};

export type QueryNearbyStoresArgs = {
	geoLocation: GeoLocationFindInput;
};

export type QueryCountStoreCustomersArgs = {
	storeId: Scalars['String'];
};

export type QueryGetAllActiveStoresArgs = {
	fullProducts: Scalars['Boolean'];
};

export type QueryGetStoreCustomersArgs = {
	storeId: Scalars['String'];
};

export type QueryGetStoreProductsArgs = {
	storeId: Scalars['String'];
	fullProducts: Scalars['Boolean'];
};

export type QueryGetStoreAvailableProductsArgs = {
	storeId: Scalars['String'];
};

export type QueryGetMerchantsBuyNameArgs = {
	searchName: Scalars['String'];
	geoLocation?: Maybe<GeoLocationFindInput>;
};

export type QueryGetStoreCarriersArgs = {
	storeId: Scalars['String'];
};

export type QueryGetStoreOrdersArgs = {
	storeId: Scalars['String'];
};

export type QueryGetNextOrderNumberArgs = {
	storeId: Scalars['String'];
};

export type QueryGetDashboardOrdersChartOrdersArgs = {
	storeId: Scalars['String'];
};

export type QueryGetStoreOrdersTableDataArgs = {
	storeId: Scalars['String'];
	pagingOptions?: Maybe<PagingOptionsInput>;
	status?: Maybe<Scalars['String']>;
};

export type QueryGetCountOfStoreOrdersArgs = {
	storeId: Scalars['String'];
	status: Scalars['String'];
};

export type QueryGetOrdersInDeliveryArgs = {
	storeId: Scalars['String'];
};

export type QueryRemoveUserOrdersArgs = {
	storeId: Scalars['String'];
	userId: Scalars['String'];
};

export type QueryGetProductsWithPaginationArgs = {
	id: Scalars['String'];
	pagingOptions?: Maybe<PagingOptionsInput>;
};

export type QueryGetProductsCountArgs = {
	id: Scalars['String'];
};

export type QueryGetWarehouseProductArgs = {
	warehouseId: Scalars['String'];
	warehouseProductId: Scalars['String'];
};

export type QueryGetCoseMerchantsArgs = {
	geoLocation: GeoLocationFindInput;
};

export type QueryGetOrderForWorkArgs = {
	geoLocation: GeoLocationFindInput;
	skippedOrderIds: Array<Scalars['String']>;
	options?: Maybe<GeoLocationOrdersOptions>;
	searchObj?: Maybe<SearchOrdersForWork>;
};

export type QueryGetOrdersForWorkArgs = {
	geoLocation: GeoLocationFindInput;
	skippedOrderIds: Array<Scalars['String']>;
	options?: Maybe<GeoLocationOrdersOptions>;
	searchObj?: Maybe<SearchOrdersForWork>;
};

export type QueryGetCountOfOrdersForWorkArgs = {
	geoLocation: GeoLocationFindInput;
	skippedOrderIds: Array<Scalars['String']>;
	searchObj?: Maybe<SearchOrdersForWork>;
};

export type QueryProductsCategoryArgs = {
	id: Scalars['String'];
};

export type QueryProductsCategoriesArgs = {
	findInput?: Maybe<ProductsCategoriesFindInput>;
};

export type Remove = {
	n?: Maybe<Scalars['Int']>;
	ok?: Maybe<Scalars['Int']>;
};

export type RemovedUserOrdersObj = {
	number?: Maybe<Scalars['Int']>;
	modified?: Maybe<Scalars['Int']>;
};

export type ResponseGenerate1000Customers = {
	success: Scalars['Boolean'];
	message?: Maybe<Scalars['String']>;
};

export type SearchByRegex = {
	key: Scalars['String'];
	value: Scalars['String'];
};

export type SearchOrdersForWork = {
	byRegex?: Maybe<Array<Maybe<SearchByRegex>>>;
};

export type StoreOrdersTableData = {
	orders: Array<Maybe<Order>>;
	page: Scalars['Int'];
};

export type Subscription = {
	deviceCreated: Device;
};

export type TranslateInput = {
	locale: Scalars['String'];
	value: Scalars['String'];
};

export type TranslateType = {
	locale: Scalars['String'];
	value: Scalars['String'];
};

export type User = {
	_id: Scalars['String'];
	id: Scalars['String'];
	geoLocation: GeoLocation;
	apartment: Scalars['String'];
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
	email?: Maybe<Scalars['String']>;
	phone?: Maybe<Scalars['String']>;
	devicesIds: Array<Scalars['String']>;
	devices: Array<Device>;
	image?: Maybe<Scalars['String']>;
	fullAddress?: Maybe<Scalars['String']>;
	createdAt?: Maybe<Scalars['Date']>;
	isBanned: Scalars['Boolean'];
};

export type UserCreateInput = {
	email?: Maybe<Scalars['String']>;
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
	phone?: Maybe<Scalars['String']>;
	image?: Maybe<Scalars['String']>;
	geoLocation: GeoLocationCreateInput;
	apartment: Scalars['String'];
};

export type UserFindInput = {
	firstName?: Maybe<Scalars['String']>;
	lastName?: Maybe<Scalars['String']>;
	email?: Maybe<Scalars['String']>;
	phone?: Maybe<Scalars['String']>;
	apartment?: Maybe<Scalars['String']>;
	image?: Maybe<Scalars['String']>;
};

export type UserLoginInfo = {
	user: User;
	token: Scalars['String'];
};

export type UserMemberInput = {
	exceptCustomerId?: Maybe<Scalars['String']>;
	memberKey: Scalars['String'];
	memberValue: Scalars['String'];
};

export type UserPasswordUpdateInput = {
	current: Scalars['String'];
	new: Scalars['String'];
};

export type UserRegisterInput = {
	user: UserCreateInput;
	password?: Maybe<Scalars['String']>;
};

export type UserUpdateObjectInput = {
	geoLocation: GeoLocationUpdateObjectInput;
	devicesIds?: Maybe<Array<Scalars['String']>>;
	apartment?: Maybe<Scalars['String']>;
	stripeCustomerId?: Maybe<Scalars['String']>;
};

export type Warehouse = {
	_id: Scalars['String'];
	id: Scalars['String'];
	_createdAt: Scalars['Date'];
	isActive: Scalars['Boolean'];
	isPaymentEnabled?: Maybe<Scalars['Boolean']>;
	geoLocation: GeoLocation;
	name: Scalars['String'];
	logo: Scalars['String'];
	username: Scalars['String'];
	contactEmail?: Maybe<Scalars['String']>;
	contactPhone?: Maybe<Scalars['String']>;
	forwardOrdersUsing?: Maybe<Array<Scalars['Int']>>;
	ordersEmail?: Maybe<Scalars['String']>;
	ordersPhone?: Maybe<Scalars['String']>;
	isManufacturing?: Maybe<Scalars['Boolean']>;
	isCarrierRequired?: Maybe<Scalars['Boolean']>;
	devicesIds: Array<Scalars['String']>;
	devices: Array<Device>;
	orders: Array<Order>;
	users: Array<User>;
	hasRestrictedCarriers?: Maybe<Scalars['Boolean']>;
	carriersIds?: Maybe<Array<Scalars['String']>>;
	usedCarriersIds?: Maybe<Array<Scalars['String']>>;
	carriers?: Maybe<Array<Carrier>>;
	orderBarcodeType?: Maybe<Scalars['Int']>;
};

export type WarehouseCreateInput = {
	geoLocation: GeoLocationCreateInput;
	name: Scalars['String'];
	logo: Scalars['String'];
	username: Scalars['String'];
	isActive?: Maybe<Scalars['Boolean']>;
	isPaymentEnabled?: Maybe<Scalars['Boolean']>;
	contactEmail?: Maybe<Scalars['String']>;
	contactPhone?: Maybe<Scalars['String']>;
	forwardOrdersUsing?: Maybe<Array<Scalars['Int']>>;
	ordersEmail?: Maybe<Scalars['String']>;
	ordersPhone?: Maybe<Scalars['String']>;
	isManufacturing?: Maybe<Scalars['Boolean']>;
	isCarrierRequired?: Maybe<Scalars['Boolean']>;
	hasRestrictedCarriers?: Maybe<Scalars['Boolean']>;
	carriersIds?: Maybe<Array<Scalars['String']>>;
	usedCarriersIds?: Maybe<Array<Scalars['String']>>;
};

export type WarehouseLoginInfo = {
	warehouse: Warehouse;
	token: Scalars['String'];
};

export type WarehouseOrdersRouterCreateOptions = {
	autoConfirm: Scalars['Boolean'];
};

export type WarehousePasswordUpdateInput = {
	current: Scalars['String'];
	new: Scalars['String'];
};

export type WarehouseProduct = {
	id: Scalars['String'];
	_id: Scalars['String'];
	price: Scalars['Int'];
	initialPrice: Scalars['Int'];
	count?: Maybe<Scalars['Int']>;
	soldCount: Scalars['Int'];
	product: Product;
	isManufacturing?: Maybe<Scalars['Boolean']>;
	isCarrierRequired?: Maybe<Scalars['Boolean']>;
	isDeliveryRequired?: Maybe<Scalars['Boolean']>;
	isTakeaway?: Maybe<Scalars['Boolean']>;
	deliveryTimeMin?: Maybe<Scalars['Int']>;
	deliveryTimeMax?: Maybe<Scalars['Int']>;
};

export type WarehouseProductInput = {
	price: Scalars['Int'];
	initialPrice: Scalars['Int'];
	count?: Maybe<Scalars['Int']>;
	product: Scalars['String'];
	isManufacturing?: Maybe<Scalars['Boolean']>;
	isCarrierRequired?: Maybe<Scalars['Boolean']>;
	isDeliveryRequired?: Maybe<Scalars['Boolean']>;
	isTakeaway?: Maybe<Scalars['Boolean']>;
	deliveryTimeMin?: Maybe<Scalars['Int']>;
	deliveryTimeMax?: Maybe<Scalars['Int']>;
};

export type WarehouseProductUpdateInput = {
	quantity?: Maybe<QuantityUpdateInput>;
	price?: Maybe<Scalars['Int']>;
};

export type WarehouseRegisterInput = {
	warehouse: WarehouseCreateInput;
	password: Scalars['String'];
};

export type WarehousesFindInput = {
	isActive?: Maybe<Scalars['Boolean']>;
	isPaymentEnabled?: Maybe<Scalars['Boolean']>;
	name?: Maybe<Scalars['String']>;
	logo?: Maybe<Scalars['String']>;
	username?: Maybe<Scalars['String']>;
	contactEmail?: Maybe<Scalars['String']>;
	contactPhone?: Maybe<Scalars['String']>;
	forwardOrdersUsing?: Maybe<Array<Maybe<Scalars['Int']>>>;
	ordersEmail?: Maybe<Scalars['String']>;
	ordersPhone?: Maybe<Scalars['String']>;
	isManufacturing?: Maybe<Scalars['Boolean']>;
	isCarrierRequired?: Maybe<Scalars['Boolean']>;
	hasRestrictedCarriers?: Maybe<Scalars['Boolean']>;
	carriersIds?: Maybe<Array<Scalars['String']>>;
	usedCarriersIds?: Maybe<Array<Scalars['String']>>;
};
