/** Test data shaped like the server's answers. */
import { OrderCarrierStatus, OrderWarehouseStatus } from '../domain/enums';
import type { GeoLocation, Invite, Order, Product, ProductInfo, User, Warehouse } from '../domain/types';

export const sofia: GeoLocation = {
	loc: { type: 'Point', coordinates: [23.3332736, 42.6459136] },
	countryId: 21,
	countryName: 'Bulgaria',
	city: 'Sofia',
	postcode: '1700',
	streetAddress: 'Simeonovsko shose',
	house: '104',
};

export const user: User = { id: 'user-1', _id: 'user-1', apartment: '3', geoLocation: sofia };

export const invite: Invite = { id: 'invite-1', apartment: '3', code: '1234', geoLocation: sofia };

export function product(id: string, title = `Pizza ${id}`): Product {
	return {
		id: `product-${id}`,
		title: [
			{ locale: 'en-US', value: title },
			{ locale: 'he-IL', value: `${title} HE` },
		],
		description: [{ locale: 'en-US', value: `Tasty ${title} with cheese and tomatoes from the garden` }],
		details: [{ locale: 'en-US', value: `Details of ${title}` }],
		images: [{ locale: 'en-US', url: `https://img.example/${id}.png`, orientation: 1 }],
	};
}

export function productInfo(id: string, overrides: Partial<ProductInfo['warehouseProduct']> = {}): ProductInfo {
	return {
		distance: 1,
		warehouseId: 'warehouse-1',
		warehouseLogo: 'https://img.example/logo.png',
		warehouseProduct: {
			id: `wp-${id}`,
			price: 10,
			initialPrice: 12,
			count: 5,
			soldCount: 0,
			product: product(id),
			isProductAvailable: true,
			isTakeaway: true,
			isDeliveryRequired: true,
			deliveryTimeMin: 20,
			deliveryTimeMax: 40,
			...overrides,
		},
	};
}

export const warehouse: Warehouse = {
	id: 'warehouse-1',
	_id: 'warehouse-1',
	name: 'Mega Pizza',
	logo: 'https://img.example/logo.png',
	isActive: true,
	isPaymentEnabled: true,
	contactPhone: '0888123456',
	geoLocation: { ...sofia, loc: { type: 'Point', coordinates: [23.33, 42.65] } },
	products: [
		{
			id: 'wp-1',
			price: 10,
			initialPrice: 12,
			count: 5,
			product: product('1'),
			deliveryTimeMin: 20,
			deliveryTimeMax: 40,
		},
	],
};

export function order(overrides: Partial<Order> = {}): Order {
	return {
		id: 'order-1',
		_id: 'order-1',
		user,
		warehouse,
		carrier: null,
		products: [
			{
				id: 'op-1',
				_id: 'op-1',
				count: 1,
				price: 10,
				initialPrice: 12,
				isTakeaway: false,
				deliveryTimeMin: 20,
				deliveryTimeMax: 40,
				product: { ...product('1'), _id: 'product-1' },
			},
		],
		isConfirmed: true,
		isCancelled: false,
		isPaid: false,
		warehouseStatus: OrderWarehouseStatus.ReadyForProcessing,
		carrierStatus: OrderCarrierStatus.NoCarrier,
		orderNumber: 7,
		createdAt: '2026-11-25T10:00:00.000Z',
		_createdAt: '2026-11-25T10:00:00.000Z',
		...overrides,
	};
}
