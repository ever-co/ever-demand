import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular/lazy';
import { Device } from '@ionic-native/device/ngx';
import { Network } from '@ionic-native/network/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { DeviceRouter } from '@modules/client.common.angular2/routers/device-router.service';
import { NEVER } from 'rxjs';
import { AppComponent } from './app.component';
import { Store } from './services/store.service';

describe('AppComponent', () => {
	let statusBarSpy;
	let splashScreenSpy;
	let platformReadySpy;
	let platformSpy;

	beforeEach(async () => {
		statusBarSpy = jasmine.createSpyObj('StatusBar', ['styleBlackOpaque']);
		splashScreenSpy = jasmine.createSpyObj('SplashScreen', ['hide']);
		platformReadySpy = Promise.resolve();
		platformSpy = jasmine.createSpyObj('Platform', {
			ready: platformReadySpy,
			is: false,
		});

		TestBed.configureTestingModule({
			declarations: [AppComponent],
			imports: [TranslateModule.forRoot()],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [
				{ provide: StatusBar, useValue: statusBarSpy },
				{ provide: SplashScreen, useValue: splashScreenSpy },
				{ provide: Platform, useValue: platformSpy },
				// A known device id, so the app does not register a new device.
				{ provide: Store, useValue: { deviceId: 'device-1' } },
				{
					provide: Router,
					useValue: jasmine.createSpyObj('Router', ['navigate']),
				},
				{
					provide: DeviceRouter,
					useValue: jasmine.createSpyObj('DeviceRouter', ['create']),
				},
				{
					provide: Location,
					useValue: jasmine.createSpyObj('Location', ['back']),
				},
				{
					provide: Network,
					useValue: jasmine.createSpyObj('Network', {
						onDisconnect: NEVER,
						onConnect: NEVER,
					}),
				},
				{ provide: Device, useValue: {} },
			],
		}).compileComponents();
	});

	it('should create the app', async () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.debugElement.componentInstance;
		expect(app).toBeTruthy();
	});

	it('should initialize the app', async () => {
		TestBed.createComponent(AppComponent);
		expect(platformSpy.ready).toHaveBeenCalled();
		await platformReadySpy;
		expect(statusBarSpy.styleBlackOpaque).toHaveBeenCalled();
		expect(splashScreenSpy.hide).toHaveBeenCalled();
	});
});
