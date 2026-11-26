import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { Store } from './store.service';
import { NativeService } from './native/native.service';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

// Lets every pending promise callback run.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Store', () => {
	let store: Store;
	let userRouter;
	let native;

	const create = async () => {
		await TestBed.configureTestingModule({
			imports: [...translateTesting()],
			providers: [
				{ provide: Platform, useValue: { is: () => false } },
				{ provide: InviteRouter, useValue: {} },
				{ provide: UserRouter, useValue: userRouter },
				{ provide: NativeService, useValue: native },
			],
		}).compileComponents();
		store = TestBed.inject(Store);
		await settle();
	};

	beforeEach(() => {
		userRouter = createSpyObj('UserRouter', ['get']);
		native = createSpyObj('NativeService', {
			isNative: false,
			languageCode: Promise.resolve('bg'),
		});
	});

	describe('localStorage keys', () => {
		beforeEach(create);

		// The keys are shared with the other shop apps' docs
		// (docs/latest-stack/shop-mobile-features.md, section 5): keep them.
		it.each([
			['token', 'token', 'jwt'],
			['userId', '_userId', 'user-1'],
			['deviceId', '_deviceId', 'device-1'],
			['orderId', '_orderId', 'order-1'],
			['inviteRequestId', '_inviteRequestId', 'request-1'],
			['orderWarehouseId', '_currOrderWarehouseId', 'warehouse-1'],
		] as const)(
			'keeps %s in "%s" and removes it when set to null',
			(property, key, value) => {
				(store as any)[property] = value;
				expect(localStorage.getItem(key)).toBe(value);
				expect((store as any)[property]).toBe(value);

				(store as any)[property] = null;
				expect(localStorage.getItem(key)).toBeNull();
				expect((store as any)[property]).toBeNull();
			},
		);

		it.each([
			['registrationSystem', '_registrationSystem', 'once'],
			['buyProduct', '_buyProduct', 'wp-1'],
			['backToDetails', '_backToDetails', 'product-1'],
			['warehouseId', '_warehouseId', 'warehouse-1'],
			['inviteAddress', 'inviteAddress', 'Sofia, Simeonovsko shose 104'],
			['serverConnection', 'serverConnection', '0'],
			['inStore', 'inStore', 'merchant-1'],
			['shoppingCartData', 'shoppingCartData', '{}'],
		] as const)('keeps %s in "%s"', (property, key, value) => {
			(store as any)[property] = value;
			expect(localStorage.getItem(key)).toBe(value);
			expect((store as any)[property]).toBe(value);
		});

		it('stores the invite system as enabled / disabled', () => {
			expect(store.inviteSystem).toBe(false);

			store.inviteSystem = true;
			expect(localStorage.getItem('_inviteSystem')).toBe('enabled');
			expect(store.inviteSystem).toBe(true);

			store.inviteSystem = false;
			expect(localStorage.getItem('_inviteSystem')).toBe('disabled');
			expect(store.inviteSystem).toBe(false);
		});

		it('stores the delivery type as a number', () => {
			store.deliveryType = DeliveryType.Takeaway;
			expect(localStorage.getItem('deliveryType')).toBe('1');
			expect(store.deliveryType).toBe(DeliveryType.Takeaway);
		});

		it('stores the order start date and end time as JSON', () => {
			store.startOrderDate = 'Wed Nov 25 2026';
			expect(store.startOrderDate).toBe('"Wed Nov 25 2026"');

			store.endOrderTime = '05 : 10';
			expect(localStorage.getItem('endTime')).toBe('"05 : 10"');
		});

		it('reads the maintenance mode and clears it and the store mode', () => {
			localStorage.setItem('maintenanceMode', 'api');
			store.inStore = 'merchant-1';
			expect(store.maintenanceMode).toBe('api');

			store.clearMaintenanceMode();
			store.clearInStore();

			expect(store.maintenanceMode).toBeNull();
			expect(store.inStore).toBeNull();
		});

		it('clears everything', () => {
			store.userId = 'user-1';
			store.orderId = 'order-1';
			store.clear();
			expect(localStorage.length).toBe(0);
		});
	});

	describe('card payments in flight', () => {
		beforeEach(create);

		it('tracks each order on its own, in memory only', () => {
			expect(store.isPaying('order-1')).toBe(false);

			store.startPaying('order-1');
			expect(store.isPaying('order-1')).toBe(true);
			expect(store.isPaying('order-2')).toBe(false);
			// Never in localStorage, so it cannot outlive the app
			expect(localStorage.length).toBe(0);

			store.stopPaying('order-1');
			expect(store.isPaying('order-1')).toBe(false);
		});
	});

	describe('isLogged', () => {
		beforeEach(create);

		it('is false without a user id', async () => {
			expect(await store.isLogged()).toBe(false);
			expect(userRouter.get).not.toHaveBeenCalled();
		});

		it('is true when the server knows the user', async () => {
			store.userId = 'user-1';
			userRouter.get.mockReturnValue(of({ id: 'user-1' }));

			expect(await store.isLogged()).toBe(true);
			expect(userRouter.get).toHaveBeenCalledWith('user-1');
		});

		it('forgets the user id when the server does not know it', async () => {
			store.userId = 'user-1';
			userRouter.get.mockReturnValue(
				throwError(() => new Error('not found')),
			);

			expect(await store.isLogged()).toBe(false);
			expect(store.userId).toBeNull();
		});
	});

	describe('language', () => {
		it('starts with the saved language', async () => {
			localStorage.setItem('_language', 'fr-FR');
			await create();

			expect(store.language).toBe('fr-FR');
		});

		it('starts with the browser language when none is saved', async () => {
			vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['ru-RU']);
			await create();

			expect(store.language).toBe('ru-RU');
		});

		it('falls back to English for a language the app does not ship', async () => {
			vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['de-DE']);
			await create();

			expect(store.language).toBe('en-US');
		});

		it('starts with the device language in the mobile app', async () => {
			native.isNative.mockReturnValue(true);
			await create();

			expect(native.languageCode).toHaveBeenCalled();
			expect(store.language).toBe('bg-BG');
		});

		it('saves and applies a chosen language', async () => {
			await create();
			const translate = TestBed.inject(TranslateService);

			store.language = 'he-IL';

			expect(localStorage.getItem('_language')).toBe('he-IL');
			expect(translate.getCurrentLang()).toBe('he-IL');
			expect(store.language).toBe('he-IL');
		});
	});
});
