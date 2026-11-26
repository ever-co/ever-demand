import { vi, type Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
	LOAD_STRIPE,
	STRIPE_PUBLISHABLE_KEY,
	StripeLoader,
} from './stripeLoader';

interface Deferred<T> {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (reason?: any) => void;
}

function deferred<T>(): Deferred<T> {
	let resolve: (value: T) => void;
	let reject: (reason?: any) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

// Lets every pending promise callback run.
function settle(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

const KEY = 'pk_test_loader_spec';

// The loader loads Stripe.js, the card form behind Pay now. A customer can
// start the shop without network, so the first attempt may fail; Pay now
// then asks to try again (#1663).
describe('StripeLoader', () => {
	beforeEach(() => {
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
	});

	describe('with a stubbed loadStripe', () => {
		// Every attempt, in order
		let attempts: Deferred<any>[];
		let loadStripe: Mock;

		const configure = (key: string) => {
			TestBed.configureTestingModule({
				providers: [
					{ provide: LOAD_STRIPE, useValue: loadStripe },
					{ provide: STRIPE_PUBLISHABLE_KEY, useValue: key },
				],
			});
		};

		const fakeStripe = () => ({ elements: vi.fn() } as any);

		beforeEach(() => {
			attempts = [];
			loadStripe = vi.fn().mockImplementation(() => {
				const attempt = deferred<any>();
				attempts.push(attempt);
				return attempt.promise;
			});
		});

		it('is one instance for the app and loads Stripe.js once, for the app key', () => {
			configure(KEY);
			const loader = TestBed.inject(StripeLoader);

			expect(TestBed.inject(StripeLoader)).toBe(loader);
			expect(loadStripe).toHaveBeenCalledExactlyOnceWith(KEY);
		});

		// scripts/env.ts defaults the key to '': such a build cannot take
		// card payments, so it never fetches Stripe.js (T-2806).
		it('does not load Stripe.js in a build without a publishable key', () => {
			configure('');
			const loader = TestBed.inject(StripeLoader);

			loader.ensureLoaded();

			expect(loadStripe).not.toHaveBeenCalled();
			expect(loader.stripe).toBeNull();
		});

		it('has no Stripe while Stripe.js loads, and the instance once it loaded', async () => {
			configure(KEY);
			const loader = TestBed.inject(StripeLoader);

			expect(loader.stripe).toBeNull();

			const stripe = fakeStripe();
			attempts[0].resolve(stripe);
			await settle();

			expect(loader.stripe).toBe(stripe);
		});

		it('does not load again while Stripe.js loads or after it loaded', async () => {
			configure(KEY);
			const loader = TestBed.inject(StripeLoader);

			loader.ensureLoaded();
			loader.ensureLoaded();
			expect(loadStripe).toHaveBeenCalledTimes(1);

			attempts[0].resolve(fakeStripe());
			await settle();
			loader.ensureLoaded();

			expect(loadStripe).toHaveBeenCalledTimes(1);
		});

		it('loads Stripe.js again after it failed to load', async () => {
			configure(KEY);
			const loader = TestBed.inject(StripeLoader);

			// No network when the shop started
			attempts[0].reject(new Error('Failed to load Stripe.js'));
			await settle();

			expect(loader.stripe).toBeNull();
			expect(console.warn).toHaveBeenCalledWith(
				expect.any(String),
				expect.any(Error)
			);

			// The network is back and the customer taps Pay now
			loader.ensureLoaded();

			expect(loadStripe).toHaveBeenCalledTimes(2);
			expect(loadStripe).toHaveBeenLastCalledWith(KEY);

			const stripe = fakeStripe();
			attempts[1].resolve(stripe);
			await settle();

			expect(loader.stripe).toBe(stripe);
		});

		it('loads again when loadStripe gave no Stripe', async () => {
			configure(KEY);
			const loader = TestBed.inject(StripeLoader);

			attempts[0].resolve(null);
			await settle();

			expect(loader.stripe).toBeNull();

			loader.ensureLoaded();

			expect(loadStripe).toHaveBeenCalledTimes(2);
		});

		it('loads again when loadStripe threw', async () => {
			loadStripe.mockImplementationOnce(() => {
				throw new Error('Expected publishable key to be of type string');
			});
			configure(KEY);
			const loader = TestBed.inject(StripeLoader);
			await settle();

			loader.ensureLoaded();

			expect(loadStripe).toHaveBeenCalledTimes(2);
		});

		it('tries again on every tap while Stripe.js keeps failing', async () => {
			configure(KEY);
			const loader = TestBed.inject(StripeLoader);

			for (let attempt = 1; attempt <= 3; attempt++) {
				attempts[attempts.length - 1].reject(new Error('offline'));
				await settle();
				loader.ensureLoaded();
			}

			expect(loadStripe).toHaveBeenCalledTimes(4);
			expect(loader.stripe).toBeNull();
		});
	});

	// The real @stripe/stripe-js loader. jsdom loads no subresources here,
	// so no script reaches js.stripe.com: the specs fire each script tag's
	// load or error event themselves, as a browser would. loadStripe keeps
	// its state for the whole file, so these specs run in this order and
	// only the last two load Stripe.js.
	describe('with the @stripe/stripe-js loader', () => {
		let appendChild: Mock;
		let originalStripe: any;

		const stripeScripts = (): HTMLScriptElement[] =>
			Array.from(
				document.querySelectorAll<HTMLScriptElement>(
					'script[src^="https://js.stripe.com/"]'
				)
			);

		// The script tag the loader added last
		const lastAdded = (): HTMLScriptElement =>
			appendChild.mock.calls[appendChild.mock.calls.length - 1][0];

		const instance = { elements: vi.fn() };
		// What Stripe.js defines as it runs, before its load event fires
		const StripeJs: any = vi.fn(() => instance);
		StripeJs.version = 'endive';

		beforeEach(() => {
			TestBed.configureTestingModule({
				providers: [{ provide: STRIPE_PUBLISHABLE_KEY, useValue: KEY }],
			});
			// Passes the tag on to the head: loadStripe looks it up there
			appendChild = vi.spyOn(document.head, 'appendChild') as any;
			originalStripe = (window as any).Stripe;
			delete (window as any).Stripe;
		});

		afterEach(() => {
			(window as any).Stripe = originalStripe;
			stripeScripts().forEach((script) => script.remove());
		});

		it('adds one Stripe.js script tag, and reports a failure after loadStripe tried twice', async () => {
			const loader = TestBed.inject(StripeLoader);

			expect(stripeScripts().length).toBe(1);
			expect(lastAdded().src).toMatch(
				/^https:\/\/js\.stripe\.com\/[a-z0-9]+\/stripe\.js/
			);

			// No network: loadStripe adds the script again once by itself
			lastAdded().dispatchEvent(new Event('error'));
			await settle();

			expect(appendChild).toHaveBeenCalledTimes(2);
			expect(stripeScripts().length).toBe(1);
			expect(loader.stripe).toBeNull();
			expect(console.warn).not.toHaveBeenCalled();

			lastAdded().dispatchEvent(new Event('error'));
			await settle();

			expect(loader.stripe).toBeNull();
			expect(console.warn).toHaveBeenCalledTimes(1);
			expect(stripeScripts().length).toBe(1);
		});

		// A page from an intercepting proxy also fires load, but defines no
		// Stripe: every tap would show the message until the app restarts.
		it('counts a script that loaded without defining Stripe as failed', async () => {
			const loader = TestBed.inject(StripeLoader);

			lastAdded().dispatchEvent(new Event('load'));
			await settle();
			lastAdded().dispatchEvent(new Event('load'));
			await settle();

			expect(loader.stripe).toBeNull();
			expect(console.warn).toHaveBeenCalledTimes(1);
		});

		it('adds the script again on the next tap after it failed, and keeps one script tag', async () => {
			const loader = TestBed.inject(StripeLoader);
			lastAdded().dispatchEvent(new Event('error'));
			await settle();
			lastAdded().dispatchEvent(new Event('error'));
			await settle();
			const failed = lastAdded();

			// The network is back and the customer taps Pay now
			loader.ensureLoaded();

			expect(lastAdded()).not.toBe(failed);
			expect(stripeScripts()).toEqual([lastAdded()]);

			(window as any).Stripe = StripeJs;
			lastAdded().dispatchEvent(new Event('load'));
			await settle();

			expect(StripeJs).toHaveBeenCalledExactlyOnceWith(KEY);
			expect(loader.stripe).toBe(instance);
		});

		it('reuses the loaded Stripe.js without another script tag', async () => {
			appendChild.mockClear();
			StripeJs.mockClear();

			const loader = TestBed.inject(StripeLoader);
			await settle();

			expect(appendChild).not.toHaveBeenCalled();
			expect(loader.stripe).toBe(instance);
		});
	});
});
