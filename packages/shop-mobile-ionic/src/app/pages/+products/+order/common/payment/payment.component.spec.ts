import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController, Platform } from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import {
	ORDER_ALREADY_PAID_ERROR,
	STRIPE_CURRENCY_CHANGED_ERROR,
} from '@modules/server.common/routers/IOrderRouter';
import { Store } from 'app/services/store.service';
import { StripeLoader } from 'app/services/stripeLoader';
import { StripeCardForm } from './card-form/stripe-card-form.service';
import { environment } from 'environments/environment';
import { PaymentComponent } from './payment.component';
import { vi, type Mock } from 'vitest';
import { createSpyObj, type SpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

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

// What the server answers when the order was paid first, e.g. by a call
// whose answer the dropped socket lost, or from another device.
function alreadyPaidError(): Error {
	const error = new Error('Order is already paid');
	error.name = ORDER_ALREADY_PAID_ERROR;
	return error;
}

describe('PaymentComponent new-card payment', () => {
	let fixture: ComponentFixture<PaymentComponent>;
	let component: PaymentComponent;
	let userRouter: SpyObj<UserRouter>;
	let orderRouter: SpyObj<OrderRouter>;
	let openCardForm: Mock;
	let tokenHandlers: Array<(token: any) => Promise<void>>;
	let closedHandlers: Array<() => void>;
	let modalController: SpyObj<ModalController>;
	let stripeLoader: SpyObj<StripeLoader>;
	let orderId: Mock;

	// Stripe.js as StripeLoader hands it out once the script loaded
	const stripeJs = { elements: vi.fn(), createToken: vi.fn() } as any;

	// What StripeLoader.stripe gives: null while Stripe.js loads or after
	// it failed to load.
	const setLoadedStripe = (stripe: any) => {
		(stripeLoader as any).stripe = stripe;
	};

	const cardToken = (id: string) => ({
		id,
		email: 'customer@example.com',
	});

	const paidOrder = () => ({ id: 'order-1', isPaid: true } as any);

	const savedCard = () => ({ id: 'card-saved', last4: '4242' } as any);

	// Clears the calls the component made when it was created, so a spec
	// sees only what the tap called.
	const resetRouterCalls = () => {
		userRouter.getCards.mockClear();
		orderRouter.getStripeCurrency.mockClear();
	};

	const expectNoRouterCall = () => {
		expect(userRouter.getCards).not.toHaveBeenCalled();
		expect(userRouter.updateEmail).not.toHaveBeenCalled();
		expect(userRouter.addPaymentMethod).not.toHaveBeenCalled();
		expect(orderRouter.payWithStripe).not.toHaveBeenCalled();
		expect(orderRouter.confirm).not.toHaveBeenCalled();
		expect(orderRouter.getStripeCurrency).not.toHaveBeenCalled();
	};

	// Creates a PaymentComponent the way a page does: every instance gets
	// the one root Store.
	const createPayment = async (): Promise<
		ComponentFixture<PaymentComponent>
	> => {
		const created = TestBed.createComponent(PaymentComponent);
		created.componentInstance.order = {
			isPaid: false,
			products: [{ price: 10, product: { title: [], description: [] } }],
		} as any;
		// env.ts leaves the key empty, and toPaymentStage refuses to run
		// without one.
		(created.componentInstance as any).stripePublishableKey =
			'pk_test_payment_spec';

		// getUserCard finds no saved card, so the Pay now button shows.
		await settle();
		created.detectChanges();
		return created;
	};

	beforeEach(async () => {
		tokenHandlers = [];
		closedHandlers = [];
		// The card form (StripeCardForm) hands the card token and the close
		// of the form to these callbacks, as Stripe Checkout did.
		openCardForm = vi.fn().mockImplementation(async (options) => {
			tokenHandlers.push(options.token);
			closedHandlers.push(options.closed);
		});

		userRouter = createSpyObj('UserRouter', [
			'getCards',
			'updateEmail',
			'addPaymentMethod',
		]);
		userRouter.getCards.mockReturnValue(Promise.resolve([]));
		userRouter.updateEmail.mockReturnValue(
			Promise.resolve({ id: 'user-1' } as any)
		);
		userRouter.addPaymentMethod.mockReturnValue(Promise.resolve('card-1'));

		orderRouter = createSpyObj('OrderRouter', [
			'payWithStripe',
			'confirm',
			'getStripeCurrency',
		]);
		orderRouter.confirm.mockReturnValue(Promise.resolve(paidOrder()));
		orderRouter.getStripeCurrency.mockReturnValue(Promise.resolve('ils'));

		modalController = createSpyObj('ModalController', [
			'dismiss',
			'create',
		]);
		modalController.create.mockReturnValue(
			Promise.resolve({ present: () => Promise.resolve() } as any)
		);

		stripeLoader = createSpyObj<StripeLoader>(
			'StripeLoader',
			['ensureLoaded'],
			{ stripe: stripeJs }
		);

		await TestBed.configureTestingModule({
			declarations: [PaymentComponent],
			imports: [...translateTesting()],
			providers: [
				{ provide: UserRouter, useValue: userRouter },
				{ provide: OrderRouter, useValue: orderRouter },
				// The real root Store, so every PaymentComponent in a spec
				// shares it as in the app.
				{ provide: Platform, useValue: { is: () => false } },
				{ provide: InviteRouter, useValue: {} },
				{ provide: ModalController, useValue: modalController },
				{
					provide: ProductLocalesService,
					useValue: { getTranslate: () => 'Product' },
				},
				// A stub, so no spec loads the real Stripe.js
				{ provide: StripeLoader, useValue: stripeLoader },
				{ provide: StripeCardForm, useValue: { open: openCardForm } },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		// Store keeps the ids in localStorage; read them from spies instead.
		const store = TestBed.inject(Store);
		vi.spyOn(store, 'userId', 'get').mockReturnValue('user-1');
		orderId = vi.spyOn(store, 'orderId', 'get').mockReturnValue(
			'order-1'
		);

		vi.spyOn(window, 'alert').mockImplementation(() => undefined);
		vi.spyOn(console, 'log').mockImplementation(() => undefined);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		fixture = await createPayment();
		component = fixture.componentInstance;
	});

	it('does not save a second card or charge again while the first new-card payment is in flight', async () => {
		const payment = deferred<any>();
		orderRouter.payWithStripe.mockReturnValue(payment.promise);

		await component.toPaymentStage();
		const first = tokenHandlers[0](cardToken('tok_first'));
		await settle();

		expect(userRouter.addPaymentMethod).toHaveBeenCalledTimes(1);
		expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(1);

		// On a slow network the customer taps Pay now again and submits
		// the card a second time.
		await component.toPaymentStage();
		const second = tokenHandlers[tokenHandlers.length - 1](
			cardToken('tok_second')
		);
		await settle();

		expect(openCardForm).toHaveBeenCalledTimes(1);
		expect(userRouter.addPaymentMethod).toHaveBeenCalledTimes(1);
		expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(1);

		payment.resolve(paidOrder());
		await Promise.all([first, second]);

		expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(1);
		expect(window.alert).not.toHaveBeenCalled();
	});

	it('blocks a second card submission while the email update is still pending', async () => {
		const emailUpdate = deferred<any>();
		userRouter.updateEmail.mockReturnValue(emailUpdate.promise);
		orderRouter.payWithStripe.mockReturnValue(Promise.resolve(paidOrder()));

		await component.toPaymentStage();
		const first = tokenHandlers[0](cardToken('tok_first'));

		// paying must be set before the first await, not after updateEmail.
		expect(component.paying).toBe(true);

		await component.toPaymentStage();
		const second = tokenHandlers[tokenHandlers.length - 1](
			cardToken('tok_second')
		);
		await settle();

		expect(openCardForm).toHaveBeenCalledTimes(1);
		expect(userRouter.updateEmail).toHaveBeenCalledTimes(1);
		expect(userRouter.addPaymentMethod).not.toHaveBeenCalled();

		emailUpdate.resolve({ id: 'user-1' });
		await Promise.all([first, second]);

		expect(userRouter.addPaymentMethod).toHaveBeenCalledTimes(1);
		expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(1);
		expect(component.paying).toBe(false);
	});

	it('resets paying when the email update fails', async () => {
		const emailUpdate = deferred<any>();
		userRouter.updateEmail.mockReturnValue(emailUpdate.promise);

		await component.toPaymentStage();
		const done = tokenHandlers[0](cardToken('tok_first'));

		expect(component.paying).toBe(true);

		emailUpdate.reject(new Error('network down'));
		await done;

		expect(userRouter.addPaymentMethod).not.toHaveBeenCalled();
		expect(component.paying).toBe(false);
	});

	it('asks the customer to check the email, and clears the guard, when the email update fails', async () => {
		// The email typed in the card form belongs to another customer, so
		// updateEmail fails on the unique email index.
		const error = new Error('E11000 duplicate key error: email');
		userRouter.updateEmail.mockRejectedValue(error);

		await component.toPaymentStage();
		await expect(
			tokenHandlers[0](cardToken('tok_first'))
		).resolves.toBeUndefined();

		// TranslateModule.forRoot() has no translations, so instant
		// returns the key. The email step has its own message, not the
		// generic one, and never the server error.
		expect(window.alert).toHaveBeenCalledExactlyOnceWith(
			'BUY_POPUP.EMAIL_NOT_SAVED'
		);
		expect(window.alert).not.toHaveBeenCalledWith(
			'BUY_POPUP.PAYMENT_FAILED'
		);
		expect(console.error).toHaveBeenCalledWith(expect.any(String), error);
		expect(userRouter.addPaymentMethod).not.toHaveBeenCalled();
		expect(orderRouter.payWithStripe).not.toHaveBeenCalled();
		expect(component.paying).toBe(false);
		expect(TestBed.inject(Store).isPaying('order-1')).toBe(false);
	});

	it('keeps paying set until payWithStripe and confirm finish, then resets it', async () => {
		const payment = deferred<any>();
		const confirmation = deferred<any>();
		orderRouter.payWithStripe.mockReturnValue(payment.promise);
		orderRouter.confirm.mockReturnValue(confirmation.promise);

		await component.toPaymentStage();
		const done = tokenHandlers[0](cardToken('tok_first'));
		await settle();

		expect(component.paying).toBe(true);

		payment.resolve(paidOrder());
		await settle();

		expect(orderRouter.confirm).toHaveBeenCalledWith('order-1');
		expect(component.paying).toBe(true);

		confirmation.resolve(paidOrder());
		await done;

		expect(component.paying).toBe(false);
	});

	it('resets paying after a failed payment so the customer can try again', async () => {
		const payment = deferred<any>();
		orderRouter.payWithStripe.mockReturnValue(payment.promise);

		await component.toPaymentStage();
		const done = tokenHandlers[0](cardToken('tok_first'));
		await settle();

		expect(component.paying).toBe(true);

		payment.reject(new Error('Your card was declined.'));
		await done;

		expect(window.alert).toHaveBeenCalledWith('BUY_POPUP.PAYMENT_FAILED');
		expect(component.paying).toBe(false);

		await component.toPaymentStage();

		expect(openCardForm).toHaveBeenCalledTimes(2);
	});

	it('resets paying when saving the new card fails', async () => {
		const cardSave = deferred<string>();
		userRouter.addPaymentMethod.mockReturnValue(cardSave.promise);

		await component.toPaymentStage();
		const done = tokenHandlers[0](cardToken('tok_first'));
		await settle();

		expect(component.paying).toBe(true);

		cardSave.reject(new Error('card_declined'));
		await done;

		expect(orderRouter.payWithStripe).not.toHaveBeenCalled();
		expect(component.paying).toBe(false);
	});

	it('tells the customer when saving the new card fails', async () => {
		const error = new Error('card_declined');
		userRouter.addPaymentMethod.mockRejectedValue(error);

		await component.toPaymentStage();
		await expect(
			tokenHandlers[0](cardToken('tok_first'))
		).resolves.toBeUndefined();

		expect(window.alert).toHaveBeenCalledExactlyOnceWith(
			'BUY_POPUP.PAYMENT_FAILED'
		);
		expect(console.error).toHaveBeenCalledWith(expect.any(String), error);
		expect(orderRouter.payWithStripe).not.toHaveBeenCalled();
		expect(component.paying).toBe(false);
		expect(TestBed.inject(Store).isPaying('order-1')).toBe(false);
	});

	it('tells the customer the order is already paid, not that the payment failed, when the server says so', async () => {
		const error = alreadyPaidError();
		orderRouter.payWithStripe.mockRejectedValue(error);

		await component.toPaymentStage();
		await 
			tokenHandlers[0](cardToken('tok_first'))
		;

		expect(window.alert).toHaveBeenCalledExactlyOnceWith(
			'BUY_POPUP.ORDER_ALREADY_PAID'
		);
		expect(window.alert).not.toHaveBeenCalledWith(
			'BUY_POPUP.PAYMENT_FAILED'
		);
		expect(console.error).toHaveBeenCalledWith(expect.any(String), error);
		expect(component.paying).toBe(false);
		expect(TestBed.inject(Store).isPaying('order-1')).toBe(false);
	});

	describe('saved-card payment', () => {
		const payWithCardButton = (): HTMLButtonElement => {
			fixture.detectChanges();
			return fixture.nativeElement.querySelector('button');
		};

		it('tells the customer once and frees Pay with card when the saved card is declined', async () => {
			const payment = deferred<any>();
			orderRouter.payWithStripe.mockReturnValue(payment.promise);
			const declined = new Error('Your card was declined.');
			component.userCard = savedCard();

			// The tap drops the promise payWithUserCard returns
			payWithCardButton().click();
			await settle();

			expect(orderRouter.payWithStripe).toHaveBeenCalledExactlyOnceWith(
				'order-1',
				'card-saved'
			);
			expect(payWithCardButton().disabled).toBe(true);

			payment.reject(declined);
			await settle();

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.PAYMENT_FAILED'
			);
			expect(console.error).toHaveBeenCalledWith(
				expect.any(String),
				declined
			);
			expect(component.paying).toBe(false);
			expect(TestBed.inject(Store).isPaying('order-1')).toBe(false);

			const button = payWithCardButton();

			expect(button.textContent).toContain(
				'BUY_POPUP.BUTTONS.PAY_WITH_FIXED_CARD'
			);
			expect(button.disabled).toBe(false);
		});

		it('tells the customer the order is already paid, not that the payment failed, when the server says so', async () => {
			const error = alreadyPaidError();
			orderRouter.payWithStripe.mockRejectedValue(error);
			component.userCard = savedCard();

			// The tap drops the promise payWithUserCard returns
			payWithCardButton().click();
			await settle();

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.ORDER_ALREADY_PAID'
			);
			expect(window.alert).not.toHaveBeenCalledWith(
				'BUY_POPUP.PAYMENT_FAILED'
			);
			expect(console.error).toHaveBeenCalledWith(
				expect.any(String),
				error
			);
			expect(component.paying).toBe(false);
			expect(TestBed.inject(Store).isPaying('order-1')).toBe(false);
		});
	});

	// scripts/env.ts defaults STRIPE_PUBLISHABLE_KEY to '', so a build
	// without the key still shows the Pay buttons at a store with
	// payments on. The tap drops the promise the method returns, so it
	// has to tell the customer and resolve, never reject.
	describe('without a Stripe publishable key', () => {
		// Clears the calls the component made when it was created, so a
		// spec sees only what the tap called.
		const resetRouterCalls = () => {
			userRouter.getCards.mockClear();
			orderRouter.getStripeCurrency.mockClear();
		};

		const expectNoRouterCall = () => {
			expect(userRouter.getCards).not.toHaveBeenCalled();
			expect(userRouter.updateEmail).not.toHaveBeenCalled();
			expect(userRouter.addPaymentMethod).not.toHaveBeenCalled();
			expect(orderRouter.payWithStripe).not.toHaveBeenCalled();
			expect(orderRouter.confirm).not.toHaveBeenCalled();
			expect(orderRouter.getStripeCurrency).not.toHaveBeenCalled();
		};

		beforeEach(() => {
			(component as any).stripePublishableKey = '';
			resetRouterCalls();
		});

		it('tells the customer card payment is not available when Pay now is tapped', async () => {
			await component.toPaymentStage();

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.CARD_PAYMENT_UNAVAILABLE'
			);
			expect(openCardForm).not.toHaveBeenCalled();
			expect(stripeLoader.ensureLoaded).not.toHaveBeenCalled();
			expect(modalController.dismiss).not.toHaveBeenCalled();
			expectNoRouterCall();
			expect(component.paying).toBe(false);
			expect(TestBed.inject(Store).isPaying('order-1')).toBe(false);
		});

		it('tells the customer card payment is not available when Pay with card is tapped', async () => {
			component.userCard = savedCard();

			await component.payWithUserCard();

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.CARD_PAYMENT_UNAVAILABLE'
			);
			expectNoRouterCall();
			expect(component.paying).toBe(false);
			expect(TestBed.inject(Store).isPaying('order-1')).toBe(false);
		});

		it('shows the message on a tap of the Pay now button', async () => {
			const button: HTMLButtonElement =
				fixture.nativeElement.querySelector('button');

			expect(button.textContent).toContain('BUY_POPUP.BUTTONS.PAY_NOW');

			// The click binding drops the promise toPaymentStage returns
			button.click();
			await settle();

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.CARD_PAYMENT_UNAVAILABLE'
			);
			expectNoRouterCall();
		});
	});

	// StripeLoader loads Stripe.js at runtime and nothing waits for it: a
	// content blocker, a firewall or no network keeps it from loading, or
	// it is still loading when the customer taps Pay now. The tap drops the
	// promise toPaymentStage returns, so it has to tell the customer and
	// resolve, never reject.
	describe('when the card form script did not load', () => {
		let originalOrderInfoType: string;

		beforeEach(() => {
			originalOrderInfoType = environment.ORDER_INFO_TYPE;
			setLoadedStripe(null);
			resetRouterCalls();
		});

		afterEach(() => {
			environment.ORDER_INFO_TYPE = originalOrderInfoType;
		});

		it('tells the customer the card form did not load when Pay now is tapped', async () => {
			environment.ORDER_INFO_TYPE = 'page';

			await component.toPaymentStage();

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.CARD_FORM_NOT_LOADED'
			);
			expect(console.error).toHaveBeenCalledExactlyOnceWith(expect.any(String));
			expect(openCardForm).not.toHaveBeenCalled();
			expectNoRouterCall();
			expect(component.paying).toBe(false);
			expect(TestBed.inject(Store).isPaying('order-1')).toBe(false);
		});

		it('keeps the order info modal open in popup mode', async () => {
			environment.ORDER_INFO_TYPE = 'popup';

			await component.toPaymentStage();

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.CARD_FORM_NOT_LOADED'
			);
			expect(modalController.dismiss).not.toHaveBeenCalled();
			expect(modalController.create).not.toHaveBeenCalled();
			expectNoRouterCall();
			expect(component.paying).toBe(false);
			expect(TestBed.inject(Store).isPaying('order-1')).toBe(false);
		});

		it('tells the customer, and shows the order again in popup mode, when the card form cannot open', async () => {
			environment.ORDER_INFO_TYPE = 'popup';
			setLoadedStripe(stripeJs);
			const error = new Error('ion-modal is not defined');
			openCardForm.mockRejectedValue(error);

			await expect(component.toPaymentStage()).resolves.toBeUndefined();

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.CARD_FORM_NOT_LOADED'
			);
			expect(console.error).toHaveBeenCalledWith(expect.any(String), error);
			// Dismissed for the card form, then opened again
			expect(modalController.dismiss).toHaveBeenCalledTimes(1);
			expect(modalController.create).toHaveBeenCalledTimes(1);
			expectNoRouterCall();
			expect(component.paying).toBe(false);
		});

		it('shows the message on a tap of the Pay now button', async () => {
			const button: HTMLButtonElement =
				fixture.nativeElement.querySelector('button');

			expect(button.textContent).toContain('BUY_POPUP.BUTTONS.PAY_NOW');

			// The click binding drops the promise toPaymentStage returns
			button.click();
			await settle();

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.CARD_FORM_NOT_LOADED'
			);
			expectNoRouterCall();
			fixture.detectChanges();
			expect(button.disabled).toBe(false);
		});

		it('opens the card form on the next tap once the script has loaded', async () => {
			await component.toPaymentStage();

			setLoadedStripe(stripeJs);
			await component.toPaymentStage();

			expect(openCardForm).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({ currency: 'ILS' })
			);
			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.CARD_FORM_NOT_LOADED'
			);
		});

		// The shop started without network, so the card form script failed
		// and nothing added it again: every tap showed the message until
		// the app restarted (#1663).
		it('asks the loader to load Stripe.js again and still tells the customer', async () => {
			await component.toPaymentStage();

			expect(stripeLoader.ensureLoaded).toHaveBeenCalledTimes(1);
			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.CARD_FORM_NOT_LOADED'
			);
			// The alert blocks until the customer closes it: the download
			// can run meanwhile.
			expect(stripeLoader.ensureLoaded).toHaveBeenCalledBefore(
				window.alert as Mock
			);
			expect(openCardForm).not.toHaveBeenCalled();
			expectNoRouterCall();
		});

		it('opens the card form on a later tap once the loader loaded Stripe.js again', async () => {
			// Stripe.js loads this time
			stripeLoader.ensureLoaded.mockImplementation(() => {
				setLoadedStripe(stripeJs);
			});

			await component.toPaymentStage();
			await component.toPaymentStage();

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.CARD_FORM_NOT_LOADED'
			);
			expect(openCardForm).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({ currency: 'ILS' })
			);
			// The second tap found the card form and did not ask again
			expect(stripeLoader.ensureLoaded).toHaveBeenCalledTimes(1);
		});
	});

	it('opens the card form with Stripe.js, the first product, its price in cents and the logo', async () => {
		await component.toPaymentStage();

		expect(openCardForm).toHaveBeenCalledExactlyOnceWith(
			expect.objectContaining({
				stripe: stripeJs,
				image: environment.STRIPE_POP_UP_LOGO,
				name: 'Product',
				description: 'Product',
				amount: 1000,
				currency: 'ILS',
			})
		);
		expect(stripeLoader.ensureLoaded).not.toHaveBeenCalled();
		expect(window.alert).not.toHaveBeenCalled();
	});

	it('saves the email and the card token from the card form, then charges and confirms the order', async () => {
		orderRouter.payWithStripe.mockReturnValue(Promise.resolve(paidOrder()));

		await component.toPaymentStage();
		await tokenHandlers[0](cardToken('tok_first'));

		expect(userRouter.updateEmail).toHaveBeenCalledExactlyOnceWith(
			'user-1',
			'customer@example.com'
		);
		expect(userRouter.addPaymentMethod).toHaveBeenCalledExactlyOnceWith(
			'user-1',
			'tok_first'
		);
		expect(orderRouter.payWithStripe).toHaveBeenCalledExactlyOnceWith(
			'order-1',
			'card-1',
			'ILS'
		);
		expect(orderRouter.confirm).toHaveBeenCalledExactlyOnceWith('order-1');
		expect(window.alert).not.toHaveBeenCalled();
		expect(component.paying).toBe(false);
	});

	it('tells the customer, and charges nothing, when Pay with card runs without a saved card', async () => {
		component.userCard = null;

		await component.payWithUserCard();

		expect(window.alert).toHaveBeenCalledExactlyOnceWith(
			'BUY_POPUP.PAYMENT_FAILED'
		);
		expect(orderRouter.payWithStripe).not.toHaveBeenCalled();
		expect(component.paying).toBe(false);
		expect(TestBed.inject(Store).isPaying('order-1')).toBe(false);
	});

	describe('card popup currency', () => {
		const payNowButton = (
			payment: ComponentFixture<PaymentComponent>
		): HTMLButtonElement => {
			payment.detectChanges();
			return payment.nativeElement.querySelector('button');
		};

		it('shows the currency the server charges the card in', async () => {
			orderRouter.getStripeCurrency.mockReturnValue(
				Promise.resolve('usd')
			);
			const payment = (await createPayment()).componentInstance;

			await payment.toPaymentStage();

			expect(openCardForm).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({ currency: 'USD' })
			);
		});

		it('keeps Pay now disabled and opens no popup until the server sent the currency', async () => {
			const currency = deferred<string>();
			orderRouter.getStripeCurrency.mockReturnValue(currency.promise);
			const payment = await createPayment();

			expect(payNowButton(payment).disabled).toBe(true);

			await payment.componentInstance.toPaymentStage();

			expect(openCardForm).not.toHaveBeenCalled();
			expect(window.alert).not.toHaveBeenCalled();

			currency.resolve('eur');
			await settle();

			expect(payNowButton(payment).disabled).toBe(false);

			await payment.componentInstance.toPaymentStage();

			expect(openCardForm).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({ currency: 'EUR' })
			);
		});

		it('tells the customer and loads the currency again when it could not be loaded', async () => {
			const error = new Error('network down');
			orderRouter.getStripeCurrency.mockClear();
			orderRouter.getStripeCurrency
				.mockReturnValueOnce(Promise.reject(error))
				.mockReturnValueOnce(Promise.resolve('usd'));
			const payment = await createPayment();

			expect(console.error).toHaveBeenCalledWith(
				expect.any(String),
				error
			);
			// Enabled, so the tap can say what went wrong
			expect(payNowButton(payment).disabled).toBe(false);

			await payment.componentInstance.toPaymentStage();

			expect(openCardForm).not.toHaveBeenCalled();
			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.PAYMENT_FAILED'
			);
			expect(orderRouter.getStripeCurrency).toHaveBeenCalledTimes(2);

			await settle();
			await payment.componentInstance.toPaymentStage();

			expect(openCardForm).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({ currency: 'USD' })
			);
		});

		it('sends the currency shown in the popup with the charge', async () => {
			orderRouter.getStripeCurrency.mockReturnValue(
				Promise.resolve('usd')
			);
			orderRouter.payWithStripe.mockReturnValue(
				Promise.resolve(paidOrder())
			);
			const payment = (await createPayment()).componentInstance;

			await payment.toPaymentStage();
			await tokenHandlers[tokenHandlers.length - 1](
				cardToken('tok_first')
			);

			expect(orderRouter.payWithStripe).toHaveBeenCalledExactlyOnceWith(
				'order-1',
				'card-1',
				'USD'
			);
		});

		it('waits for the new currency after the server refused the shown one', async () => {
			// The server restarted with another currency while the page
			// stayed open, so it refuses the charge in the shown one.
			const reloaded = deferred<string>();
			orderRouter.getStripeCurrency.mockClear();
			orderRouter.getStripeCurrency
				.mockReturnValueOnce(Promise.resolve('ils'))
				.mockReturnValueOnce(reloaded.promise);
			const refused = new Error(
				'Charge currency is usd, but the customer was shown ILS'
			);
			refused.name = STRIPE_CURRENCY_CHANGED_ERROR;
			orderRouter.payWithStripe.mockRejectedValue(refused);
			const fixtureWithRefusal = await createPayment();
			const payment = fixtureWithRefusal.componentInstance;

			await payment.toPaymentStage();
			await tokenHandlers[tokenHandlers.length - 1](
				cardToken('tok_first')
			);
			await settle();

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.PAYMENT_FAILED'
			);
			expect(orderRouter.getStripeCurrency).toHaveBeenCalledTimes(2);
			// No popup in the refused currency while the new one loads
			expect(payNowButton(fixtureWithRefusal).disabled).toBe(true);

			await payment.toPaymentStage();

			expect(openCardForm).toHaveBeenCalledTimes(1);

			reloaded.resolve('usd');
			await settle();

			expect(payNowButton(fixtureWithRefusal).disabled).toBe(false);

			await payment.toPaymentStage();

			expect(openCardForm).toHaveBeenCalledTimes(2);
			expect(openCardForm.mock.lastCall[0].currency).toBe('USD');
		});

		it('keeps the currency after a declined card', async () => {
			orderRouter.getStripeCurrency.mockClear();
			orderRouter.payWithStripe.mockRejectedValue(
				new Error('Your card was declined.')
			);
			const payment = (await createPayment()).componentInstance;

			await payment.toPaymentStage();
			await tokenHandlers[tokenHandlers.length - 1](
				cardToken('tok_first')
			);
			await settle();

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.PAYMENT_FAILED'
			);
			expect(orderRouter.getStripeCurrency).toHaveBeenCalledTimes(1);

			await payment.toPaymentStage();

			expect(openCardForm).toHaveBeenCalledTimes(2);
			expect(openCardForm.mock.lastCall[0].currency).toBe('ILS');
		});
	});

	it('disables the Pay now button while a payment is in flight', () => {
		const button: HTMLButtonElement =
			fixture.nativeElement.querySelector('button');

		expect(button.textContent).toContain('BUY_POPUP.BUTTONS.PAY_NOW');
		expect(button.disabled).toBe(false);

		component.paying = true;
		fixture.detectChanges();

		expect(button.disabled).toBe(true);
	});

	// On a takeaway order, I'm here swaps store-info for products-info, and
	// in popup mode the order modal is built again. Both create a new
	// PaymentComponent while the first payment may still run.
	describe('when a page creates the payment component again during a payment', () => {
		it('blocks Pay now and Pay with card on the new component while updateEmail is still pending', async () => {
			const emailUpdate = deferred<any>();
			userRouter.updateEmail.mockReturnValue(emailUpdate.promise);
			orderRouter.payWithStripe.mockReturnValue(
				Promise.resolve(paidOrder())
			);

			await component.toPaymentStage();
			const first = tokenHandlers[0](cardToken('tok_first'));

			const second = (await createPayment()).componentInstance;
			second.userCard = savedCard();

			await second.toPaymentStage();
			const savedCardPayment = second.payWithUserCard();
			await settle();

			expect(openCardForm).toHaveBeenCalledTimes(1);
			expect(userRouter.updateEmail).toHaveBeenCalledTimes(1);
			expect(userRouter.addPaymentMethod).not.toHaveBeenCalled();
			expect(orderRouter.payWithStripe).not.toHaveBeenCalled();

			emailUpdate.resolve({ id: 'user-1' });
			await Promise.all([first, savedCardPayment]);

			expect(userRouter.updateEmail).toHaveBeenCalledTimes(1);
			expect(userRouter.addPaymentMethod).toHaveBeenCalledTimes(1);
			expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(1);
			expect(orderRouter.payWithStripe).toHaveBeenCalledWith(
				'order-1',
				'card-1',
				'ILS'
			);
		});

		it('ignores a card token from another component while updateEmail is still pending', async () => {
			const emailUpdate = deferred<any>();
			userRouter.updateEmail.mockReturnValue(emailUpdate.promise);
			orderRouter.payWithStripe.mockReturnValue(
				Promise.resolve(paidOrder())
			);

			// Both components opened the card popup before either
			// payment started.
			const second = (await createPayment()).componentInstance;
			await component.toPaymentStage();
			await second.toPaymentStage();

			expect(openCardForm).toHaveBeenCalledTimes(2);

			const first = tokenHandlers[0](cardToken('tok_first'));
			const secondToken = tokenHandlers[1](cardToken('tok_second'));
			await settle();

			expect(userRouter.updateEmail).toHaveBeenCalledTimes(1);

			emailUpdate.resolve({ id: 'user-1' });
			await Promise.all([first, secondToken]);

			expect(userRouter.updateEmail).toHaveBeenCalledTimes(1);
			expect(userRouter.addPaymentMethod).toHaveBeenCalledTimes(1);
			expect(userRouter.addPaymentMethod).toHaveBeenCalledWith(
				'user-1',
				'tok_first'
			);
			expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(1);
			expect(window.alert).not.toHaveBeenCalled();
		});

		it('disables Pay now on the new component until the first payment finishes', async () => {
			const payment = deferred<any>();
			orderRouter.payWithStripe.mockReturnValue(payment.promise);

			await component.toPaymentStage();
			const first = tokenHandlers[0](cardToken('tok_first'));
			await settle();

			const secondFixture = await createPayment();
			const button: HTMLButtonElement =
				secondFixture.nativeElement.querySelector('button');

			expect(button.textContent).toContain('BUY_POPUP.BUTTONS.PAY_NOW');
			expect(button.disabled).toBe(true);

			payment.resolve(paidOrder());
			await first;
			secondFixture.detectChanges();

			expect(button.disabled).toBe(false);
		});

		it('clears the guard after the payment succeeds', async () => {
			const payment = deferred<any>();
			orderRouter.payWithStripe.mockReturnValue(payment.promise);

			await component.toPaymentStage();
			const first = tokenHandlers[0](cardToken('tok_first'));
			await settle();

			const second = (await createPayment()).componentInstance;
			await second.toPaymentStage();

			expect(openCardForm).toHaveBeenCalledTimes(1);

			payment.resolve(paidOrder());
			await first;

			expect(second.paying).toBe(false);

			await second.toPaymentStage();

			expect(openCardForm).toHaveBeenCalledTimes(2);
		});

		it('clears the guard after the email update fails', async () => {
			const emailUpdate = deferred<any>();
			userRouter.updateEmail.mockReturnValue(emailUpdate.promise);

			await component.toPaymentStage();
			const first = tokenHandlers[0](cardToken('tok_first'));

			const second = (await createPayment()).componentInstance;
			await second.toPaymentStage();

			expect(openCardForm).toHaveBeenCalledTimes(1);

			emailUpdate.reject(new Error('network down'));
			await first;

			expect(second.paying).toBe(false);

			await second.toPaymentStage();

			expect(openCardForm).toHaveBeenCalledTimes(2);
		});

		it('clears the guard and tells the customer once after a saved-card payment is rejected', async () => {
			const payment = deferred<any>();
			orderRouter.payWithStripe.mockReturnValue(payment.promise);

			component.userCard = savedCard();
			const first = component.payWithUserCard();

			const second = (await createPayment()).componentInstance;
			second.userCard = savedCard();
			const blocked = second.payWithUserCard();
			await settle();

			expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(1);

			payment.reject(new Error('Your card was declined.'));

			// Settles, so nothing escapes the click handler
			await expect(first).resolves.toBeUndefined();
			await expect(blocked).resolves.toBeUndefined();
			// Only the charge that ran tells the customer
			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				'BUY_POPUP.PAYMENT_FAILED'
			);

			orderRouter.payWithStripe.mockReturnValue(
				Promise.resolve(paidOrder())
			);
			await second.payWithUserCard();

			expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(2);
			expect(window.alert).toHaveBeenCalledTimes(1);
		});

		it('does not block a payment for a different order', async () => {
			const emailUpdate = deferred<any>();
			userRouter.updateEmail.mockReturnValue(emailUpdate.promise);
			orderRouter.payWithStripe.mockReturnValue(
				Promise.resolve(paidOrder())
			);

			await component.toPaymentStage();
			const first = tokenHandlers[0](cardToken('tok_first'));

			const second = (await createPayment()).componentInstance;
			await second.toPaymentStage();

			expect(openCardForm).toHaveBeenCalledTimes(1);

			// The customer starts another order while the first payment
			// still runs.
			orderId.mockReturnValue('order-2');

			await second.toPaymentStage();

			expect(openCardForm).toHaveBeenCalledTimes(2);

			const other = tokenHandlers[1](cardToken('tok_other'));

			emailUpdate.resolve({ id: 'user-1' });
			await Promise.all([first, other]);

			expect(userRouter.addPaymentMethod).toHaveBeenCalledTimes(2);
			// In any order, and nothing else.
			expect(orderRouter.payWithStripe.mock.calls).toHaveLength(2);
			expect(orderRouter.payWithStripe.mock.calls).toEqual(
				expect.arrayContaining([
					['order-1', 'card-1', 'ILS'],
					['order-2', 'card-1', 'ILS'],
				])
			);
		});
	});

	// In popup mode toPaymentStage dismisses the order info modal and
	// opens it again when the card form is done. The card form calls
	// closed whenever it closes, also after a successful token (Checkout
	// did too, and browsers differed in which callback ran first), and the
	// token handler closes when the payment is done.
	describe('opening the order info modal after the card form', () => {
		let originalOrderInfoType: string;
		let modalChange: EventEmitter<boolean>;

		beforeEach(() => {
			originalOrderInfoType = environment.ORDER_INFO_TYPE;
			environment.ORDER_INFO_TYPE = 'popup';

			modalChange = new EventEmitter<boolean>();
			vi.spyOn(modalChange, 'emit').mockImplementation(() => undefined);
			component.modalChange = modalChange;

			orderRouter.payWithStripe.mockReturnValue(
				Promise.resolve(paidOrder())
			);
		});

		afterEach(() => {
			environment.ORDER_INFO_TYPE = originalOrderInfoType;
		});

		it('opens the order info modal once when closed runs before the token callback', async () => {
			await component.toPaymentStage();

			closedHandlers[0]();
			await tokenHandlers[0](cardToken('tok_first'));
			await settle();

			expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(1);
			expect(modalController.create).toHaveBeenCalledTimes(1);
			expect(modalChange.emit).toHaveBeenCalledTimes(1);
		});

		it('opens the order info modal once when the token callback runs before closed', async () => {
			await component.toPaymentStage();

			await tokenHandlers[0](cardToken('tok_first'));
			closedHandlers[0]();
			await settle();

			expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(1);
			expect(modalController.create).toHaveBeenCalledTimes(1);
			expect(modalChange.emit).toHaveBeenCalledTimes(1);
		});

		it('still opens the order info modal when the customer closes the card form without paying', async () => {
			await component.toPaymentStage();

			closedHandlers[0]();
			await settle();

			expect(orderRouter.payWithStripe).not.toHaveBeenCalled();
			expect(modalController.create).toHaveBeenCalledTimes(1);
			expect(modalChange.emit).toHaveBeenCalledTimes(1);
		});

		it('opens the order info modal again for the next card form session', async () => {
			await component.toPaymentStage();
			closedHandlers[0]();
			await settle();

			await component.toPaymentStage();
			closedHandlers[1]();
			await settle();

			expect(openCardForm).toHaveBeenCalledTimes(2);
			expect(modalController.create).toHaveBeenCalledTimes(2);
		});

		it('does not open the order info modal in page mode', async () => {
			environment.ORDER_INFO_TYPE = 'page';

			await component.toPaymentStage();
			closedHandlers[0]();
			await tokenHandlers[0](cardToken('tok_first'));
			await settle();

			expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(1);
			expect(modalController.dismiss).not.toHaveBeenCalled();
			expect(modalController.create).not.toHaveBeenCalled();
			expect(modalChange.emit).not.toHaveBeenCalled();
		});
	});
});
