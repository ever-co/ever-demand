import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { vi, type Mock } from 'vitest';
import enUS from 'assets/i18n/en-US.json';
import heIL from 'assets/i18n/he-IL.json';
import { translateTesting } from 'app/testing/translate';
import {
	CARD_TOKEN_ROLE,
	StripeCardModalComponent,
} from './stripe-card-modal.component';

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

// Stripe.js with a Card Element that records what the form does with it:
// no spec loads the real script.
function fakeStripe() {
	const handlers: { [event: string]: (event: any) => void } = {};
	const card = {
		mount: vi.fn(),
		destroy: vi.fn(),
		focus: vi.fn(),
		on: vi.fn((event: string, handler: (event: any) => void) => {
			handlers[event] = handler;
			return card;
		}),
	};
	const elements = { create: vi.fn(() => card) };
	const stripe = { elements: vi.fn(() => elements), createToken: vi.fn() };

	return { stripe, elements, card, handlers };
}

// The new-card form that replaced the legacy Stripe Checkout popup: it makes
// the card token the server saves the card from.
describe('StripeCardModalComponent', () => {
	let fixture: ComponentFixture<StripeCardModalComponent>;
	let component: StripeCardModalComponent;
	let stripe: ReturnType<typeof fakeStripe>;
	let dismiss: Mock;
	let translate: TranslateService;

	const element = <T extends HTMLElement>(selector: string): T => {
		fixture.detectChanges();
		return fixture.nativeElement.querySelector(selector);
	};

	const payButton = () => element<HTMLButtonElement>('.card-form-pay');

	const typeEmail = (email: string) => {
		const input = element<HTMLInputElement>('#stripe-card-email');
		input.value = email;
		input.dispatchEvent(new Event('input'));
		fixture.detectChanges();
	};

	const createForm = async (language = 'en-US') => {
		translate.setTranslation(language, language === 'he-IL' ? heIL : enUS);
		translate.use(language);

		fixture = TestBed.createComponent(StripeCardModalComponent);
		component = fixture.componentInstance;
		// What StripeCardForm passes as componentProps
		Object.assign(component, {
			stripe: stripe.stripe,
			image: 'https://example.com/logo.png',
			name: 'Margherita',
			description: 'Tomato and mozzarella',
			amount: 1000,
			currency: 'USD',
			dismiss,
		});
		fixture.detectChanges();
		await fixture.whenStable();
	};

	beforeEach(async () => {
		stripe = fakeStripe();
		dismiss = vi.fn().mockResolvedValue(true);

		await TestBed.configureTestingModule({
			imports: [StripeCardModalComponent, ...translateTesting()],
		}).compileComponents();

		translate = TestBed.inject(TranslateService);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		await createForm();
	});

	it('mounts a Stripe Card Element in the form, without postal code or Link, as Checkout had', () => {
		expect(stripe.stripe.elements).toHaveBeenCalledExactlyOnceWith({
			locale: 'en',
		});
		expect(stripe.elements.create).toHaveBeenCalledExactlyOnceWith(
			'card',
			expect.objectContaining({ hidePostalCode: true, disableLink: true })
		);
		expect(stripe.card.mount).toHaveBeenCalledExactlyOnceWith(
			element('.card-form-card')
		);
	});

	it('shows the card fields in the app language', async () => {
		fixture.destroy();
		stripe = fakeStripe();

		await createForm('he-IL');

		expect(stripe.stripe.elements).toHaveBeenCalledExactlyOnceWith({
			locale: 'he',
		});
		expect(payButton().textContent).toContain(heIL.BUY_POPUP.CARD_FORM.PAY.split(' ')[0]);
	});

	it('shows the product, the logo and the amount in the server currency', () => {
		expect(element('.card-form-name').textContent).toContain('Margherita');
		expect(element('.card-form-description').textContent).toContain(
			'Tomato and mozzarella'
		);
		expect(element<HTMLImageElement>('.card-form-logo').src).toBe(
			'https://example.com/logo.png'
		);
		// 1000 cents
		expect(payButton().textContent.trim()).toBe('Pay $10.00');
		expect(element('.card-form-cancel').textContent.trim()).toBe('Cancel');
	});

	it('hides the logo when it does not load, e.g. offline', () => {
		element('.card-form-logo').dispatchEvent(new Event('error'));

		expect(element('.card-form-logo')).toBeNull();
		expect(element('.card-form-name').textContent).toContain('Margherita');
	});

	it('makes a card token named after the email and closes the form with the token and the email', async () => {
		stripe.stripe.createToken.mockResolvedValue({
			token: { id: 'tok_visa' },
		});
		typeEmail('  customer@example.com ');

		payButton().click();
		await settle();

		// Checkout gave the card the customer's email as its name
		expect(stripe.stripe.createToken).toHaveBeenCalledExactlyOnceWith(
			stripe.card,
			{ name: 'customer@example.com' }
		);
		expect(dismiss).toHaveBeenCalledExactlyOnceWith(
			{ id: 'tok_visa', email: 'customer@example.com' },
			CARD_TOKEN_ROLE
		);
		expect(console.error).not.toHaveBeenCalled();
	});

	it("shows Stripe's message and stays open when the card is not valid", async () => {
		const error = {
			type: 'validation_error',
			code: 'incomplete_number',
			message: 'Your card number is incomplete.',
		};
		stripe.stripe.createToken.mockResolvedValue({ error });
		typeEmail('customer@example.com');

		payButton().click();
		await settle();

		expect(element('.card-form-card-error').textContent.trim()).toBe(
			'Your card number is incomplete.'
		);
		expect(dismiss).not.toHaveBeenCalled();
		// A card typed wrong is not an app error
		expect(console.error).not.toHaveBeenCalled();
		// The customer fixes the card and pays again
		expect(payButton().disabled).toBe(false);

		stripe.stripe.createToken.mockResolvedValue({
			token: { id: 'tok_visa' },
		});
		payButton().click();
		await settle();

		expect(element('.card-form-card-error')).toBeNull();
		expect(dismiss).toHaveBeenCalledExactlyOnceWith(
			{ id: 'tok_visa', email: 'customer@example.com' },
			CARD_TOKEN_ROLE
		);
	});

	it("shows the app's message, not Stripe's, for an error the customer cannot fix", async () => {
		const error = {
			type: 'invalid_request_error',
			message: 'Invalid API Key provided: pk_test_***',
		};
		stripe.stripe.createToken.mockResolvedValue({ error });
		typeEmail('customer@example.com');

		payButton().click();
		await settle();

		const shown = element('.card-form-card-error').textContent.trim();

		expect(shown).toBe(enUS.BUY_POPUP.PAYMENT_FAILED);
		expect(shown).not.toContain('API Key');
		expect(console.error).toHaveBeenCalledWith(expect.any(String), error);
		expect(dismiss).not.toHaveBeenCalled();
	});

	it("shows the app's message when Stripe.js cannot make the token", async () => {
		const error = new Error('Failed to fetch');
		stripe.stripe.createToken.mockRejectedValue(error);
		typeEmail('customer@example.com');

		payButton().click();
		await settle();

		expect(element('.card-form-card-error').textContent.trim()).toBe(
			enUS.BUY_POPUP.PAYMENT_FAILED
		);
		expect(console.error).toHaveBeenCalledWith(expect.any(String), error);
		expect(dismiss).not.toHaveBeenCalled();
		expect(payButton().disabled).toBe(false);
	});

	it('asks for a valid email before it makes a card token', async () => {
		typeEmail('customer@example');

		payButton().click();
		await settle();

		expect(element('.card-form-email-error').textContent.trim()).toBe(
			enUS.BUY_POPUP.CARD_FORM.EMAIL_INVALID
		);
		expect(stripe.stripe.createToken).not.toHaveBeenCalled();
		expect(dismiss).not.toHaveBeenCalled();

		stripe.stripe.createToken.mockResolvedValue({
			token: { id: 'tok_visa' },
		});
		typeEmail('customer@example.com');
		payButton().click();
		await settle();

		expect(element('.card-form-email-error')).toBeNull();
		expect(dismiss).toHaveBeenCalledTimes(1);
	});

	it('shows the card errors Stripe reports while the customer types', () => {
		stripe.handlers.change({
			complete: false,
			error: {
				type: 'validation_error',
				message: 'Your card number is invalid.',
			},
		});

		expect(element('.card-form-card-error').textContent.trim()).toBe(
			'Your card number is invalid.'
		);

		stripe.handlers.change({ complete: true });

		expect(element('.card-form-card-error')).toBeNull();
	});

	it('makes one card token for a double tap and disables Pay while it runs', async () => {
		const tokenResult = deferred<any>();
		stripe.stripe.createToken.mockReturnValue(tokenResult.promise);
		typeEmail('customer@example.com');

		payButton().click();
		await settle();

		expect(payButton().disabled).toBe(true);
		// ngModel disables its input a microtask after change detection
		await fixture.whenStable();
		expect(element<HTMLInputElement>('#stripe-card-email').disabled).toBe(
			true
		);

		// A tap on the disabled button sends nothing; submit with Enter
		await component.pay();

		expect(stripe.stripe.createToken).toHaveBeenCalledTimes(1);

		tokenResult.resolve({ token: { id: 'tok_visa' } });
		await settle();

		expect(dismiss).toHaveBeenCalledTimes(1);
	});

	it('closes the form without a card token on Cancel', () => {
		element<HTMLButtonElement>('.card-form-cancel').click();

		expect(dismiss).toHaveBeenCalledExactlyOnceWith(undefined, 'cancel');
		expect(stripe.stripe.createToken).not.toHaveBeenCalled();
	});

	it('removes the Card Element when the form closes', () => {
		fixture.destroy();

		expect(stripe.card.destroy).toHaveBeenCalledTimes(1);
	});
});
