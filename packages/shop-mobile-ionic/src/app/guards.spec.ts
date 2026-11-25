import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { PagesModuleGuard } from './pages/pages.module.guard';
import { MaintenanceModuleGuard } from './maintenance-info/maintenance-info.module.guard';
import { InviteModuleGuard } from './pages/+invite/invite.module.guard';
import { ByCodeModuleGuard } from './pages/+invite/+by-code/by-code.module.guard';
import { ByLocationModuleGuard } from './pages/+invite/+by-location/by-location.module.guard';
import { ProductsModuleGuard } from './pages/+products/products.module.guard';
import { ProductsPageGuard } from './pages/+products/products.page.guard';
import { OrderModuleGuard } from './pages/+products/+order/order.module.guard';
import { OrderInfoPageModuleGuard } from './pages/+products/+order/+order-info/order-info.module.guard';
import { OrderTakeawayInfoModuleGuard } from './pages/+products/+order/takeaway/+page/takeaway-page.module.guard';
import { OrdersHistoryModuleGuard } from './pages/+orders-history/orders-history.module.guard';
import { MerchantsPageModuleGuard } from './pages/+merchants/merchants.module.guard';
import { InfoModuleGuard } from './pages/+info/info.module.guard';
import { createSpyObj } from 'app/testing/spies';

