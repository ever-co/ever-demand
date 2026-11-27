/**
 * GraphQL fixtures for the carrier and merchant e2e suites: they create a store, a customer,
 * a product, a carrier and an order through the API, as the default admin.
 */
import { gql, adminToken } from '../helpers';

/** The default location of the carrier app (DEFAULT_LATITUDE / DEFAULT_LONGITUDE). */
export const SOFIA = { lat: 42.6459136, lng: 23.3932736 };

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Person names must match /^[a-z ,.'-]+$/i in the API, so digits become letters. */
const lettersOnly = (value: string) => value.replace(/[0-9]/g, (d) => 'abcdefghij'[Number(d)]);

function geoLocation(lat = SOFIA.lat, lng = SOFIA.lng) {
	return {
		countryId: 21, // Bulgaria
		city: 'Sofia',
		streetAddress: 'Vitosha Blvd',
		house: '1',
		postcode: '1000',
		loc: { type: 'Point', coordinates: [lng, lat] },
	};
}

/** Runs a fixture operation, as the default admin unless a token is given. */
async function must<T>(query: string, variables: Record<string, unknown>, token?: string): Promise<T> {
	const res = await gql<T>(query, variables, token ?? (await adminToken()));
	if (res.errors?.length || !res.data) {
		throw new Error(`GraphQL fixture failed: ${JSON.stringify(res.errors)}`);
	}
	return res.data;
}

export interface Store {
	id: string;
	username: string;
	password: string;
	name: string;
}

export async function createStore(overrides: Record<string, unknown> = {}): Promise<Store> {
	const id = uid();
	const username = `e2e-store-${id}`;
	const password = `pw-${id}`;
	const name = `E2E Store ${id}`;
	const data = await must<{ registerWarehouse: { id: string } }>(
		`mutation RegisterWarehouse($registerInput: WarehouseRegisterInput!) {
			registerWarehouse(registerInput: $registerInput) { id }
		}`,
		{
			registerInput: {
				password,
				warehouse: {
					name,
					username,
					logo: 'https://res.cloudinary.com/evereq/image/upload/v1536843011/everbie-products-images/btzn3o8pimhercepno2d.png',
					geoLocation: geoLocation(),
					isActive: true,
					isPaymentEnabled: false,
					isManufacturing: false,
					isCarrierRequired: true,
					hasRestrictedCarriers: false,
					carriersIds: [],
					usedCarriersIds: [],
					inStoreMode: false,
					carrierCompetition: false,
					contactEmail: `${username}@example.com`,
					contactPhone: '+359888000000',
					...overrides,
				},
			},
		}
	);
	return { id: data.registerWarehouse.id, username, password, name };
}

export async function createCustomer(): Promise<{ id: string; email: string }> {
	const id = uid();
	const email = `e2e-customer-${id}@example.com`;
	const data = await must<{ registerUser: { id: string } }>(
		`mutation RegisterUser($registerInput: UserRegisterInput!) {
			registerUser(registerInput: $registerInput) { id }
		}`,
		{
			registerInput: {
				password: `pw-${id}`,
				user: {
					email,
					firstName: 'Ellie',
					lastName: `Customer ${lettersOnly(id)}`,
					phone: '+359888111111',
					apartment: '3',
					// a few hundred metres from the store
					geoLocation: geoLocation(SOFIA.lat + 0.003, SOFIA.lng + 0.003),
				},
			},
		}
	);
	return { id: data.registerUser.id, email };
}

export async function createProduct(title = `E2E Product ${uid()}`): Promise<{ id: string; title: string }> {
	const data = await must<{ createProduct: { id: string } }>(
		`mutation CreateProduct($product: ProductCreateInput!) {
			createProduct(product: $product) { id }
		}`,
		{
			product: {
				title: [{ locale: 'en-US', value: title }],
				description: [{ locale: 'en-US', value: 'Created by the e2e suite' }],
				details: [{ locale: 'en-US', value: 'e2e' }],
				images: [
					{
						locale: 'en-US',
						url: 'https://res.cloudinary.com/evereq/image/upload/v1536843011/everbie-products-images/btzn3o8pimhercepno2d.png',
						width: 400,
						height: 400,
						orientation: 0,
					},
				],
			},
		}
	);
	return { id: data.createProduct.id, title };
}

export async function addProductToStore(storeId: string, productId: string, price = 12) {
	await must(
		`mutation AddWarehouseProducts($warehouseId: String!, $products: [WarehouseProductInput!]!) {
			addWarehouseProducts(warehouseId: $warehouseId, products: $products) { id }
		}`,
		{
			warehouseId: storeId,
			products: [
				{
					product: productId,
					price,
					initialPrice: price + 3,
					count: 50,
					isManufacturing: false,
					isCarrierRequired: true,
					isDeliveryRequired: true,
					isProductAvailable: true,
					isTakeaway: false,
					deliveryTimeMin: 10,
					deliveryTimeMax: 30,
				},
			],
		}
	);
}

export async function createOrder(storeId: string, customerId: string, productId: string) {
	const data = await must<{ createOrder: { id: string; orderNumber: number } }>(
		`mutation CreateOrder($createInput: OrderCreateInput!) {
			createOrder(createInput: $createInput) { id orderNumber }
		}`,
		{
			createInput: {
				userId: customerId,
				warehouseId: storeId,
				products: [{ count: 1, productId }],
				orderType: 0, // delivery
			},
		}
	);
	return data.createOrder;
}

export async function setWarehouseStatus(orderId: string, status: string) {
	await must(
		`mutation UpdateOrderWarehouseStatus($orderId: String!, $status: OrderWarehouseStatus!) {
			updateOrderWarehouseStatus(orderId: $orderId, status: $status) { id }
		}`,
		{ orderId, status }
	);
}

export async function getOrder(id: string) {
	const data = await must<{ getOrder: { id: string; carrierStatus: number; warehouseStatus: number; carrierId: string | null } }>(
		`query GetOrder($id: String!) {
			getOrder(id: $id) { id carrierStatus warehouseStatus carrierId }
		}`,
		{ id }
	);
	return data.getOrder;
}

export interface Carrier {
	id: string;
	username: string;
	password: string;
	firstName: string;
}

export async function createCarrier(): Promise<Carrier> {
	const id = uid();
	const username = `e2e-carrier-${id}`;
	const password = `pw-${id}`;
	const firstName = 'Emma';
	const data = await must<{ registerCarrier: { id: string } }>(
		`mutation RegisterCarrier($registerInput: CarrierRegisterInput!) {
			registerCarrier(registerInput: $registerInput) { id }
		}`,
		{
			registerInput: {
				password,
				carrier: {
					firstName,
					lastName: `Carrier ${lettersOnly(id)}`,
					username,
					password,
					email: `${username}@example.com`,
					phone: '+359888222222',
					logo: 'https://res.cloudinary.com/evereq/image/upload/v1536843011/everbie-products-images/btzn3o8pimhercepno2d.png',
					geoLocation: geoLocation(),
					status: 1, // offline
					isSharedCarrier: true,
				},
			},
		}
	);
	return { id: data.registerCarrier.id, username, password, firstName };
}

/** A store with one product and a packaged delivery order waiting for a carrier. */
export async function createOrderReadyForCarrier() {
	const store = await createStore();
	const customer = await createCustomer();
	const product = await createProduct();
	await addProductToStore(store.id, product.id);
	const order = await createOrder(store.id, customer.id, product.id);
	await setWarehouseStatus(order.id, 'PackagingFinished');
	return { store, customer, product, order };
}

/** Carrier status from the API: 0 online, 1 offline (CarrierStatus). */
export async function getCarrierStatus(id: string): Promise<number> {
	const data = await must<{ getCarrier: { status: number } }>(
		`query GetCarrier($id: String!) { getCarrier(id: $id) { status } }`,
		{ id }
	);
	return data.getCarrier.status;
}
