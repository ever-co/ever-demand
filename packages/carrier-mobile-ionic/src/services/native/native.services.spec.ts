import { TestBed } from '@angular/core/testing';
import { CurrentPositionService } from './current-position.service';
import { DeviceInfoService } from './device-info.service';
import { LocalNotificationService } from './local-notification.service';
import { NativeShellService } from './native-shell.service';
import { NetworkStatusService } from './network-status.service';
import {
	DEVICE,
	GEOLOCATION,
	IS_NATIVE_PLATFORM,
	LOCAL_NOTIFICATIONS,
	NETWORK,
	SPLASH_SCREEN,
	STATUS_BAR,
} from './plugins';

describe('Capacitor wrappers', () => {
	it('CurrentPositionService returns the coordinates of the Capacitor fix', async () => {
		const geolocation = {
			getCurrentPosition: vi.fn().mockResolvedValue({
				timestamp: 1,
				coords: { latitude: 42.6, longitude: 23.3, accuracy: 5 },
			}),
		};
		TestBed.configureTestingModule({
			providers: [{ provide: GEOLOCATION, useValue: geolocation }],
		});

		const position = await TestBed.inject(
			CurrentPositionService
		).getCurrentPosition();

		expect(position).toEqual({ coords: { latitude: 42.6, longitude: 23.3 } });
	});

	describe('LocalNotificationService', () => {
		function setup(display: string, afterRequest = display) {
			const plugin = {
				checkPermissions: vi.fn().mockResolvedValue({ display }),
				requestPermissions: vi
					.fn()
					.mockResolvedValue({ display: afterRequest }),
				schedule: vi.fn().mockResolvedValue({ notifications: [] }),
			};
			TestBed.configureTestingModule({
				providers: [{ provide: LOCAL_NOTIFICATIONS, useValue: plugin }],
			});
			return { plugin, service: TestBed.inject(LocalNotificationService) };
		}

		it('schedules the notification when allowed', async () => {
			const { plugin, service } = setup('granted');

			const shown = await service.schedule({
				id: 1,
				title: 'Attention',
				text: 'New order nearby you!',
			});

			expect(shown).toBe(true);
			expect(plugin.requestPermissions).not.toHaveBeenCalled();
			expect(plugin.schedule).toHaveBeenCalledWith({
				notifications: [
					{ id: 1, title: 'Attention', body: 'New order nearby you!' },
				],
			});
		});

		it('asks for the permission first and skips when it is denied', async () => {
			const { plugin, service } = setup('prompt', 'denied');

			expect(await service.schedule({ id: 1, title: 't', text: 'x' })).toBe(
				false
			);
			expect(plugin.requestPermissions).toHaveBeenCalled();
			expect(plugin.schedule).not.toHaveBeenCalled();
		});

		it('never throws when the plugin fails', async () => {
			const { plugin, service } = setup('granted');
			plugin.schedule.mockRejectedValue(new Error('not implemented'));
			vi.spyOn(console, 'warn').mockImplementation(() => undefined);

			expect(await service.schedule({ id: 1, title: 't', text: 'x' })).toBe(
				false
			);
		});
	});

	it('NetworkStatusService turns status changes into connect/disconnect events', async () => {
		let listener: (status: { connected: boolean }) => void;
		const remove = vi.fn();
		const network = {
			addListener: vi.fn((_event, cb) => {
				listener = cb;
				return Promise.resolve({ remove });
			}),
			getStatus: vi.fn(),
		};
		TestBed.configureTestingModule({
			providers: [{ provide: NETWORK, useValue: network }],
		});
		const service = TestBed.inject(NetworkStatusService);

		const events: string[] = [];
		const a = service.onDisconnect().subscribe(() => events.push('down'));
		const b = service.onConnect().subscribe(() => events.push('up'));

		listener({ connected: false });
		listener({ connected: true });
		a.unsubscribe();
		b.unsubscribe();
		await Promise.resolve();

		expect(events).toEqual(['down', 'up']);
		expect(network.addListener).toHaveBeenCalledTimes(1);
		expect(remove).toHaveBeenCalled();
	});

	it('DeviceInfoService reads platform, id and language from @capacitor/device', async () => {
		const device = {
			getInfo: vi.fn().mockResolvedValue({ platform: 'android' }),
			getId: vi.fn().mockResolvedValue({ identifier: 'uuid-1' }),
			getLanguageCode: vi.fn().mockResolvedValue({ value: 'bg' }),
		};
		TestBed.configureTestingModule({
			providers: [
				{ provide: DEVICE, useValue: device },
				{ provide: IS_NATIVE_PLATFORM, useValue: true },
			],
		});
		const service = TestBed.inject(DeviceInfoService);

		expect(service.isNative).toBe(true);
		expect(await service.getDetails()).toEqual({
			platform: 'android',
			uuid: 'uuid-1',
		});
		expect(await service.getPreferredLanguage()).toBe('bg');
	});

	it('NativeShellService only touches the status bar and splash screen in the native app', async () => {
		const statusBar = { setStyle: vi.fn().mockResolvedValue(undefined) };
		const splash = { hide: vi.fn().mockResolvedValue(undefined) };

		TestBed.configureTestingModule({
			providers: [
				{ provide: STATUS_BAR, useValue: statusBar },
				{ provide: SPLASH_SCREEN, useValue: splash },
				{ provide: IS_NATIVE_PLATFORM, useValue: false },
			],
		});
		await TestBed.inject(NativeShellService).ready();
		expect(statusBar.setStyle).not.toHaveBeenCalled();

		TestBed.resetTestingModule();
		TestBed.configureTestingModule({
			providers: [
				{ provide: STATUS_BAR, useValue: statusBar },
				{ provide: SPLASH_SCREEN, useValue: splash },
				{ provide: IS_NATIVE_PLATFORM, useValue: true },
			],
		});
		await TestBed.inject(NativeShellService).ready();
		expect(statusBar.setStyle).toHaveBeenCalledWith({ style: 'DARK' });
		expect(splash.hide).toHaveBeenCalled();
	});
});
