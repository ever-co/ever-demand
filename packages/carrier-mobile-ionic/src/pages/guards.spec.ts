import { of } from 'rxjs';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { AuthGuard } from './auth.guard';
import { HomeModuleGuard } from './main/home/home.module.guard';
import { DeliveryModuleGuard } from './main/delivery/delivery.module.guard';
import { StartingDeliveryModuleGuard } from './main/starting-delivery/starting-delivery.module.guard';
import { DriveToWarehouseModuleGuard } from './main/drive-to-warehouse/drive-to-warehouse.module.guard';
import { ProductModuleGuard } from './product/product.module.guard';

/**
 * The carrier's delivery flow is driven by route guards: each step redirects to the page
 * that matches the order's carrier status.
 */
describe('Carrier route guards', () => {
	let store: {
		orderId: string | null;
		driveToWarehouseFrom: string | null;
		isLogged: ReturnType<typeof vi.fn>;
	};
	let router: { navigateByUrl: ReturnType<typeof vi.fn> };
	let orderRouter: { get: ReturnType<typeof vi.fn> };
	const route = {} as any;

	beforeEach(() => {
		store = {
			orderId: null,
			driveToWarehouseFrom: null,
			isLogged: vi.fn(),
		};
		router = { navigateByUrl: vi.fn() };
		orderRouter = { get: vi.fn() };
	});

	const withOrder = (carrierStatus: OrderCarrierStatus) => {
		store.orderId = 'o1';
		orderRouter.get.mockReturnValue(of({ id: 'o1', carrierStatus }));
	};

	it('AuthGuard sends a logged-out carrier to /login', async () => {
		const guard = new AuthGuard(store as any, router as any);

		store.isLogged.mockResolvedValue(false);
		expect(await guard.canLoad(route)).toBe(false);
		expect(router.navigateByUrl).toHaveBeenCalledWith('/login');

		store.isLogged.mockResolvedValue(true);
		expect(await guard.canLoad(route)).toBe(true);
	});

	it('home: a carrier with an order in progress goes to drive-to-warehouse', async () => {
		const guard = new HomeModuleGuard(store as any, router as any);

		expect(await guard.canLoad(route)).toBe(true);

		store.orderId = 'o1';
		expect(await guard.canLoad(route)).toBe(false);
		expect(router.navigateByUrl).toHaveBeenCalledWith(
			'/main/drive-to-warehouse'
		);
	});

	describe('drive-to-warehouse', () => {
		const guard = () =>
			new DriveToWarehouseModuleGuard(
				store as any,
				router as any,
				orderRouter as any
			);

		it('without an order goes home', async () => {
			expect(await guard().canLoad(route)).toBe(false);
			expect(router.navigateByUrl).toHaveBeenCalledWith('/main/home');
		});

		it('stays while the order is only selected', async () => {
			withOrder(OrderCarrierStatus.CarrierSelectedOrder);
			expect(await guard().canLoad(route)).toBe(true);
			expect(orderRouter.get).toHaveBeenCalledWith('o1', {
				populateCarrier: false,
				populateWarehouse: false,
			});
		});

		it('moves on to starting-delivery once the products are picked up', async () => {
			withOrder(OrderCarrierStatus.CarrierPickedUpOrder);
			expect(await guard().canLoad(route)).toBe(false);
			expect(router.navigateByUrl).toHaveBeenCalledWith(
				'/main/starting-delivery'
			);
		});

		it('stays when the carrier drives back from a delivery', async () => {
			withOrder(OrderCarrierStatus.CarrierStartDelivery);
			store.driveToWarehouseFrom = 'delivery';
			expect(await guard().canLoad(route)).toBe(true);
		});
	});

	describe('starting-delivery', () => {
		const guard = () =>
			new StartingDeliveryModuleGuard(
				store as any,
				router as any,
				orderRouter as any
			);

		it('without an order goes home', async () => {
			expect(await guard().canLoad(route)).toBe(false);
			expect(router.navigateByUrl).toHaveBeenCalledWith('/main/home');
		});

		it('stays while the products are picked up', async () => {
			withOrder(OrderCarrierStatus.CarrierPickedUpOrder);
			expect(await guard().canLoad(route)).toBe(true);
		});

		it('moves on to delivery once the delivery started', async () => {
			withOrder(OrderCarrierStatus.CarrierStartDelivery);
			expect(await guard().canLoad(route)).toBe(false);
			expect(router.navigateByUrl).toHaveBeenCalledWith('/main/delivery');
		});
	});

	describe('delivery', () => {
		const guard = () => new DeliveryModuleGuard(store as any, router as any);

		it('without an order goes home', async () => {
			expect(await guard().canLoad(route)).toBe(false);
			expect(router.navigateByUrl).toHaveBeenCalledWith('/main/home');
		});

		it('with an order in delivery stays', async () => {
			store.orderId = 'o1';
			expect(await guard().canLoad(route)).toBe(true);
		});

		it('returns to drive-to-warehouse when the carrier cancelled the delivery', async () => {
			store.orderId = 'o1';
			store.driveToWarehouseFrom = 'delivery';
			expect(await guard().canLoad(route)).toBe(false);
			expect(router.navigateByUrl).toHaveBeenCalledWith(
				'/main/drive-to-warehouse'
			);
		});
	});

	it('product pages need an order', async () => {
		const guard = new ProductModuleGuard(store as any, router as any);

		expect(await guard.canLoad(route)).toBe(false);
		expect(router.navigateByUrl).toHaveBeenCalledWith('/main/home');

		store.orderId = 'o1';
		expect(await guard.canLoad(route)).toBe(true);
	});
});
