import { of, throwError } from 'rxjs';
import { Store } from './store.service';

describe('Store', () => {
	let carrierRouter: { get: ReturnType<typeof vi.fn> };
	let translate: { use: ReturnType<typeof vi.fn> };
	let store: Store;

	beforeEach(() => {
		localStorage.clear();
		carrierRouter = { get: vi.fn() };
		translate = { use: vi.fn() };
		store = new Store(carrierRouter as any, translate as any);
	});

	afterEach(() => localStorage.clear());

	it('keeps the session (token, carrier, order) in localStorage', () => {
		store.token = 'jwt';
		store.carrierId = 'carrier-1';
		store.orderId = 'order-1';

		expect(localStorage.getItem('token')).toBe('jwt');
		expect(store.carrierId).toBe('carrier-1');
		expect(store.orderId).toBe('order-1');

		store.token = null;
		store.carrierId = null;
		store.orderId = null;

		expect(store.token).toBeNull();
		expect(store.carrierId).toBeNull();
		expect(store.orderId).toBeNull();
	});

	it('switches the UI language with the two-letter code', () => {
		store.language = 'he-IL';

		expect(localStorage.getItem('_language')).toBe('he-IL');
		expect(translate.use).toHaveBeenCalledWith('he');
	});

	it('publishes the selected order', () => {
		const seen: unknown[] = [];
		store.selectedOrder$.subscribe((o) => seen.push(o));

		const order = { id: 'o1' } as any;
		store.selectedOrder = order;
		store.selectedOrder = null;

		expect(seen).toEqual([undefined, order, null]);
		expect(store.selectedOrder).toBeNull();
	});

	it('shows the information page for maintenance, no internet or a lost server', () => {
		// ServerConnectionService always records the HTTP status of its probe; status 0
		// (and no record at all) means the API is unreachable.
		expect(store.showInformationPage).toBeTruthy();
		store.serverConnection = '404';
		expect(store.showInformationPage).toBeFalsy();

		store.serverConnection = '0';
		expect(store.showInformationPage).toBeTruthy();
		store.serverConnection = '200';
		expect(store.showInformationPage).toBeFalsy();

		store.noInternet = 'noInternet';
		expect(store.showInformationPage).toBeTruthy();
		store.clearNoInternet();

		localStorage.setItem('maintenanceMode', 'carrier-mobile');
		expect(store.showInformationPage).toBeTruthy();
		store.clearMaintenanceMode();
		expect(store.showInformationPage).toBeFalsy();
	});

	it('is logged in only when the stored carrier exists on the server', async () => {
		expect(await store.isLogged()).toBe(false);
		expect(carrierRouter.get).not.toHaveBeenCalled();

		store.carrierId = 'carrier-1';
		carrierRouter.get.mockReturnValue(of({ id: 'carrier-1' }));
		expect(await store.isLogged()).toBe(true);
		expect(carrierRouter.get).toHaveBeenCalledWith('carrier-1');

		carrierRouter.get.mockReturnValue(throwError(() => new Error('nope')));
		expect(await store.isLogged()).toBe(false);
	});
});
