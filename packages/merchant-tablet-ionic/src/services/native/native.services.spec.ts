import { TestBed } from '@angular/core/testing';
import { BarcodeScanService } from './barcode-scan.service';
import { ExternalAppsService } from './external-apps.service';
import { NativeShellService } from './native-shell.service';
import { PhotoService } from './photo.service';
import {
	APP_LAUNCHER,
	BARCODE_SCANNER,
	CAMERA,
	IS_NATIVE_PLATFORM,
	OPEN_EXTERNAL_URL,
	SCREEN_ORIENTATION,
	SPLASH_SCREEN,
	STATUS_BAR,
} from './plugins';

describe('Capacitor wrappers (merchant)', () => {
	describe('ExternalAppsService', () => {
		it('builds tel: and mailto: links', () => {
			expect(ExternalAppsService.telUrl('+359 (88) 123-45-67')).toBe(
				'tel:+359881234567'
			);
			expect(
				ExternalAppsService.mailtoUrl({
					to: 'customer@example.com',
					subject: 'Your order',
					body: 'On its way',
				})
			).toBe('mailto:customer@example.com?subject=Your%20order&body=On%20its%20way');
			expect(ExternalAppsService.mailtoUrl({ to: ['a@x.io', 'b@x.io'] })).toBe(
				'mailto:a@x.io,b@x.io'
			);
		});

		it('opens links in the browser on the web and through AppLauncher in the app', async () => {
			const opened: string[] = [];
			const launcher = { openUrl: vi.fn().mockResolvedValue({ completed: true }) };

			TestBed.configureTestingModule({
				providers: [
					{ provide: IS_NATIVE_PLATFORM, useValue: false },
					{ provide: APP_LAUNCHER, useValue: launcher },
					{ provide: OPEN_EXTERNAL_URL, useValue: (url: string) => opened.push(url) },
				],
			});
			await TestBed.inject(ExternalAppsService).call('0888 123');
			expect(opened).toEqual(['tel:0888123']);
			expect(launcher.openUrl).not.toHaveBeenCalled();

			TestBed.resetTestingModule();
			TestBed.configureTestingModule({
				providers: [
					{ provide: IS_NATIVE_PLATFORM, useValue: true },
					{ provide: APP_LAUNCHER, useValue: launcher },
					{ provide: OPEN_EXTERNAL_URL, useValue: (url: string) => opened.push(url) },
				],
			});
			await TestBed.inject(ExternalAppsService).email({ to: 'c@example.com' });
			expect(launcher.openUrl).toHaveBeenCalledWith({ url: 'mailto:c@example.com' });
		});
	});

	describe('BarcodeScanService', () => {
		function setup(scanner: Record<string, any>) {
			TestBed.configureTestingModule({
				providers: [{ provide: BARCODE_SCANNER, useValue: scanner }],
			});
			return TestBed.inject(BarcodeScanService);
		}

		it('returns the first barcode like the old plugin ({ text, cancelled })', async () => {
			const service = setup({
				isSupported: vi.fn().mockResolvedValue({ supported: true }),
				requestPermissions: vi.fn().mockResolvedValue({ camera: 'granted' }),
				scan: vi.fn().mockResolvedValue({
					barcodes: [{ rawValue: 'order-42', displayValue: 'order-42' }],
				}),
			});

			expect(await service.scan()).toEqual({ text: 'order-42', cancelled: false });
		});

		it('reports a cancelled scan', async () => {
			const service = setup({
				isSupported: vi.fn().mockResolvedValue({ supported: true }),
				requestPermissions: vi.fn().mockResolvedValue({ camera: 'granted' }),
				scan: vi.fn().mockRejectedValue(new Error('scan canceled')),
			});

			expect(await service.scan()).toEqual({ text: '', cancelled: true });
		});

		it('fails without a camera or permission', async () => {
			await expect(
				setup({ isSupported: vi.fn().mockResolvedValue({ supported: false }) }).scan()
			).rejects.toThrow('not supported');

			TestBed.resetTestingModule();
			await expect(
				setup({
					isSupported: vi.fn().mockResolvedValue({ supported: true }),
					requestPermissions: vi.fn().mockResolvedValue({ camera: 'denied' }),
				}).scan()
			).rejects.toThrow('permission');
		});
	});

	describe('PhotoService', () => {
		const pixel =
			'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

		it('turns a camera photo into a File for the uploader', async () => {
			const camera = {
				takePhoto: vi.fn().mockResolvedValue({ thumbnail: pixel, saved: false }),
			};
			TestBed.configureTestingModule({
				providers: [{ provide: CAMERA, useValue: camera }],
			});

			const file = await TestBed.inject(PhotoService).pick('camera');

			expect(camera.takePhoto).toHaveBeenCalledWith({
				quality: 50,
				correctOrientation: true,
			});
			expect(file).toBeInstanceOf(File);
			expect(file.name).toMatch(/^\d+\.jpg$/);
			expect(file.size).toBeGreaterThan(0);
		});

		it('picks from the gallery and returns null when cancelled', async () => {
			const camera = {
				chooseFromGallery: vi
					.fn()
					.mockResolvedValueOnce({ results: [] })
					.mockRejectedValueOnce(new Error('User cancelled photos app')),
			};
			TestBed.configureTestingModule({
				providers: [{ provide: CAMERA, useValue: camera }],
			});
			vi.spyOn(console, 'warn').mockImplementation(() => undefined);
			const service = TestBed.inject(PhotoService);

			expect(await service.pick('library')).toBeNull();
			expect(await service.pick('library')).toBeNull();
		});
	});

	it('NativeShellService locks the tablet to landscape inside the app only', async () => {
		const orientation = { lock: vi.fn().mockResolvedValue(undefined) };
		const statusBar = { setStyle: vi.fn().mockResolvedValue(undefined) };
		const splash = { hide: vi.fn().mockResolvedValue(undefined) };
		const providers = (isNative: boolean) => [
			{ provide: IS_NATIVE_PLATFORM, useValue: isNative },
			{ provide: SCREEN_ORIENTATION, useValue: orientation },
			{ provide: STATUS_BAR, useValue: statusBar },
			{ provide: SPLASH_SCREEN, useValue: splash },
		];

		TestBed.configureTestingModule({ providers: providers(false) });
		await TestBed.inject(NativeShellService).ready();
		expect(orientation.lock).not.toHaveBeenCalled();

		TestBed.resetTestingModule();
		TestBed.configureTestingModule({ providers: providers(true) });
		await TestBed.inject(NativeShellService).ready();
		expect(orientation.lock).toHaveBeenCalledWith({ orientation: 'landscape' });
		expect(statusBar.setStyle).toHaveBeenCalledWith({ style: 'DARK' });
		expect(splash.hide).toHaveBeenCalled();
	});
});
