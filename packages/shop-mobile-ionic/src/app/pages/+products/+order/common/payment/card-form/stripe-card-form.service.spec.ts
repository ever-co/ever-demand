import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { vi, type Mock } from 'vitest';
import { createSpyObj, type SpyObj } from 'app/testing/spies';
import { StripeCardForm, type CardFormOptions } from './stripe-card-form.service';
import {
	CARD_TOKEN_ROLE,
	StripeCardModalComponent,
} from './stripe-card-modal.component';

interface Deferred<T> {
	promise: Promise<T>;
	resolve: (value: T) => void;
}

function deferred<T>(): Deferred<T> {
	let resolve: (value: T) => void;
	const promise = new Promise<T>((res) => (resolve = res));
	return { promise, resolve };
}

// Lets every pending promise callback run.
function settle(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

// An ion-modal that dismisses the way Ionic's does: once, with the data and
// role of the first dismiss, willDismiss before didDismiss.
function fakeModal() {
	const willDismiss = deferred<any>();
	const didDismiss = deferred<any>();
	let dismissed = false;

	return {
		present: vi.fn().mockResolvedValue(undefined),
		dismiss: vi.fn(async (data?: any, role?: string) => {
			if (dismissed) {
				return false;
			}
			dismissed = true;
			willDismiss.resolve({ data, role });
			await Promise.resolve();
			didDismiss.resolve({ data, role });
			return true;
		}),
		onWillDismiss: () => willDismiss.promise,
		onDidDismiss: () => didDismiss.promise,
	};
}

describe('StripeCardForm', () => {
	let cardForm: StripeCardForm;
	let modalController: SpyObj<ModalController>;
	let modals: ReturnType<typeof fakeModal>[];
	// What each callback saw, in order
	let calls: string[];
	let options: CardFormOptions;

	const stripe = { elements: vi.fn(), createToken: vi.fn() } as any;

	// The componentProps the form got
	const props = (index = 0): any =>
		modalController.create.mock.calls[index][0].componentProps;

	beforeEach(() => {
		modals = [];
		calls = [];
		modalController = createSpyObj('ModalController', ['create']);
		modalController.create.mockImplementation(async () => {
			const modal = fakeModal();
			modals.push(modal);
			return modal as any;
		});

		options = {
			stripe,
			image: 'https://example.com/logo.png',
			name: 'Margherita',
			description: 'Tomato and mozzarella',
			amount: 1000,
			currency: 'USD',
			token: vi.fn((token) => {
				calls.push(`token ${token.id}`);
			}),
			closed: vi.fn(() => {
				calls.push('closed');
			}),
		};

		TestBed.configureTestingModule({
			providers: [{ provide: ModalController, useValue: modalController }],
		});
		cardForm = TestBed.inject(StripeCardForm);
	});

	it('opens the card form in a modal with Stripe.js, the product, the amount and the logo', async () => {
		await cardForm.open(options);

		expect(modalController.create).toHaveBeenCalledExactlyOnceWith(
			expect.objectContaining({ component: StripeCardModalComponent })
		);
		expect(props()).toEqual(
			expect.objectContaining({
				stripe,
				image: 'https://example.com/logo.png',
				name: 'Margherita',
				description: 'Tomato and mozzarella',
				amount: 1000,
				currency: 'USD',
			})
		);
		expect(modals[0].present).toHaveBeenCalledTimes(1);
		expect(options.closed).not.toHaveBeenCalled();
	});

	it('hands the card token to the payment, then reports the form closed, once each', async () => {
		await cardForm.open(options);
		const token = { id: 'tok_visa', email: 'customer@example.com' };

		await props().dismiss(token, CARD_TOKEN_ROLE);
		await settle();

		// The payment is marked as running before the order shows again
		expect(calls).toEqual(['token tok_visa', 'closed']);
		expect(options.token).toHaveBeenCalledExactlyOnceWith(token);
		expect(modals[0].dismiss).toHaveBeenCalledExactlyOnceWith(
			token,
			CARD_TOKEN_ROLE
		);
	});

	it('reports the form closed, without a token, on Cancel, a backdrop tap or the back button', async () => {
		for (const role of ['cancel', 'backdrop', undefined]) {
			calls = [];
			await cardForm.open(options);
			const modal = modals[modals.length - 1];

			await modal.dismiss(undefined, role);
			await settle();

			expect(calls).toEqual(['closed']);
		}

		expect(options.token).not.toHaveBeenCalled();
	});

	it('drops a card token that comes after the customer closed the form', async () => {
		await cardForm.open(options);

		await modals[0].dismiss(undefined, 'backdrop');
		await props().dismiss({ id: 'tok_late', email: 'a@b.co' }, CARD_TOKEN_ROLE);
		await settle();

		expect(options.token).not.toHaveBeenCalled();
		expect(options.closed).toHaveBeenCalledTimes(1);
	});

	it('opens one card form for a double tap on Pay now', async () => {
		const first = cardForm.open(options);
		const second = cardForm.open(options);
		await Promise.all([first, second]);

		expect(modalController.create).toHaveBeenCalledTimes(1);

		// Once the form shows, a later tap opens the next one
		await modals[0].dismiss(undefined, 'cancel');
		await cardForm.open(options);

		expect(modalController.create).toHaveBeenCalledTimes(2);
	});

	it('opens the card form again after it could not open', async () => {
		const error = new Error('ion-modal is not defined');
		modalController.create.mockRejectedValueOnce(error);

		await expect(cardForm.open(options)).rejects.toBe(error);
		await cardForm.open(options);

		expect(modalController.create).toHaveBeenCalledTimes(2);
		expect(modals[0].present).toHaveBeenCalledTimes(1);
	});

	it('logs a token handler that rejects instead of leaving it unhandled', async () => {
		const error = new Error('unexpected');
		(options.token as Mock).mockRejectedValue(error);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		await cardForm.open(options);

		await props().dismiss({ id: 'tok_visa', email: 'a@b.co' }, CARD_TOKEN_ROLE);
		await settle();

		expect(console.error).toHaveBeenCalledWith(expect.any(String), error);
		expect(options.closed).toHaveBeenCalledTimes(1);
	});
});
