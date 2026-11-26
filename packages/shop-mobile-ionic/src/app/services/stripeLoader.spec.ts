import { TestBed } from '@angular/core/testing';
import { StripeLoader, STRIPE_CHECKOUT_SCRIPT_URL } from './stripeLoader';

// The loader adds the Checkout script, the card form behind Pay now. A
// customer can start the shop without network, so the first attempt may
// fail; Pay now then asks to try again.
describe('StripeLoader', () => {
	// Every script tag the loader added, in order
	let added: HTMLScriptElement[];
	// Holds the script tags instead of the document head: a script in a
	// detached element is never fetched, so no spec loads the real script.
	let head: HTMLElement;

	// toEqual compares DOM nodes by their markup, and every attempt has
	// the same markup: check that the head holds this very tag.
	const expectOnlyInHead = (script: HTMLScriptElement) => {
		const scripts = head.querySelectorAll('script');

		expect(scripts.length).toBe(1);
		expect(scripts[0]).toBe(script);
	};

	beforeEach(() => {
		added = [];
		head = document.createElement('div');
		spyOn(document.head, 'appendChild').and.callFake((node: any) => {
			added.push(node);
			return head.appendChild(node);
		});
	});

	it('is one instance for the app, so the page gets one script tag', () => {
		const loader = TestBed.inject(StripeLoader);

		expect(TestBed.inject(StripeLoader)).toBe(loader);
		expect(added.length).toBe(1);
		expect(added[0].src).toBe(STRIPE_CHECKOUT_SCRIPT_URL);
		expectOnlyInHead(added[0]);
	});

	it('adds no second script while the first one loads', () => {
		const loader = TestBed.inject(StripeLoader);

		loader.ensureLoaded();
		loader.ensureLoaded();

		expect(added.length).toBe(1);
	});

	it('adds no second script after the script loaded', () => {
		const loader = TestBed.inject(StripeLoader);
		added[0].dispatchEvent(new Event('load'));

		loader.ensureLoaded();

		expect(added.length).toBe(1);
		expectOnlyInHead(added[0]);
	});

	it('removes the failed script tag', () => {
		TestBed.inject(StripeLoader);

		// No network when the shop started
		added[0].dispatchEvent(new Event('error'));

		expect(head.querySelectorAll('script').length).toBe(0);
	});

	it('adds the script again after it failed to load', () => {
		const loader = TestBed.inject(StripeLoader);
		added[0].dispatchEvent(new Event('error'));

		// The network is back and the customer taps Pay now
		loader.ensureLoaded();

		expect(added.length).toBe(2);
		expect(added[1]).not.toBe(added[0]);
		expect(added[1].src).toBe(STRIPE_CHECKOUT_SCRIPT_URL);
		expectOnlyInHead(added[1]);
	});

	it('adds no third script while the second attempt loads or after it loaded', () => {
		const loader = TestBed.inject(StripeLoader);
		added[0].dispatchEvent(new Event('error'));
		loader.ensureLoaded();

		loader.ensureLoaded();
		expect(added.length).toBe(2);

		added[1].dispatchEvent(new Event('load'));
		loader.ensureLoaded();
		expect(added.length).toBe(2);
		expectOnlyInHead(added[1]);
	});

	it('tries again on every tap while the script keeps failing', () => {
		const loader = TestBed.inject(StripeLoader);

		for (let attempt = 1; attempt <= 3; attempt++) {
			added[added.length - 1].dispatchEvent(new Event('error'));
			loader.ensureLoaded();
		}

		expect(added.length).toBe(4);
		expectOnlyInHead(added[3]);
	});
});
