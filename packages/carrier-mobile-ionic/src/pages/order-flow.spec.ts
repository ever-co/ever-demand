import { of } from 'rxjs';
import CarrierStatus from '@modules/server.common/enums/CarrierStatus';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { HomePage } from './main/home/home';
import { DriveToWarehousePage } from './main/drive-to-warehouse/drive-to-warehouse';
import { StartingDeliveryPage } from './main/starting-delivery/starting-delivery';
import { DeliveryPage } from './main/delivery/delivery';
import { GetProductPage } from './product/get-product/get-product';
import { ReturnProductPage } from './product/return-product/return-product';
// The page NgModules give the AOT test build the template scope of the pages.
import './main/home/home.module';
import './main/drive-to-warehouse/drive-to-warehouse.module';
import './main/starting-delivery/starting-delivery.module';
import './main/delivery/delivery.module';
import './product/get-product/get-product.module';
import './product/return-product/return-product.module';

/**
 * Order status transitions a carrier drives, page by page:
 * home (online/offline) -> drive to warehouse (take/skip) -> get product (picked up)
 * -> starting delivery (start) -> delivery (delivered) or return product (issue).
 */
describe('Carrier order flow', () => {
	it('pages use eager change detection (Angular 22 defaults to OnPush)', () => {
		// socket.io, Apollo, promise and timer callbacks set plain fields on these pages
		for (const page of [
			HomePage,
			DriveToWarehousePage,
			StartingDeliveryPage,
			DeliveryPage,
			GetProductPage,
			ReturnProductPage,
		]) {
			expect((page as any).ɵcmp.onPush, page.name).toBe(false);
		}
	});

	let store: Record<string, any>;
	let router: { navigateByUrl: any; navigate: any };
	let navCtrl: { navigateRoot: any };
	let carrierRouter: { updateStatus: any; get: any };
	let carrierOrdersRouter: {
		updateStatus: any;
		selectedForDelivery: any;
		skipOrders: any;
		cancelDelivery: any;
	};
	let orderRouter: { get: any; updateCarrierStatus: any };

	const carrier = { id: 'c1', _id: 'c1' } as any;
	const order = { id: 'o1', isCancelled: false } as any;

	beforeEach(() => {
		localStorage.clear();
		store = {
			carrierId: 'c1',
			orderId: 'o1',
			selectedOrder: order,
			language: 'en-US',
		};
		router = {
			navigateByUrl: vi.fn().mockResolvedValue(true),
			navigate: vi.fn().mockResolvedValue(true),
		};
		navCtrl = { navigateRoot: vi.fn().mockResolvedValue(true) };
		carrierRouter = {
			updateStatus: vi.fn(async (_id, status) => ({ ...carrier, status })),
			get: vi.fn(() => of(carrier)),
		};
		carrierOrdersRouter = {
			updateStatus: vi.fn().mockResolvedValue(carrier),
			selectedForDelivery: vi.fn().mockResolvedValue(carrier),
			skipOrders: vi.fn().mockResolvedValue(carrier),
			cancelDelivery: vi.fn().mockResolvedValue(carrier),
		};
		orderRouter = {
			get: vi.fn(() => of(order)),
			updateCarrierStatus: vi.fn().mockResolvedValue(order),
		};
	});

	describe('home', () => {
		const page = () =>
			new HomePage(
				carrierRouter as any,
				{ schedule: vi.fn() } as any,
				store as any,
				{} as any,
				{} as any,
				{} as any,
				router as any
			);

		it('start working puts the carrier online', async () => {
			const home = page();
			await home.startWorking();

			expect(carrierRouter.updateStatus).toHaveBeenCalledWith(
				'c1',
				CarrierStatus.Online
			);
			expect(home.isWorking).toBe(true);
		});

		it('stop working puts the carrier offline and drops the current order', async () => {
			localStorage.setItem('orderId', 'o1');
			const home = page();
			await home.stopWorking();

			expect(carrierRouter.updateStatus).toHaveBeenCalledWith(
				'c1',
				CarrierStatus.Offline
			);
			expect(home.isWorking).toBe(false);
			expect(localStorage.getItem('orderId')).toBeNull();
			expect(store.selectedOrder).toBeNull();
		});
	});

	describe('drive to warehouse', () => {
		const page = () => {
			const p = new DriveToWarehousePage(
				orderRouter as any,
				carrierRouter as any,
				carrierOrdersRouter as any,
				store as any,
				{} as any,
				{} as any,
				router as any,
				navCtrl as any,
				{} as any
			);
			p.carrier = carrier;
			p.selectedOrder = order;
			return p;
		};

		it('take work selects the order for delivery', async () => {
			await page().takeWork();
			expect(carrierOrdersRouter.selectedForDelivery).toHaveBeenCalledWith(
				'c1',
				['o1']
			);
		});

		it('skip work skips the order and goes home', async () => {
			await page().skipWork();
			expect(carrierOrdersRouter.skipOrders).toHaveBeenCalledWith('c1', [
				'o1',
			]);
			expect(store.selectedOrder).toBeNull();
			expect(navCtrl.navigateRoot).toHaveBeenCalledWith('/main/home');
		});

		it('cancel work cancels the delivery and goes home', async () => {
			const p = page();
			p.fromDelivery = false;
			await p.cancelWork();
			expect(carrierOrdersRouter.cancelDelivery).toHaveBeenCalledWith('c1', [
				'o1',
			]);
			expect(navCtrl.navigateRoot).toHaveBeenCalledWith('/main/home');
		});

		it('cancel while driving back from a delivery returns to the delivery', async () => {
			const p = page();
			p.fromDelivery = true;
			await p.cancelWork();
			expect(carrierOrdersRouter.cancelDelivery).not.toHaveBeenCalled();
			expect(router.navigateByUrl).toHaveBeenCalledWith('/main/delivery', {
				skipLocationChange: true,
			});
		});

		it('"I am there" opens get-product, or return-product when coming back', async () => {
			const p = page();
			p.fromDelivery = false;
			await p.carrierInWarehouse();
			expect(router.navigateByUrl).toHaveBeenCalledWith('/product/get', {
				skipLocationChange: false,
			});

			p.fromDelivery = true;
			await p.carrierInWarehouse();
			expect(store.returnProductFrom).toBe('driveToWarehouse');
			expect(router.navigate).toHaveBeenCalledWith(['/product/return'], {
				skipLocationChange: false,
			});
		});
	});

	describe('get product', () => {
		const page = () => {
			const p = new GetProductPage(
				orderRouter as any,
				carrierRouter as any,
				carrierOrdersRouter as any,
				{ getTranslate: vi.fn() } as any,
				store as any,
				navCtrl as any
			);
			p.carrier = carrier;
			p.selectedOrder = order;
			return p;
		};

		it('"got it" marks the order picked up and starts the delivery step', async () => {
			await page().gotProduct();
			expect(carrierOrdersRouter.updateStatus).toHaveBeenCalledWith(
				'c1',
				OrderCarrierStatus.CarrierPickedUpOrder
			);
			expect(navCtrl.navigateRoot).toHaveBeenCalledWith(
				'/main/starting-delivery'
			);
		});

		it('with carrier competition the first carrier to pick up wins the order', async () => {
			const p = page();
			p.orderCarrierCompetition = true;
			await p.gotProductWithCarrierCompetition();
			expect(carrierOrdersRouter.selectedForDelivery).toHaveBeenCalledWith(
				'c1',
				['o1'],
				true
			);
		});

		it('cancel cancels the delivery', async () => {
			await page().cancelWork();
			expect(carrierOrdersRouter.cancelDelivery).toHaveBeenCalledWith('c1', [
				'o1',
			]);
			expect(navCtrl.navigateRoot).toHaveBeenCalledWith('/main/home');
		});
	});

	describe('starting delivery', () => {
		const page = () =>
			new StartingDeliveryPage(
				orderRouter as any,
				carrierOrdersRouter as any,
				{} as any,
				{} as any,
				router as any,
				store as any
			);

		it('start sets the carrier status to "start delivery"', async () => {
			await page().startDelivery();
			expect(carrierOrdersRouter.updateStatus).toHaveBeenCalledWith(
				'c1',
				OrderCarrierStatus.CarrierStartDelivery
			);
			expect(router.navigateByUrl).toHaveBeenCalledWith('/main/delivery', {
				skipLocationChange: false,
			});
		});

		it('cancel goes to return-product', () => {
			page().returnProduct();
			expect(store.returnProductFrom).toBe('startingDelivery');
			expect(router.navigateByUrl).toHaveBeenCalledWith('/product/return', {
				skipLocationChange: false,
			});
		});
	});

	describe('delivery', () => {
		const analytics = { track: vi.fn() };
		const page = () =>
			new DeliveryPage(
				orderRouter as any,
				analytics as any,
				{
					defaultLocation: () => ({
						coords: { latitude: 42.6459136, longitude: 23.3332736 },
					}),
				} as any,
				{} as any,
				router as any,
				store as any
			);

		it('delivered completes the order and goes home', async () => {
			localStorage.setItem('orderId', 'o1');
			const p = page();
			p.selectedOrder = order;
			await p.delivered();

			expect(orderRouter.updateCarrierStatus).toHaveBeenCalledWith(
				'o1',
				OrderCarrierStatus.DeliveryCompleted
			);
			expect(analytics.track).toHaveBeenCalledWith('Order Delivered');
			expect(router.navigateByUrl).toHaveBeenCalledWith('/main/home', {
				skipLocationChange: false,
			});
			expect(localStorage.getItem('orderId')).toBeNull();
		});

		it('cancel drives back to the warehouse', () => {
			page().cancel();
			expect(store.driveToWarehouseFrom).toBe('delivery');
			expect(router.navigateByUrl).toHaveBeenCalledWith(
				'/main/drive-to-warehouse',
				{ skipLocationChange: false }
			);
		});

		it('loads the order and draws the route to the customer', async () => {
			localStorage.setItem('orderId', 'o1');
			orderRouter.get.mockReturnValue(
				of({
					...order,
					user: {
						geoLocation: {
							loc: { type: 'Point', coordinates: [23.3332736, 42.6459136] },
						},
					},
				})
			);
			const p = page();
			p.carrierMap = { setCenter: vi.fn(), drawRoute: vi.fn() } as any;

			(p as any).loadData();
			await vi.waitFor(() => expect(p.disabledButtons).toBe(false));

			expect(orderRouter.get).toHaveBeenCalledWith('o1', {
				populateWarehouse: true,
			});
			expect(p.carrierUserDistance).toBe('0.00');
			const origin = { lat: 42.6459136, lng: 23.3332736 };
			expect(p.carrierMap.setCenter).toHaveBeenCalledWith(origin);
			expect(p.carrierMap.drawRoute).toHaveBeenCalledWith(origin, origin);
			p.ngOnDestroy();
		});
	});

	describe('return product', () => {
		const page = () =>
			new ReturnProductPage(
				{ getTranslate: vi.fn() } as any,
				carrierRouter as any,
				orderRouter as any,
				store as any,
				navCtrl as any
			);

		it('returning reports a delivery issue and goes home', async () => {
			const p = page();
			p.selectedOrder = order;
			await p.returnProduct();

			expect(orderRouter.updateCarrierStatus).toHaveBeenCalledWith(
				'o1',
				OrderCarrierStatus.IssuesDuringDelivery
			);
			expect(navCtrl.navigateRoot).toHaveBeenCalledWith('/main/home');
		});

		it('a cancelled order is only dropped', async () => {
			const p = page();
			p.selectedOrder = { ...order, isCancelled: true };
			await p.returnProduct();

			expect(orderRouter.updateCarrierStatus).not.toHaveBeenCalled();
			expect(store.selectedOrder).toBeNull();
		});

		it('cancel is allowed only when coming from starting-delivery', () => {
			const p = page();
			p.selectedOrder = order;

			store.returnProductFrom = 'driveToWarehouse';
			expect(p.allowCancel).toBe(false);
			expect(() => p.cancelReturn()).toThrow('Cancel not allowed!');

			store.returnProductFrom = 'startingDelivery';
			expect(p.allowCancel).toBe(true);
			p.cancelReturn();
			expect(navCtrl.navigateRoot).toHaveBeenCalledWith(
				'/main/starting-delivery'
			);
		});
	});
});
