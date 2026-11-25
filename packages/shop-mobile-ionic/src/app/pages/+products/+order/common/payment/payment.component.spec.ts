import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController, Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { Store } from 'app/services/store.service';
import { PaymentComponent } from './payment.component';

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

describe('PaymentComponent new-card payment', () => {
	let fixture: ComponentFixture<PaymentComponent>;
	let component: PaymentComponent;
	let userRouter: jasmine.SpyObj<UserRouter>;
	let orderRouter: jasmine.SpyObj<OrderRouter>;
	let configure: jasmine.Spy;
	let tokenHandlers: Array<(token: any) => Promise<void>>;
	let originalStripeCheckout: any;
	let orderId: jasmine.Spy;

	const cardToken = (id: string) => ({
		id,
		email: 'customer@example.com',
	});

	const paidOrder = () => ({ id: 'order-1', isPaid: true } as any);

	const savedCard = () => ({ id: 'card-saved', last4: '4242' } as any);

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
		configure = jasmine
			.createSpy('StripeCheckout.configure')
			.and.callFake((options) => {
				tokenHandlers.push(options.token);
				return { open: jasmine.createSpy('open') };
			});
		originalStripeCheckout = (window as any).StripeCheckout;
		(window as any).StripeCheckout = { configure };

		userRouter = jasmine.createSpyObj('UserRouter', [
			'getCards',
			'updateEmail',
			'addPaymentMethod',
		]);
		userRouter.getCards.and.returnValue(Promise.resolve([]));
		userRouter.updateEmail.and.returnValue(
			Promise.resolve({ id: 'user-1' } as any)
		);
		userRouter.addPaymentMethod.and.returnValue(Promise.resolve('card-1'));

		orderRouter = jasmine.createSpyObj('OrderRouter', [
			'payWithStripe',
			'confirm',
		]);
		orderRouter.confirm.and.returnValue(Promise.resolve(paidOrder()));

		const modalController = jasmine.createSpyObj('ModalController', [
			'dismiss',
			'create',
		]);
		modalController.create.and.returnValue(
			Promise.resolve({ present: () => Promise.resolve() })
		);

		await TestBed.configureTestingModule({
			declarations: [PaymentComponent],
			imports: [TranslateModule.forRoot()],
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
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		// Store keeps the ids in localStorage; read them from spies instead.
		const store = TestBed.inject(Store);
		spyOnProperty(store, 'userId', 'get').and.returnValue('user-1');
		orderId = spyOnProperty(store, 'orderId', 'get').and.returnValue(
			'order-1'
		);

		spyOn(window, 'alert');
		spyOn(console, 'log');
		spyOn(console, 'error');

		fixture = await createPayment();
		component = fixture.componentInstance;
	});

	afterEach(() => {
		(window as any).StripeCheckout = originalStripeCheckout;
	});

	it('does not save a second card or charge again while the first new-card payment is in flight', async () => {
		const payment = deferred<any>();
		orderRouter.payWithStripe.and.returnValue(payment.promise);

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

		expect(configure).toHaveBeenCalledTimes(1);
		expect(userRouter.addPaymentMethod).toHaveBeenCalledTimes(1);
		expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(1);

		payment.resolve(paidOrder());
		await Promise.all([first, second]);

		expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(1);
		expect(window.alert).not.toHaveBeenCalled();
	});

	it('blocks a second card submission while the email update is still pending', async () => {
		const emailUpdate = deferred<any>();
		userRouter.updateEmail.and.returnValue(emailUpdate.promise);
		orderRouter.payWithStripe.and.returnValue(Promise.resolve(paidOrder()));

		await component.toPaymentStage();
		const first = tokenHandlers[0](cardToken('tok_first'));

		// paying must be set before the first await, not after updateEmail.
		expect(component.paying).toBe(true);

		await component.toPaymentStage();
		const second = tokenHandlers[tokenHandlers.length - 1](
			cardToken('tok_second')
		);
		await settle();

		expect(configure).toHaveBeenCalledTimes(1);
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
		userRouter.updateEmail.and.returnValue(emailUpdate.promise);

		await component.toPaymentStage();
		const done = tokenHandlers[0](cardToken('tok_first'));

		expect(component.paying).toBe(true);

		emailUpdate.reject(new Error('network down'));
		await done.catch(() => undefined);

		expect(userRouter.addPaymentMethod).not.toHaveBeenCalled();
		expect(component.paying).toBe(false);
	});

	it('keeps paying set until payWithStripe and confirm finish, then resets it', async () => {
		const payment = deferred<any>();
		const confirmation = deferred<any>();
		orderRouter.payWithStripe.and.returnValue(payment.promise);
		orderRouter.confirm.and.returnValue(confirmation.promise);

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
		orderRouter.payWithStripe.and.returnValue(payment.promise);

		await component.toPaymentStage();
		const done = tokenHandlers[0](cardToken('tok_first'));
		await settle();

		expect(component.paying).toBe(true);

		payment.reject(new Error('Your card was declined.'));
		await done;

		expect(window.alert).toHaveBeenCalledWith('Payment Failed!');
		expect(component.paying).toBe(false);

		await component.toPaymentStage();

		expect(configure).toHaveBeenCalledTimes(2);
	});

	it('resets paying when saving the new card fails', async () => {
		const cardSave = deferred<string>();
		userRouter.addPaymentMethod.and.returnValue(cardSave.promise);

		await component.toPaymentStage();
		const done = tokenHandlers[0](cardToken('tok_first'));
		await settle();

		expect(component.paying).toBe(true);

		cardSave.reject(new Error('card_declined'));
		await done;

		expect(orderRouter.payWithStripe).not.toHaveBeenCalled();
		expect(component.paying).toBe(false);
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
			userRouter.updateEmail.and.returnValue(emailUpdate.promise);
			orderRouter.payWithStripe.and.returnValue(
				Promise.resolve(paidOrder())
			);

			await component.toPaymentStage();
			const first = tokenHandlers[0](cardToken('tok_first'));

			const second = (await createPayment()).componentInstance;
			second.userCard = savedCard();

			await second.toPaymentStage();
			const savedCardPayment = second.payWithUserCard();
			await settle();

			expect(configure).toHaveBeenCalledTimes(1);
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
				'card-1'
			);
		});

		it('ignores a card token from another component while updateEmail is still pending', async () => {
			const emailUpdate = deferred<any>();
			userRouter.updateEmail.and.returnValue(emailUpdate.promise);
			orderRouter.payWithStripe.and.returnValue(
				Promise.resolve(paidOrder())
			);

			// Both components opened the card popup before either
			// payment started.
			const second = (await createPayment()).componentInstance;
			await component.toPaymentStage();
			await second.toPaymentStage();

			expect(configure).toHaveBeenCalledTimes(2);

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
			orderRouter.payWithStripe.and.returnValue(payment.promise);

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
			orderRouter.payWithStripe.and.returnValue(payment.promise);

			await component.toPaymentStage();
			const first = tokenHandlers[0](cardToken('tok_first'));
			await settle();

			const second = (await createPayment()).componentInstance;
			await second.toPaymentStage();

			expect(configure).toHaveBeenCalledTimes(1);

			payment.resolve(paidOrder());
			await first;

			expect(second.paying).toBe(false);

			await second.toPaymentStage();

			expect(configure).toHaveBeenCalledTimes(2);
		});

		it('clears the guard after the email update fails', async () => {
			const emailUpdate = deferred<any>();
			userRouter.updateEmail.and.returnValue(emailUpdate.promise);

			await component.toPaymentStage();
			const first = tokenHandlers[0](cardToken('tok_first'));

			const second = (await createPayment()).componentInstance;
			await second.toPaymentStage();

			expect(configure).toHaveBeenCalledTimes(1);

			emailUpdate.reject(new Error('network down'));
			await first.catch(() => undefined);

			expect(second.paying).toBe(false);

			await second.toPaymentStage();

			expect(configure).toHaveBeenCalledTimes(2);
		});

		it('clears the guard after a saved-card payment is rejected', async () => {
			const payment = deferred<any>();
			orderRouter.payWithStripe.and.returnValue(payment.promise);

			component.userCard = savedCard();
			const first = component.payWithUserCard().catch((err) => err);

			const second = (await createPayment()).componentInstance;
			second.userCard = savedCard();
			const blocked = second.payWithUserCard().catch((err) => err);
			await settle();

			expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(1);

			payment.reject(new Error('Your card was declined.'));

			expect((await first).message).toBe('Your card was declined.');
			await blocked;

			orderRouter.payWithStripe.and.returnValue(
				Promise.resolve(paidOrder())
			);
			await second.payWithUserCard();

			expect(orderRouter.payWithStripe).toHaveBeenCalledTimes(2);
		});

		it('does not block a payment for a different order', async () => {
			const emailUpdate = deferred<any>();
			userRouter.updateEmail.and.returnValue(emailUpdate.promise);
			orderRouter.payWithStripe.and.returnValue(
				Promise.resolve(paidOrder())
			);

			await component.toPaymentStage();
			const first = tokenHandlers[0](cardToken('tok_first'));

			const second = (await createPayment()).componentInstance;
			await second.toPaymentStage();

			expect(configure).toHaveBeenCalledTimes(1);

			// The customer starts another order while the first payment
			// still runs.
			orderId.and.returnValue('order-2');

			await second.toPaymentStage();

			expect(configure).toHaveBeenCalledTimes(2);

			const other = tokenHandlers[1](cardToken('tok_other'));

			emailUpdate.resolve({ id: 'user-1' });
			await Promise.all([first, other]);

			expect(userRouter.addPaymentMethod).toHaveBeenCalledTimes(2);
			expect(orderRouter.payWithStripe.calls.allArgs()).toEqual(
				jasmine.arrayWithExactContents([
					['order-1', 'card-1'],
					['order-2', 'card-1'],
				])
			);
		});
	});
});
