import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
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

	const cardToken = (id: string) => ({
		id,
		email: 'customer@example.com',
	});

	const paidOrder = () => ({ id: 'order-1', isPaid: true } as any);

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
				{
					provide: Store,
					useValue: { userId: 'user-1', orderId: 'order-1' },
				},
				{ provide: ModalController, useValue: modalController },
				{
					provide: ProductLocalesService,
					useValue: { getTranslate: () => 'Product' },
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		spyOn(window, 'alert');
		spyOn(console, 'log');
		spyOn(console, 'error');

		fixture = TestBed.createComponent(PaymentComponent);
		component = fixture.componentInstance;
		component.order = {
			isPaid: false,
			products: [{ price: 10, product: { title: [], description: [] } }],
		} as any;
		// env.ts leaves the key empty, and toPaymentStage refuses to run
		// without one.
		(component as any).stripePublishableKey = 'pk_test_payment_spec';

		// getUserCard finds no saved card, so the Pay now button shows.
		await settle();
		fixture.detectChanges();
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
});
