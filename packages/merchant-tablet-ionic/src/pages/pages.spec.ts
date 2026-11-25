import { of } from 'rxjs';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import { LoginPage } from './+login/login';
import { OrderState, WarehousePage } from './+warehouse/warehouse';
// The page NgModules give the AOT test build the template scope of the pages.
import './+login/login.module';
import './+warehouse/warehouse.module';

describe('Merchant pages', () => {
	afterEach(() => localStorage.clear());

	describe('LoginPage', () => {
		let auth: { login: ReturnType<typeof vi.fn> };
		let store: Record<string, unknown>;
		let router: { navigate: ReturnType<typeof vi.fn> };
		const page = () => new LoginPage(auth as any, store as any, router as any);

		beforeEach(() => {
			auth = { login: vi.fn() };
			store = {};
			router = { navigate: vi.fn() };
		});

		it('starts from a clean session with the default credentials', () => {
			localStorage.setItem('_warehouseId', 'old');
			localStorage.setItem('token', 'old');

			const p = page();

			expect(localStorage.getItem('_warehouseId')).toBeNull();
			expect(localStorage.getItem('token')).toBeNull();
			expect(p.username).toBeTruthy();
			expect(p.password).toBeTruthy();
		});

		it('stores the session and opens the warehouse page', async () => {
			auth.login.mockReturnValue(of({ token: 'jwt', warehouse: { id: 'w1' } }));
			vi.spyOn(console, 'log').mockImplementation(() => undefined);
			const p = page();
			p.username = 'store';
			p.password = 'secret';

			await p.login();

			expect(auth.login).toHaveBeenCalledWith('store', 'secret');
			expect(store.warehouseId).toBe('w1');
			expect(store.token).toBe('jwt');
			expect(router.navigate).toHaveBeenCalledWith(['warehouse']);
		});

		it('warns when the store does not exist', async () => {
			auth.login.mockReturnValue(of(null));
			const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

			await page().login();

			expect(alert).toHaveBeenCalledWith('Merchant not found!');
			expect(router.navigate).not.toHaveBeenCalled();
		});
	});

	describe('WarehousePage', () => {
		let orderRouter: { updateWarehouseStatus: ReturnType<typeof vi.fn> };
		let productsRouter: { increaseCount: ReturnType<typeof vi.fn> };
		let analytics: { track: ReturnType<typeof vi.fn> };
		const page = () =>
			new WarehousePage(
				{} as any,
				{} as any,
				orderRouter as any,
				productsRouter as any,
				analytics as any,
				{ getTranslate: (m: any) => m?.[0]?.value } as any,
				{} as any,
				{} as any,
				{} as any
			);

		beforeEach(() => {
			orderRouter = { updateWarehouseStatus: vi.fn().mockResolvedValue({}) };
			productsRouter = { increaseCount: vi.fn().mockResolvedValue({}) };
			analytics = { track: vi.fn() };
		});

		it('classifies orders for the order cards', () => {
			const p = page();
			const order = (o: Record<string, unknown>) =>
				({ warehouseStatus: 0, carrierStatus: 0, isCancelled: false, carrier: null, ...o }) as any;

			expect(p.orderState(order({ warehouseStatus: OrderWarehouseStatus.AllocationFailed }))).toBe(
				OrderState.WarehousePreparationProblem
			);
			expect(p.orderState(order({ carrierStatus: OrderCarrierStatus.IssuesDuringDelivery }))).toBe(
				OrderState.DeliveryProblem
			);
			expect(p.orderState(order({ isCancelled: true }))).toBe(OrderState.Canceled);
			expect(p.orderState(order({ carrierStatus: OrderCarrierStatus.DeliveryCompleted, carrier: {} }))).toBe(
				OrderState.Delivered
			);
			expect(p.orderState(order({}))).toBe(OrderState.WarehousePreparation);
			expect(p.orderState(order({ carrier: { id: 'c1' } }))).toBe(OrderState.InDelivery);
		});

		it('moves an order through the warehouse statuses and tracks failures', async () => {
			const p = page();

			await p.updateOrderWarehouseStatus('o1', OrderWarehouseStatus.PackagingFinished);
			expect(orderRouter.updateWarehouseStatus).toHaveBeenCalledWith(
				'o1',
				OrderWarehouseStatus.PackagingFinished
			);
			expect(analytics.track).not.toHaveBeenCalled();

			await p.updateOrderWarehouseStatus('o1', OrderWarehouseStatus.PackagingFailed);
			expect(analytics.track).toHaveBeenCalledWith('Order Failed');
		});

		it('adds one unit of a product to the store', async () => {
			localStorage.setItem('_warehouseId', 'w1');
			await page().addProduct('p1');
			expect(productsRouter.increaseCount).toHaveBeenCalledWith('w1', 'p1', 1);
		});

		it('shortens long product titles', () => {
			const p = page();
			expect(p.truncateTitle('Pizza  Margherita')).toBe('Pizza Marghe...');
			expect(p.truncateTitle('Cola')).toBe('Cola');
		});
	});
});
