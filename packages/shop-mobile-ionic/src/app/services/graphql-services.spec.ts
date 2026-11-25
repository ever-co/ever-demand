import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import {
	ApolloTestingController,
	ApolloTestingModule,
} from 'apollo-angular/testing';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import { OrdersService } from './orders/orders.service';
import { UsersService } from './users/users.service';
import { MerchantsService } from './merchants/merchants.service';
import { WarehouseProductsService } from './merchants/warehouse-products';
import { GeoLocationsMerchantsService } from './geo-location-merchants.service';
import { GeoLocationProductsService } from './geo-location/geo-location-products';

// The GraphQL operations the shop sends (see docs/latest-stack/shop-mobile-features.md,
// section 1.4). The schema is shared with core, so the operation names, variables and
// fields here are a contract.
const sofia: { loc: ILocation } = {
	loc: { type: 'Point', coordinates: [23.33, 42.64] },
};

const productInfo = (id: string, extra: Record<string, unknown> = {}) => ({
	distance: 1,
	warehouseId: 'warehouse-1',
	warehouseLogo: 'logo.png',
	warehouseProduct: {
		id,
		price: 10,
		initialPrice: 12,
		count: 5,
		soldCount: 0,
		product: {
			id: `product-${id}`,
			title: [{ locale: 'en-US', value: 'Pizza' }],
			description: [{ locale: 'en-US', value: 'Hot' }],
			details: [{ locale: 'en-US', value: '' }],
			images: [
				{
					locale: 'en-US',
					url: 'pizza.png',
					width: 100,
					height: 100,
					orientation: 1,
				},
			],
		},
		isManufacturing: true,
		isCarrierRequired: true,
		isDeliveryRequired: true,
		isProductAvailable: true,
		isTakeaway: false,
		deliveryTimeMin: 10,
		deliveryTimeMax: 20,
		...extra,
	},
});

