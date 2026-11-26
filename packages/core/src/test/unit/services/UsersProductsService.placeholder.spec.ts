import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { Subject, Subscription } from 'rxjs';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the "no products" placeholder served by
// UsersProductsService is exercised, read from the real res/templates folder.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
	serialization: () => () => undefined,
}));
jest.mock('@pyro/db-server', () => ({ DBService: class {} }));
jest.mock('../../../services/devices/DevicesService', () => ({
	DevicesService: class {},
}));

import { UsersProductsService } from '../../../services/users/UsersProductsService';

const translations = JSON.parse(
	fs.readFileSync(
		path.resolve(
			__dirname,
			'../../../../res/templates/user_products_placeholder.json'
		),
		'utf-8'
	)
);

const texts: { [language: string]: string } = {
	'en-US': translations['en-US'].no_products_text,
	'he-IL': translations['he-IL'].no_products_text,
};

// The placeholder templates are read from disk, so values arrive a few
// milliseconds after the device does.
function waitFor(condition: () => boolean, timeoutMs = 1000): Promise<void> {
	return new Promise((resolve) => {
		const startedAt = Date.now();
		const check = () => {
			if (condition() || Date.now() - startedAt > timeoutMs) {
				resolve();
			} else {
				setTimeout(check, 10);
			}
		};
		check();
	});
}

function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('UsersProductsService placeholder', () => {
	let device$: Subject<{ id: string; language: string }>;
	let service: UsersProductsService;
	let placeholders: string[];
	let subscription: Subscription | undefined;

	// The language of each placeholder, with repeats of the same placeholder
	// in a row counted once: a language switch subscribes to the template
	// files again, and they are read again, so the same placeholder can
	// arrive more than once.
	function languagesShown(): string[] {
		return placeholders
			.map(
				(html) =>
					Object.keys(texts).find((language) =>
						html.includes(texts[language])
					) || 'unknown'
			)
			.filter((language, i, all) => i === 0 || language !== all[i - 1]);
	}

	beforeEach(() => {
		device$ = new Subject();
		const devicesService = { get: jest.fn(() => device$) };
		service = new UsersProductsService(devicesService as any);
		placeholders = [];
	});

	afterEach(() => {
		subscription?.unsubscribe();
		subscription = undefined;
	});

	it("switches to the device's new language and skips a repeat of the same language", async () => {
		subscription = service
			.getPlaceholder('u1', 'd1')
			.subscribe((placeholder) => placeholders.push(placeholder));

		device$.next({ id: 'd1', language: 'en-US' });
		await waitFor(() => placeholders.length > 0);
		expect(languagesShown()).toEqual(['en-US']);

		device$.next({ id: 'd1', language: 'he-IL' });
		await waitFor(() => languagesShown().length > 1);
		await wait(200);
		expect(languagesShown()).toEqual(['en-US', 'he-IL']);

		const countBeforeRepeat = placeholders.length;
		device$.next({ id: 'd1', language: 'he-IL' });
		await wait(200);
		expect(placeholders).toHaveLength(countBeforeRepeat);
		expect(languagesShown()).toEqual(['en-US', 'he-IL']);
	});
});
