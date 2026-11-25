import { TestBed } from '@angular/core/testing';
import {
	ApolloTestingController,
	ApolloTestingModule,
} from 'apollo-angular/testing';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';
import { GeoLocationProductsService } from './geo-location-products';

const product = (id: string, isProductAvailable: boolean) => ({
	__typename: 'ProductInfo',
	distance: 1,
	warehouseId: 'w1',
	warehouseLogo: 'logo.png',
	warehouseProduct: {
		__typename: 'WarehouseProduct',
		id,
		price: 10,
		initialPrice: 12,
		count: 5,
		soldCount: 0,
		product: {
			__typename: 'Product',
			id: 'p-' + id,
			title: [],
			description: [],
			details: [],
			images: [],
		},
		isManufacturing: false,
		isCarrierRequired: true,
		isDeliveryRequired: true,
		isProductAvailable,
		isTakeaway: false,
		deliveryTimeMin: 10,
		deliveryTimeMax: 20,
	},
});

describe('GeoLocationProductsService', () => {
	let service: GeoLocationProductsService;
	let controller: ApolloTestingController;
	const geoLocation = { loc: { type: 'Point', coordinates: [23, 42] } };

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ApolloTestingModule],
			providers: [GeoLocationProductsService],
		});
		service = TestBed.inject(GeoLocationProductsService);
		controller = TestBed.inject(ApolloTestingController);
	});

	afterEach(() => controller.verify());

	it('returns only the available products of the page', async () => {
		const result = firstValueFrom(
			service
				.geoLocationProductsByPaging(
					geoLocation,
					{ skip: 0, limit: 10 },
					{ isDeliveryRequired: true, isTakeaway: false },
					'pizza'
				)
				.pipe(first())
		);

		const op = controller.expectOne('GeoLocationProductsByPaging');
		expect(op.operation.variables).toEqual({
			geoLocation,
			options: { isDeliveryRequired: true, isTakeaway: false },
			pagingOptions: { skip: 0, limit: 10 },
			searchText: 'pizza',
		});
		op.flushData({
			geoLocationProductsByPaging: [
				product('wp1', true),
				product('wp2', false),
				product('wp3', true),
			],
		});

		const products = await result;
		expect(products.map((p) => p.warehouseProduct.id)).toEqual([
			'wp1',
			'wp3',
		]);
	});

	it('returns the count of the products around a location', async () => {
		const count = service.getCountOfGeoLocationProducts(geoLocation, {
			isDeliveryRequired: false,
			isTakeaway: true,
		});

		const op = controller.expectOne('GetCountOfGeoLocationProducts');
		expect(op.operation.variables.options).toEqual({
			isDeliveryRequired: false,
			isTakeaway: true,
		});
		op.flushData({ getCountOfGeoLocationProducts: 7 });

		await expect(count).resolves.toBe(7);
	});
});
