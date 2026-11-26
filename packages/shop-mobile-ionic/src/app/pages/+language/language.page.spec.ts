import { vi } from 'vitest';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular/lazy';
import { translateTesting } from 'app/testing/translate';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import { Store } from '../../services/store.service';
import { settle } from '../../testing/fake-socket';
import { LanguagePage } from './language.page';
import { createSpyObj, type SpyObj } from 'app/testing/spies';

describe('LanguagePage', () => {
	let component: LanguagePage;
	let fixture: ComponentFixture<LanguagePage>;
	let store: { language: string; deviceId: string | null };
	let deviceRouter: SpyObj<DeviceRouter>;
	let location: SpyObj<Location>;
	let savedDir: string;
	let savedLang: string;

	beforeEach(async () => {
		store = { language: 'en-US', deviceId: 'device-1' };
		deviceRouter = createSpyObj('DeviceRouter', {
			updateLanguage: Promise.resolve({ id: 'device-1' }),
		});
		location = createSpyObj('Location', ['back']);

		await TestBed.configureTestingModule({
			declarations: [LanguagePage],
			imports: [...translateTesting()],
			providers: [
				{ provide: Store, useValue: store },
				{ provide: DeviceRouter, useValue: deviceRouter },
				{ provide: Location, useValue: location },
				{ provide: Platform, useValue: { isRTL: false } },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	// Jasmine restored spies after each spec; Vitest does not.
	afterEach(() => vi.restoreAllMocks());

	beforeEach(() => {
		// Picking a language sets the direction and language of the page.
		savedDir = document.documentElement.dir;
		savedLang = document.documentElement.lang;

		fixture = TestBed.createComponent(LanguagePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	afterEach(() => {
		document.documentElement.dir = savedDir;
		document.documentElement.lang = savedLang;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('when the customer picks a language', () => {
		it('saves it on the server device', async () => {
			component.language = 'he-IL';
			await settle();

			expect(deviceRouter.updateLanguage).toHaveBeenCalledExactlyOnceWith(
				'device-1',
				'he-IL'
			);
			expect(store.language).toBe('he-IL');
			expect(location.back).toHaveBeenCalledTimes(1);
		});

		it('does not call the server when there is no device id', async () => {
			store.deviceId = null;

			component.language = 'he-IL';
			await settle();

			expect(deviceRouter.updateLanguage).not.toHaveBeenCalled();
			expect(store.language).toBe('he-IL');
			expect(location.back).toHaveBeenCalledTimes(1);
		});

		it('still switches and goes back when the server rejects the language', async () => {
			const rejection = new Error('Device does not exist');
			deviceRouter.updateLanguage.mockRejectedValue(rejection);
			vi.spyOn(console, 'error');

			component.language = 'he-IL';
			await settle();

			expect(deviceRouter.updateLanguage).toHaveBeenCalledExactlyOnceWith(
				'device-1',
				'he-IL'
			);
			expect(console.error).toHaveBeenCalledWith(
				expect.any(String),
				rejection
			);
			expect(store.language).toBe('he-IL');
			expect(document.documentElement.dir).toBe('rtl');
			expect(document.documentElement.lang).toBe('he');
			expect(location.back).toHaveBeenCalledTimes(1);
		});
	});
});
