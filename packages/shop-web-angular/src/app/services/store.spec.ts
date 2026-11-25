import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Store } from './store';

describe('Store', () => {
	let store: Store;
	let userRouter: { get: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		localStorage.clear();
		userRouter = { get: vi.fn() };
		TestBed.configureTestingModule({
			providers: [Store, { provide: UserRouter, useValue: userRouter }],
		});
		store = TestBed.inject(Store);
	});

	afterEach(() => localStorage.clear());

	it('keeps the user id in localStorage and removes it with null', () => {
		expect(store.userId).toBeNull();

		store.userId = 'u1';
		expect(localStorage.getItem('_userId')).toBe('u1');
		expect(store.userId).toBe('u1');

		store.userId = null;
		expect(localStorage.getItem('_userId')).toBeNull();
	});

	it('stores the invite system flag as enabled/disabled', () => {
		expect(store.inviteSystem).toBe(false);

		store.inviteSystem = true;
		expect(localStorage.getItem('_inviteSystem')).toBe('enabled');
		expect(store.inviteSystem).toBe(true);

		store.inviteSystem = false;
		expect(localStorage.getItem('_inviteSystem')).toBe('disabled');
		expect(store.inviteSystem).toBe(false);
	});

	it('stores the token and removes it with null', () => {
		store.token = 'jwt';
		expect(store.token).toBe('jwt');
		store.token = null;
		expect(store.token).toBeNull();
	});

	it('reads the delivery type as a number (0 = delivery by default)', () => {
		expect(store.deliveryType).toBe(0);
		store.deliveryType = 1;
		expect(localStorage.getItem('deliveryType')).toBe('1');
		expect(store.deliveryType).toBe(1);
	});

	it('keeps the product view settings', () => {
		store.productListViewSpace = 'wide';
		store.productListViewType = 'grid';
		store.productViewType = 'carousel';
		store.buyProduct = 'wp1';
		store.mechantId = 'w1';
		store.registrationSystem = 'once';
		store.serverConnection = '0';

		expect(store.productListViewSpace).toBe('wide');
		expect(store.productListViewType).toBe('grid');
		expect(store.productViewType).toBe('carousel');
		expect(store.buyProduct).toBe('wp1');
		expect(store.mechantId).toBe('w1');
		expect(store.registrationSystem).toBe('once');
		expect(store.serverConnection).toBe('0');
	});

	it('clears the maintenance mode and everything else', () => {
		localStorage.setItem('maintenanceMode', 'shop-web');
		expect(store.maintenanceMode).toBe('shop-web');

		store.clearMaintenanceMode();
		expect(store.maintenanceMode).toBeNull();

		store.userId = 'u1';
		store.clear();
		expect(store.userId).toBeNull();
	});

	describe('isLogged', () => {
		beforeEach(() => {
			vi.spyOn(console, 'warn').mockImplementation(() => {});
		});

		afterEach(() => vi.restoreAllMocks());

		it('is false without a user id', async () => {
			expect(await store.isLogged()).toBe(false);
			expect(userRouter.get).not.toHaveBeenCalled();
		});

		it('is true when the API knows the user', async () => {
			store.userId = 'u1';
			userRouter.get.mockReturnValue(of({ id: 'u1' }));

			expect(await store.isLogged()).toBe(true);
			expect(userRouter.get).toHaveBeenCalledWith('u1');
		});

		it('forgets a user the API does not know', async () => {
			store.userId = 'gone';
			userRouter.get.mockReturnValue(throwError(() => new Error('404')));

			expect(await store.isLogged()).toBe(false);
			expect(store.userId).toBeNull();
		});
	});
});
