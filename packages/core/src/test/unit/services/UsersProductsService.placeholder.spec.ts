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
// The real observeFile reads the file with fs.readFile, so a value would
// arrive at a time the spec cannot know, and a slow disk could fail it. This
// one reads the same real file at once, so every placeholder arrives while
// device$.next() runs and the spec needs no timers.
jest.mock('../../../utils', () => {
	const { readFileSync } = jest.requireActual('fs');
	const { Observable } = jest.requireActual('rxjs');
	return {
		observeFile: (fileName: string) =>
			new Observable((observer: { next: (value: string) => void }) => {
				observer.next(readFileSync(fileName, 'utf-8'));
			}),
	};
});

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
	// Written out here, so the spec checks the translations themselves.
	'es-ES': 'No hay nada que comprar por ahora.',
	'fr-FR': 'Rien à acheter pour le moment.',
};

// The text a customer reads in a placeholder: the HTML without its style
// block and tags.
function textShown(html: string): string {
	return html
		.replace(/<style[\s\S]*?<\/style>/g, '')
		.replace(/<[^>]*>/g, '')
		.trim();
}

describe('UsersProductsService placeholder', () => {
	let device$: Subject<{ id: string; language?: string }>;
	let service: UsersProductsService;
	let placeholders: string[];
	let errors: unknown[];
	let subscription: Subscription | undefined;

	// Subscribes as the shop does, keeping every placeholder and error.
	function watchPlaceholder(): void {
		subscription = service.getPlaceholder('u1', 'd1').subscribe({
			next: (placeholder) => placeholders.push(placeholder),
			error: (error) => errors.push(error),
		});
	}

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
		errors = [];
	});

	afterEach(() => {
		subscription?.unsubscribe();
		subscription = undefined;
	});

	it("switches to the device's new language and skips a repeat of the same language", () => {
		subscription = service
			.getPlaceholder('u1', 'd1')
			.subscribe((placeholder) => placeholders.push(placeholder));

		device$.next({ id: 'd1', language: 'en-US' });
		expect(languagesShown()).toEqual(['en-US']);

		device$.next({ id: 'd1', language: 'he-IL' });
		expect(languagesShown()).toEqual(['en-US', 'he-IL']);

		const countBeforeRepeat = placeholders.length;
		device$.next({ id: 'd1', language: 'he-IL' });
		expect(placeholders).toHaveLength(countBeforeRepeat);
		expect(languagesShown()).toEqual(['en-US', 'he-IL']);
	});

	it.each(['es-ES', 'fr-FR'])(
		'shows the %s text to a device in that language',
		(language) => {
			watchPlaceholder();

			device$.next({ id: 'd1', language });

			expect(errors).toEqual([]);
			expect(placeholders.length).toBeGreaterThan(0);
			expect(placeholders.map(textShown)).toEqual(
				placeholders.map(() => texts[language])
			);
		}
	);

	it('shows the English text, not an empty div, to a device in a language with no text', () => {
		watchPlaceholder();

		device$.next({ id: 'd1', language: 'de-DE' });

		expect(errors).toEqual([]);
		expect(placeholders.length).toBeGreaterThan(0);
		expect(placeholders.map(textShown)).toEqual(
			placeholders.map(() => texts['en-US'])
		);
	});

	it('shows the English text to a device with no language', () => {
		watchPlaceholder();

		device$.next({ id: 'd1' });

		expect(errors).toEqual([]);
		expect(placeholders.length).toBeGreaterThan(0);
		expect(placeholders.map(textShown)).toEqual(
			placeholders.map(() => texts['en-US'])
		);
	});
});
