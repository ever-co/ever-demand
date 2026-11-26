import { TestBed } from '@angular/core/testing';
import {
	ApolloTestingController,
	ApolloTestingModule,
} from 'apollo-angular/testing';
import { WarehouseProductsService } from './warehouse-products';

describe('WarehouseProductsService', () => {
	let service: WarehouseProductsService;
	let controller: ApolloTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ApolloTestingModule],
			providers: [WarehouseProductsService],
		});
		service = TestBed.inject(WarehouseProductsService);
		controller = TestBed.inject(ApolloTestingController);
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		controller.verify();
		vi.restoreAllMocks();
	});

	it('loads one product of a store', async () => {
		const result = service.getWarehouseProduct('w1', 'wp1');

		const op = controller.expectOne('GetWarehouseProduct');
		expect(op.operation.variables).toEqual({
			warehouseId: 'w1',
			warehouseProductId: 'wp1',
		});
		op.flushData({
			getWarehouseProduct: {
				__typename: 'WarehouseProduct',
				id: 'wp1',
				price: 9,
				initialPrice: 9,
				count: 1,
				soldCount: 0,
				product: {
					__typename: 'Product',
					id: 'p1',
					title: [],
					description: [],
					details: [],
					images: [],
				},
				isManufacturing: false,
				isCarrierRequired: false,
				isDeliveryRequired: false,
				isProductAvailable: true,
				isTakeaway: true,
				deliveryTimeMin: null,
				deliveryTimeMax: null,
			},
		});

		const warehouseProduct = await result;
		expect(warehouseProduct.id).toBe('wp1');
		expect(warehouseProduct.product.id).toBe('p1');
	});
});