describe('GraphQL services', () => {
	let controller: ApolloTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ApolloTestingModule],
			providers: [
				OrdersService,
				MerchantsService,
				WarehouseProductsService,
				GeoLocationsMerchantsService,
				GeoLocationProductsService,
			],
		});
		controller = TestBed.inject(ApolloTestingController);
	});

	afterEach(() => {
		controller.verify();
	});

	describe('OrdersService', () => {
		it('asks getOrder for the given fields only', async () => {
			const order$ = firstValueFrom(
				TestBed.inject(OrdersService).getOrder('order-1', '{status}')
			);

			const op = controller.expectOne('GetOrder');
			expect(op.operation.variables).toEqual({ id: 'order-1' });
			expect(op.operation.query.loc?.source.body).toContain(
				'getOrder(id: $id) {status}'
			);
			op.flush({ data: { getOrder: { status: 2 } } });

			expect(await order$).toEqual({ status: 2 });
		});

		it('generates demo orders for a new customer', async () => {
			const done = firstValueFrom(
				TestBed.inject(OrdersService).generateOrdersByCustomerId(
					40,
					'user-1'
				)
			);

			const op = controller.expectOne('GenerateOrdersByCustomerId');
			expect(op.operation.variables).toEqual({
				numberOfOrders: 40,
				customerId: 'user-1',
			});
			op.flush({ data: { generateOrdersByCustomerId: null } });
			await done;
		});
	});

	describe('UsersService', () => {
		it('loads the address of a user', async () => {
			const user$ = firstValueFrom(
				TestBed.inject(UsersService).getUser('user-1')
			);

			const op = controller.expectOne('GetUser');
			expect(op.operation.variables).toEqual({ id: 'user-1' });
			op.flush({
				data: {
					user: {
						apartment: '3',
						geoLocation: {
							countryId: 21,
							countryName: 'Bulgaria',
							postcode: '1700',
							city: 'Sofia',
							streetAddress: 'Simeonovsko shose',
						},
					},
				},
			});

			expect((await user$).apartment).toBe('3');
		});
	});

	describe('MerchantsService', () => {
		it('searches merchants by name near the customer', async () => {
			const merchants = TestBed.inject(
				MerchantsService
			).getMerchantsBuyName('pizza', sofia);

			const op = controller.expectOne('GetMerchantsBuyName');
			expect(op.operation.variables).toEqual({
				searchName: 'pizza',
				geoLocation: sofia,
			});
			op.flush({
				data: {
					getMerchantsBuyName: [
						{
							id: 'warehouse-1',
							username: 'pizza',
							name: 'Pizza Hut',
							logo: 'logo.png',
							isActive: true,
						},
					],
				},
			});

			expect((await merchants).map((m) => m.name)).toEqual([
				'Pizza Hut',
			]);
		});
	});

	describe('GeoLocationsMerchantsService', () => {
		it('lists the merchants close to the customer', async () => {
			const merchants$ = firstValueFrom(
				TestBed.inject(GeoLocationsMerchantsService).getCloseMerchants(
					sofia
				)
			);

			const op = controller.expectOne('getCloseMerchants');
			expect(op.operation.variables).toEqual({ geoLocation: sofia });
			op.flush({
				data: {
					getCloseMerchants: [
						{
							id: 'warehouse-1',
							username: 'pizza',
							name: 'Pizza Hut',
							logo: 'logo.png',
						},
					],
				},
			});

			expect((await merchants$)[0].id).toBe('warehouse-1');
		});
	});

	describe('WarehouseProductsService', () => {
		it('loads one product of a merchant', async () => {
			const product = TestBed.inject(
				WarehouseProductsService
			).getWarehouseProduct('warehouse-1', 'wp-1');

			const op = controller.expectOne('GetWarehouseProduct');
			expect(op.operation.variables).toEqual({
				warehouseId: 'warehouse-1',
				warehouseProductId: 'wp-1',
			});
			op.flush({
				data: {
					getWarehouseProduct: productInfo('wp-1').warehouseProduct,
				},
			});

			expect((await product).id).toBe('wp-1');
		});

		it('resolves null for a product that is gone', async () => {
			const product = TestBed.inject(
				WarehouseProductsService
			).getWarehouseProduct('warehouse-1', 'wp-gone');

			controller
				.expectOne('GetWarehouseProduct')
				.flush({ data: { getWarehouseProduct: null } });

			expect(await product).toBeNull();
		});
	});

	describe('GeoLocationProductsService', () => {
		const options = {
			isDeliveryRequired: true,
			isTakeaway: false,
			merchantIds: [],
			imageOrientation: 1,
			locale: 'en-US',
			withoutCount: true,
		};

		it('pages the products near the customer and drops unavailable ones', async () => {
			const products$ = firstValueFrom(
				TestBed.inject(GeoLocationProductsService)
					.geoLocationProductsByPaging(
						sofia,
						{ skip: 0, limit: 10 },
						options
					)
					.pipe(take(1))
			);

			const op = controller.expectOne('GeoLocationProductsByPaging');
			expect(op.operation.variables).toEqual({
				geoLocation: sofia,
				options,
				pagingOptions: { skip: 0, limit: 10 },
			});
			op.flush({
				data: {
					geoLocationProductsByPaging: [
						productInfo('wp-1'),
						null,
						productInfo('wp-2', { isProductAvailable: false }),
					],
				},
			});

			const products = await products$;
			expect(products.map((p) => p.warehouseProduct.id)).toEqual([
				'wp-1',
			]);
		});

		it('passes the search text', async () => {
			const products$ = firstValueFrom(
				TestBed.inject(GeoLocationProductsService)
					.geoLocationProductsByPaging(
						sofia,
						{ skip: 10, limit: 10 },
						{ isDeliveryRequired: false, isTakeaway: true },
						'pizza'
					)
					.pipe(take(1), toArray())
			);

			const op = controller.expectOne('GeoLocationProductsByPaging');
			expect(op.operation.variables.searchText).toBe('pizza');
			expect(op.operation.variables.pagingOptions).toEqual({
				skip: 10,
				limit: 10,
			});
			op.flush({ data: { geoLocationProductsByPaging: [] } });

			expect(await products$).toEqual([[]]);
		});

		it('counts the products near the customer', async () => {
			const count = TestBed.inject(
				GeoLocationProductsService
			).getCountOfGeoLocationProducts(sofia, options);

			const op = controller.expectOne('GetCountOfGeoLocationProducts');
			expect(op.operation.variables).toEqual({
				geoLocation: sofia,
				options,
			});
			op.flush({ data: { getCountOfGeoLocationProducts: 7 } });

			expect(await count).toBe(7);
		});
	});
});
