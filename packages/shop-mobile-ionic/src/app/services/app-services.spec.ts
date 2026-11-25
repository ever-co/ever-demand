import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';
import { ProductLocalesService } from './product-locales.service';
import { ProductsService } from './products.service';
import { ServerSettings } from './server-settings';
import { WarehouseProductsService } from './merchants/warehouse-products';
import { Store } from './store.service';
import { callNumber } from './native/phone';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('ProductLocalesService', () => {
	let service: ProductLocalesService;
	let translate: TranslateService;

	const title = [
		{ locale: 'en-US', value: 'Pizza' },
		{ locale: 'bg-BG', value: 'Пица' },
	];

	beforeEach(() => {
		TestBed.configureTestingModule({ imports: [...translateTesting()] });
		service = TestBed.inject(ProductLocalesService);
		translate = TestBed.inject(TranslateService);
	});

	it('picks the text in the current language', () => {
		translate.use('bg-BG');
		expect(service.getTranslate(title)).toBe('Пица');
	});

	it('falls back to the default language, then to the first text', () => {
		translate.use('fr-FR');
		expect(service.getTranslate(title)).toBe('Pizza');
		expect(service.getTranslate([{ locale: 'he-IL', value: 'פיצה' }])).toBe(
			'פיצה'
		);
	});

	it('reads, sets and assigns a member in the current locale', () => {
		service.currentLocale = 'bg-BG';
		expect(service.getMemberValue(title)).toBe('Пица');

		service.currentLocale = 'ru-RU';
		// Default locale (en-US) when the current one has no text
		expect(service.getMemberValue(title)).toBe('Pizza');
		expect(service.getMemberValue([])).toBe('');

		service.setMemberValue('title', 'Пицца');
		const members = [...title];
		service.assignPropertyValue(members, 'title');
		expect(members).toContainEqual({ locale: 'ru-RU', value: 'Пицца' });
		expect(service.isServiceStateValid).toBe(false);

		service.setMemberValue('description', 'Горячая');
		expect(service.isServiceStateValid).toBe(true);
	});
});

describe('ProductsService', () => {
	let service: ProductsService;
	let warehouseProducts;
	let router;

	const product = () =>
		({
			warehouseId: 'warehouse-1',
			warehouseProduct: { id: 'wp-1', product: { id: 'product-1' } },
		}) as any;

	beforeEach(() => {
		warehouseProducts = createSpyObj('WarehouseProductsService', [
			'getWarehouseProduct',
		]);
		router = createSpyObj('Router', ['navigate']);
		TestBed.configureTestingModule({
			providers: [
				ProductsService,
				{ provide: WarehouseProductsService, useValue: warehouseProducts },
				{ provide: Router, useValue: router },
			],
		});
		service = TestBed.inject(ProductsService);
	});

	it('opens the details of a product that is still sold', async () => {
		warehouseProducts.getWarehouseProduct.mockResolvedValue({ id: 'wp-1' });

		await service.goToDetailsPage(product());

		expect(warehouseProducts.getWarehouseProduct).toHaveBeenCalledWith(
			'warehouse-1',
			'wp-1'
		);
		expect(router.navigate).toHaveBeenCalledWith(
			['/products/product-details/product-1'],
			{
				queryParams: {
					backUrl: '/products',
					warehouseId: 'warehouse-1',
				},
			}
		);
	});

	it('marks a product that is gone as sold out instead', async () => {
		warehouseProducts.getWarehouseProduct.mockResolvedValue(null);
		const shown = [product()];

		await service.goToDetailsPage(product(), shown);

		expect(router.navigate).not.toHaveBeenCalled();
		expect(shown[0].soldOut).toBe(true);
	});
});

describe('ServerSettings', () => {
	let settings: ServerSettings;
	let store;
	let inviteRouter;
	let userAuthRouter;

	beforeEach(() => {
		// A running API answers the start-up check with 404 (see
		// ServerConnectionService); "0" means unreachable.
		store = { maintenanceMode: null, serverConnection: '404' };
		inviteRouter = createSpyObj('InviteRouter', {
			getInvitesSettings: Promise.resolve({ isEnabled: true }),
		});
		userAuthRouter = createSpyObj('UserAuthRouter', {
			getRegistrationsSettings: Promise.resolve({
				registrationRequiredOnStart: false,
			}),
		});
		TestBed.configureTestingModule({
			providers: [
				{ provide: Store, useValue: store },
				{ provide: InviteRouter, useValue: inviteRouter },
				{ provide: UserAuthRouter, useValue: userAuthRouter },
			],
		});
		settings = TestBed.inject(ServerSettings);
	});

	it('saves the invite and registration settings of the server', async () => {
		await settings.load();

		expect(store.inviteSystem).toBe(true);
		expect(store.registrationSystem).toBe(RegistrationSystem.Disabled);
	});

	it('maps a required registration to "enabled"', async () => {
		userAuthRouter.getRegistrationsSettings.mockResolvedValue({
			registrationRequiredOnStart: true,
		});

		await settings.load();

		expect(store.registrationSystem).toBe(RegistrationSystem.Enabled);
	});

	it('asks nothing while the server is down or in maintenance', async () => {
		store.serverConnection = '0';
		await settings.load();

		store.serverConnection = '404';
		store.maintenanceMode = 'api';
		await settings.load();

		expect(inviteRouter.getInvitesSettings).not.toHaveBeenCalled();
		expect(userAuthRouter.getRegistrationsSettings).not.toHaveBeenCalled();
	});
});

describe('callNumber (replaces Cordova CallNumber)', () => {
	it('opens a tel: link with the number', () => {
		const link = { href: '', rel: '', click: vi.fn() };
		const doc = { createElement: vi.fn().mockReturnValue(link) } as any;

		callNumber(' +359 888 888-888 ', doc);

		expect(doc.createElement).toHaveBeenCalledWith('a');
		expect(link.href).toBe('tel:+359888888888');
		expect(link.click).toHaveBeenCalledTimes(1);
	});

	it('throws without a number, so the caller can tell the customer', () => {
		expect(() => callNumber('')).toThrow('No phone number to call');
		expect(() => callNumber(undefined)).toThrow();
	});
});
