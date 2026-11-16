import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { firstValueFrom, of } from 'rxjs';
import { take } from 'rxjs/operators';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the About / Help / Privacy / Terms templates served by
// UsersService are exercised, read from the real res/templates folder.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
	serialization: () => () => undefined,
}));
jest.mock('@pyro/db-server', () => ({ DBService: class {} }));
jest.mock('../../../env', () => ({
	env: { STRIPE_SECRET_KEY: 'test-stripe-key' },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/invites', () => ({ InvitesService: class {} }));
jest.mock('../../../services/devices', () => ({ DevicesService: class {} }));
jest.mock('../../../services/warehouses', () => ({
	WarehousesService: class {},
}));
jest.mock('stripe', () => ({ Stripe: jest.fn() }));

import { UsersService } from '../../../services/users/UsersService';

const templatesDir = path.resolve(__dirname, '../../../../res/templates');

function template(folder: string, language: string): string {
	return fs.readFileSync(
		path.join(templatesDir, folder, `${language}.hbs`),
		'utf-8'
	);
}

describe('UsersService info templates', () => {
	let devicesService: { get: jest.Mock };
	let service: UsersService;

	function withDevice(device: { language: string } | null) {
		devicesService.get.mockReturnValue(of(device));
	}

	beforeEach(() => {
		devicesService = { get: jest.fn() };
		service = new UsersService({} as any, devicesService as any, {} as any);
	});

	it('serves the English About Us page for es-ES, which has no template', async () => {
		withDevice({ language: 'es-ES' });

		const html = await firstValueFrom(
			service.getAboutUs('u1', 'd1', 'es-ES').pipe(take(1))
		);

		expect(html).toBe(template('about_us', 'en-US'));
	});

	it('serves the English Help page for fr-FR, which has no template', async () => {
		withDevice({ language: 'fr-FR' });

		const html = await firstValueFrom(
			service.getHelp('u1', 'd1', 'fr-FR').pipe(take(1))
		);

		expect(typeof html).toBe('string');
		expect(html.length).toBeGreaterThan(0);
		expect(html).toBe(template('help', 'en-US'));
	});

	it('still serves a language that has its own template', async () => {
		withDevice({ language: 'he-IL' });

		const html = await firstValueFrom(
			service.getPrivacy('u1', 'd1', 'he-IL').pipe(take(1))
		);

		expect(html).toBe(template('privacy', 'he-IL'));
		expect(html).not.toBe(template('privacy', 'en-US'));
	});

	it('fails getAboutUs with a clear error when the device does not exist', async () => {
		withDevice(null);

		await expect(
			firstValueFrom(
				service.getAboutUs('u1', 'd1', 'en-US').pipe(take(1))
			)
		).rejects.toThrow(/doesn't exist/);
	});
});
