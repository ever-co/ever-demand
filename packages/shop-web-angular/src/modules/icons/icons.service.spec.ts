import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { IconAlreadyRegisteredError } from './icon-already-registered.error';
import { IconsService } from './icons.service';

describe('IconsService', () => {
	let service: IconsService;
	const registry = { addSvgIconInNamespace: vi.fn() };

	beforeEach(() => {
		registry.addSvgIconInNamespace.mockClear();
		TestBed.configureTestingModule({
			providers: [
				IconsService,
				{ provide: MatIconRegistry, useValue: registry },
			],
		});
		service = TestBed.inject(IconsService);
	});

	it('registers an icon of assets/icon under the "ever" namespace once', () => {
		service.ensureRegistered('basket');
		service.ensureRegistered('basket');

		expect(registry.addSvgIconInNamespace).toHaveBeenCalledTimes(1);
		const [namespace, name, url] =
			registry.addSvgIconInNamespace.mock.calls[0];
		expect(namespace).toBe('ever');
		expect(name).toBe('basket');
		expect(String(url)).toContain('assets/icon/basket.svg');
		expect(service.isRegistered('basket')).toBe(true);
	});

	it('refuses to register the same icon twice', () => {
		service.register('history');

		expect(() => service.register('history')).toThrow(
			IconAlreadyRegisteredError
		);
	});
});