// The route guards decide the first-run flow (docs/latest-stack/shop-mobile-features.md 3.2).
describe('route guards', () => {
	let router;
	let store: any;

	beforeEach(() => {
		router = createSpyObj('Router', ['navigate']);
		store = {
			isLogged: () => Promise.resolve(false),
			userId: null,
			orderId: null,
			maintenanceMode: null,
			serverConnection: null,
			registrationSystem: RegistrationSystem.Enabled,
			inviteSystem: true,
			inviteRequestId: null,
			deliveryType: DeliveryType.Delivery,
		};
	});

	describe('PagesModuleGuard', () => {
		const guard = () =>
			new PagesModuleGuard(router, store).canActivate(null, null);

		it('lets the pages load when the server is up', () => {
			// (quirk) The start-up check stores the HTTP status of a failed
			// GET on the API root (404 on a running API); a missing key reads
			// as 0, so it counts as "down" too.
			store.serverConnection = '404';
			expect(guard()).toBe(true);
		});

		it('sends to the maintenance page during maintenance', () => {
			store.maintenanceMode = 'api';
			expect(guard()).toBe(false);
			expect(router.navigate).toHaveBeenCalledWith(['maintenance-info']);
		});

		it('sends to the server-down page when the server is unreachable', () => {
			store.serverConnection = '0';
			expect(guard()).toBe(false);
			expect(router.navigate).toHaveBeenCalledWith(['server-down']);
		});
	});

	describe('MaintenanceModuleGuard', () => {
		it('leaves the maintenance page once maintenance is over', () => {
			const guard = new MaintenanceModuleGuard(router, store);
			expect(guard.canActivate(null, null)).toBe(false);
			expect(router.navigate).toHaveBeenCalledWith(['']);

			store.maintenanceMode = 'shop-mobile';
			expect(guard.canActivate(null, null)).toBe(true);
		});
	});

	describe('InviteModuleGuard', () => {
		it('shows the invite pages to a new customer', () => {
			expect(new InviteModuleGuard(store, router).canLoad(null)).toBe(
				true,
			);
		});

		it.each([
			['a registered customer', { userId: 'user-1' }],
			[
				'a server without registration',
				{ registrationSystem: RegistrationSystem.Disabled },
			],
		])('sends %s to the products', (_, change) => {
			Object.assign(store, change);
			expect(new InviteModuleGuard(store, router).canLoad(null)).toBe(
				false,
			);
			expect(router.navigate).toHaveBeenCalledWith(['products']);
		});
	});

	describe('ByCodeModuleGuard / ByLocationModuleGuard', () => {
		it('starts with the invite code when invites are on', async () => {
			expect(
				await new ByCodeModuleGuard(store, router).canLoad(null),
			).toBe(true);
			expect(
				await new ByLocationModuleGuard(store, router).canLoad(null),
			).toBe(true);
		});

		it('asks for the address when invites are off', async () => {
			store.inviteSystem = false;
			expect(
				await new ByCodeModuleGuard(store, router).canLoad(null),
			).toBe(false);
			expect(router.navigate).toHaveBeenCalledWith([
				'invite/by-location',
			]);
		});

		it('waits for the code once an invite was requested', async () => {
			store.inviteRequestId = 'request-1';
			expect(
				await new ByLocationModuleGuard(store, router).canLoad(null),
			).toBe(false);
			expect(router.navigate).toHaveBeenCalledWith(['invite/by-code']);
		});
	});

	describe.each([
		['ProductsModuleGuard', ProductsModuleGuard],
		['MerchantsPageModuleGuard', MerchantsPageModuleGuard],
		['InfoModuleGuard', InfoModuleGuard],
	])('%s', (_, Guard: any) => {
		it('sends a customer who is not registered to the invite when registration is required', async () => {
			expect(await new Guard(store, router).canLoad(null)).toBe(false);
			expect(router.navigate).toHaveBeenCalledWith(['invite']);
		});

		it('lets anyone browse when registration is not required', async () => {
			store.registrationSystem = RegistrationSystem.Disabled;
			expect(await new Guard(store, router).canLoad(null)).toBe(true);
		});

		it('lets a registered customer in', async () => {
			store.isLogged = () => Promise.resolve(true);
			expect(await new Guard(store, router).canLoad(null)).toBe(true);
		});
	});

	describe('OrdersHistoryModuleGuard', () => {
		it('needs a registered customer, whatever the registration setting', async () => {
			store.registrationSystem = RegistrationSystem.Disabled;
			expect(
				await new OrdersHistoryModuleGuard(store, router).canLoad(null),
			).toBe(false);
			expect(router.navigate).toHaveBeenCalledWith(['invite']);

			store.isLogged = () => Promise.resolve(true);
			expect(
				await new OrdersHistoryModuleGuard(store, router).canLoad(null),
			).toBe(true);
		});
	});

	describe('order tracking pages', () => {
		beforeEach(() => {
			store.isLogged = () => Promise.resolve(true);
		});

		it('sends a takeaway order from the delivery page to the takeaway page', async () => {
			store.deliveryType = DeliveryType.Takeaway;
			expect(
				await new OrderInfoPageModuleGuard(store, router).canLoad(null),
			).toBe(false);
			expect(router.navigate).toHaveBeenCalledWith([
				'order-info-takeaway',
			]);
		});

		it('sends a delivery order from the takeaway page to the delivery page', async () => {
			expect(
				await new OrderTakeawayInfoModuleGuard(store, router).canLoad(
					null,
				),
			).toBe(false);
			expect(router.navigate).toHaveBeenCalledWith(['order-info']);
		});

		it('shows each page for its own delivery type', async () => {
			expect(
				await new OrderInfoPageModuleGuard(store, router).canLoad(null),
			).toBe(true);
			store.deliveryType = DeliveryType.Takeaway;
			expect(
				await new OrderTakeawayInfoModuleGuard(store, router).canLoad(
					null,
				),
			).toBe(true);
		});

		it('sends a customer who is not registered to the invite', async () => {
			store.isLogged = () => Promise.resolve(false);
			expect(
				await new OrderInfoPageModuleGuard(store, router).canLoad(null),
			).toBe(false);
			expect(router.navigate).toHaveBeenCalledWith(['invite']);
		});
	});

	describe('ProductsPageGuard and OrderModuleGuard', () => {
		it('opens the open order over the products', () => {
			store.orderId = 'order-1';
			const guard = new ProductsPageGuard(store, router);

			expect(guard.canActivate(null, { url: '/products' } as any)).toBe(
				true,
			);
			expect(router.navigate).toHaveBeenCalledWith(['products', 'order']);
		});

		it('leaves the products alone without an open order', () => {
			new ProductsPageGuard(store, router).canActivate(null, {
				url: '/products',
			} as any);
			expect(router.navigate).not.toHaveBeenCalled();
		});

		it('goes back to the products when the order page has no order', () => {
			new OrderModuleGuard(store, router).canLoad(null);
			expect(router.navigate).toHaveBeenCalledWith(['products']);
		});
	});
});
