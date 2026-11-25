import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular/lazy';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import { AppComponent } from './app.component';
import { Store } from './services/store.service';
import { NativeService } from './services/native/native.service';
import { createSpyObj } from 'app/testing/spies';
import { environment } from 'environments/environment';
import { translateTesting } from 'app/testing/translate';

// Lets every pending promise callback run.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('AppComponent', () => {
	let native;
	let platformReadySpy;
	let platformSpy;
	let store: { deviceId: string | null; language?: string };
	let deviceRouter;
	let router;
	let location;
	let networkListener: (status: {
		connected: boolean;
		connectionType: string;
	}) => Promise<void>;

	const createNative = (isNative: boolean) => {
		native = createSpyObj('NativeService', {
			isNative,
			platform: 'android',
			deviceId: Promise.resolve('device-uuid'),
			networkStatus: Promise.resolve({
				connected: true,
				connectionType: 'wifi',
			}),
			useDarkStatusBar: Promise.resolve(),
			hideSplashScreen: Promise.resolve(),
			onNetworkStatusChange: undefined,
		});
		native.onNetworkStatusChange.mockImplementation((listener) => {
			networkListener = listener;
			return Promise.resolve({ remove: () => Promise.resolve() });
		});
	};

	const configure = async () => {
		platformReadySpy = Promise.resolve();
		platformSpy = createSpyObj('Platform', {
			ready: platformReadySpy,
			is: false,
		});
		router = createSpyObj('Router', { navigate: Promise.resolve(true) });
		deviceRouter = createSpyObj('DeviceRouter', {
			create: Promise.resolve({ id: 'device-new' }),
		});
		location = createSpyObj('Location', ['back']);

		await TestBed.configureTestingModule({
			declarations: [AppComponent],
			imports: [...translateTesting()],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [
				{ provide: Platform, useValue: platformSpy },
				{ provide: Store, useValue: store },
				{ provide: Router, useValue: router },
				{ provide: DeviceRouter, useValue: deviceRouter },
				{ provide: Location, useValue: location },
				{ provide: NativeService, useValue: native },
			],
		}).compileComponents();
	};

	beforeEach(() => {
		// A known device id, so the app does not register a new device.
		store = { deviceId: 'device-1', language: 'en-US' };
		createNative(false);
	});

	it('should create the app', async () => {
		await configure();
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.debugElement.componentInstance;
		expect(app).toBeTruthy();
	});

	it('should initialize the app', async () => {
		createNative(true);
		await configure();

		TestBed.createComponent(AppComponent);
		expect(platformSpy.ready).toHaveBeenCalled();
		await platformReadySpy;
		await settle();

		// Was StatusBar.styleBlackOpaque() and SplashScreen.hide() (Cordova).
		expect(native.useDarkStatusBar).toHaveBeenCalled();
		expect(native.hideSplashScreen).toHaveBeenCalled();
	});

	it('leaves the status bar and the splash screen alone in a browser', async () => {
		await configure();

		TestBed.createComponent(AppComponent);
		await settle();

		expect(native.useDarkStatusBar).not.toHaveBeenCalled();
		expect(native.hideSplashScreen).not.toHaveBeenCalled();
	});

	it('registers the browser as a device with the fake uuid when it has no device id yet', async () => {
		store.deviceId = null;
		await configure();

		TestBed.createComponent(AppComponent);
		await settle();

		expect(deviceRouter.create).toHaveBeenCalledExactlyOnceWith({
			channelId: null,
			language: 'en-US',
			type: 'browser',
			uuid: environment.FAKE_UUID,
		});
		expect(store.deviceId).toBe('device-new');
	});

	it('registers a phone with its platform and device id', async () => {
		store.deviceId = null;
		createNative(true);
		await configure();

		TestBed.createComponent(AppComponent);
		await settle();

		expect(deviceRouter.create).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'android', uuid: 'device-uuid' }),
		);
	});

	it('shows the connection lost page when the network drops and goes back when it returns', async () => {
		await configure();

		TestBed.createComponent(AppComponent);
		await settle();

		await networkListener({ connected: false, connectionType: 'none' });
		expect(router.navigate).toHaveBeenCalledWith([
			'errors',
			'connection-lost',
		]);

		await networkListener({ connected: true, connectionType: 'wifi' });
		expect(location.back).toHaveBeenCalledTimes(1);

		// The same status again changes nothing.
		await networkListener({ connected: true, connectionType: 'wifi' });
		expect(location.back).toHaveBeenCalledTimes(1);
	});
});
