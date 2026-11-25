import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController, Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import {
	Router,
	RouterFactory,
	RoutersService,
} from '@modules/client.common.angular2/lib/router';
import { Store } from 'app/services/store.service';
import { FakeSocket, settle, track } from 'app/testing/fake-socket';
import { PaymentComponent } from './payment.component';

// payWithStripe goes through the real OrderRouter, Router and Request
// over a fake socket, so these specs cover what the customer sees when
// the network drops after the server got the payment request.
describe('PaymentComponent when the socket drops during a payment', () => {
	let fixture: ComponentFixture<PaymentComponent>;
	let component: PaymentComponent;
	let store: Store;
	let socket: FakeSocket;
	let tokenHandlers: ((token: any) => Promise<void>)[];
	let originalStripeCheckout: any;

	const savedCard = () => ({ id: 'card-saved', last4: '4242' } as any);

	const payButton = (): HTMLButtonElement => {
		fixture.detectChanges();
		return fixture.nativeElement.querySelector('button');
	};

	beforeEach(async () => {
		socket = new FakeSocket();

		tokenHandlers = [];
		originalStripeCheckout = (window as any).StripeCheckout;
		(window as any).StripeCheckout = {
			configure: (options) => {
				tokenHandlers.push(options.token);
				return { open: () => undefined };
			},
		};

		const userRouter = jasmine.createSpyObj('UserRouter', [
			'getCards',
			'updateEmail',
			'addPaymentMethod',
		]);
		userRouter.getCards.and.returnValue(Promise.resolve([]));
		userRouter.updateEmail.and.returnValue(
			Promise.resolve({ id: 'user-1' } as any)
		);
		userRouter.addPaymentMethod.and.returnValue(Promise.resolve('card-1'));

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
				OrderRouter,
				{
					provide: RouterFactory,
					useValue: {
						create: (name: string) =>
							new Router(
								{ build: () => socket.asSocket() } as any,
								new RoutersService(),
								name,
								'http://api.test'
							),
					},
				},
				{ provide: UserRouter, useValue: userRouter },
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

		store = TestBed.inject(Store);
		spyOnProperty(store, 'userId', 'get').and.returnValue('user-1');
		spyOnProperty(store, 'orderId', 'get').and.returnValue('order-1');

		spyOn(window, 'alert');
		spyOn(console, 'log');
		spyOn(console, 'error');

		fixture = TestBed.createComponent(PaymentComponent);
		component = fixture.componentInstance;
		component.order = {
			isPaid: false,
			products: [{ price: 10, product: { title: [], description: [] } }],
		} as any;
		// env.ts leaves the key empty, and the payment methods refuse to
		// run without one.
		(component as any).stripePublishableKey = 'pk_test_payment_spec';
		await settle();

		// The component asks for the card charge currency when created.
		socket.answer('getStripeCurrency', null, 'ils');
		await settle();
	});

	afterEach(() => {
		(window as any).StripeCheckout = originalStripeCheckout;
	});

	it('rejects a saved-card payment and frees Pay with card when the socket drops before the answer', async () => {
		component.userCard = savedCard();
		const outcome = track(component.payWithUserCard());
		await settle();

		expect(socket.sent.map((sent) => sent.event)).toEqual([
			'getStripeCurrency',
			'payWithStripe',
		]);
		// No popup, so no shown currency is sent
		expect(socket.sent[1].args).toEqual(['order-1', 'card-saved']);
		expect(component.paying).toBe(true);
		expect(store.isPaying('order-1')).toBe(true);
		expect(payButton().disabled).toBe(true);

		socket.disconnect();
		await settle();

		expect(component.paying).toBe(false);
		expect(store.isPaying('order-1')).toBe(false);
		expect(payButton().textContent).toContain(
			'BUY_POPUP.BUTTONS.PAY_WITH_FIXED_CARD'
		);
		expect(payButton().disabled).toBe(false);
		expect(outcome.error).toEqual(
			jasmine.objectContaining({ name: 'SocketDisconnectedError' })
		);
	});

	it('shows Payment Failed and frees Pay now when the socket drops before the new-card charge is answered', async () => {
		await component.toPaymentStage();
		const outcome = track(
			tokenHandlers[0]({ id: 'tok_first', email: 'customer@example.com' })
		);
		await settle();

		expect(socket.sent.map((sent) => sent.event)).toEqual([
			'getStripeCurrency',
			'payWithStripe',
		]);
		// The currency shown in the popup goes with the charge
		expect(socket.sent[1].args).toEqual(['order-1', 'card-1', 'ILS']);
		expect(store.isPaying('order-1')).toBe(true);
		expect(payButton().disabled).toBe(true);

		socket.disconnect();
		await settle();

		expect(component.paying).toBe(false);
		expect(store.isPaying('order-1')).toBe(false);
		expect(payButton().textContent).toContain('BUY_POPUP.BUTTONS.PAY_NOW');
		expect(payButton().disabled).toBe(false);
		expect(window.alert).toHaveBeenCalledWith('Payment Failed!');
		expect(console.error).toHaveBeenCalledWith(
			'Payment Failed!',
			jasmine.objectContaining({ name: 'SocketDisconnectedError' })
		);
		expect(outcome.settled).toBe(true);
	});
});
