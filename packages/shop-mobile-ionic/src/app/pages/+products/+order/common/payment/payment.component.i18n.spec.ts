import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ModalController, Platform } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ORDER_ALREADY_PAID_ERROR } from '@modules/server.common/routers/IOrderRouter';
import { Store } from 'app/services/store.service';
import { settle } from 'app/testing/fake-socket';
import bgBG from 'assets/i18n/bg-BG.json';
import enUS from 'assets/i18n/en-US.json';
import esES from 'assets/i18n/es-ES.json';
import frFR from 'assets/i18n/fr-FR.json';
import heIL from 'assets/i18n/he-IL.json';
import ruRU from 'assets/i18n/ru-RU.json';
import { PaymentComponent } from './payment.component';

// Every locale the shop ships (see Store._initLanguage).
const locales: { [locale: string]: any } = {
	'bg-BG': bgBG,
	'en-US': enUS,
	'es-ES': esES,
	'fr-FR': frFR,
	'he-IL': heIL,
	'ru-RU': ruRU,
};

// The BUY_POPUP messages of one locale file, untyped so a missing key
// fails the spec instead of the build.
const messagesIn = (locale: string): any => locales[locale].BUY_POPUP;

// These specs load the real locale files, so they check the text the
// customer reads, in the language the app is set to.
describe('PaymentComponent failure messages', () => {
	describe('locale files', () => {
		Object.keys(locales).forEach((locale) => {
			it(`${locale} has a payment failed and an email not saved message`, () => {
				const messages = messagesIn(locale);

				expect(messages.PAYMENT_FAILED).toEqual(jasmine.any(String));
				expect(messages.PAYMENT_FAILED.trim()).not.toBe('');
				expect(messages.EMAIL_NOT_SAVED).toEqual(jasmine.any(String));
				expect(messages.EMAIL_NOT_SAVED.trim()).not.toBe('');
				expect(messages.EMAIL_NOT_SAVED).not.toBe(
					messages.PAYMENT_FAILED
				);
			});

			it(`${locale} has a card payment not available message`, () => {
				const messages = messagesIn(locale);

				expect(messages.CARD_PAYMENT_UNAVAILABLE).toEqual(
					jasmine.any(String)
				);
				expect(messages.CARD_PAYMENT_UNAVAILABLE.trim()).not.toBe('');
				expect(messages.CARD_PAYMENT_UNAVAILABLE).not.toBe(
					messages.PAYMENT_FAILED
				);
			});

			it(`${locale} has an order already paid message`, () => {
				const messages = messagesIn(locale);

				expect(messages.ORDER_ALREADY_PAID).toEqual(
					jasmine.any(String)
				);
				expect(messages.ORDER_ALREADY_PAID.trim()).not.toBe('');
				expect(messages.ORDER_ALREADY_PAID).not.toBe(
					messages.PAYMENT_FAILED
				);
			});

			it(`${locale} has a card form not loaded message`, () => {
				const messages = messagesIn(locale);

				expect(messages.CARD_FORM_NOT_LOADED).toEqual(
					jasmine.any(String)
				);
				expect(messages.CARD_FORM_NOT_LOADED.trim()).not.toBe('');
				expect(messages.CARD_FORM_NOT_LOADED).not.toBe(
					messages.PAYMENT_FAILED
				);
				// Card payment works in this app; only the form failed to load
				expect(messages.CARD_FORM_NOT_LOADED).not.toBe(
					messages.CARD_PAYMENT_UNAVAILABLE
				);
			});
		});

		it('does not say the email is already used by another account', () => {
			// Saying so would tell anyone who types an email whether it
			// has an account in the shop.
			expect(messagesIn('en-US').EMAIL_NOT_SAVED).toEqual(
				jasmine.any(String)
			);
			expect(messagesIn('en-US').EMAIL_NOT_SAVED).not.toMatch(
				/exist|already|another account|taken|belongs/i
			);
		});
	});

	describe('shown to the customer', () => {
		let userRouter: jasmine.SpyObj<UserRouter>;
		let orderRouter: jasmine.SpyObj<OrderRouter>;
		let translate: TranslateService;
		let tokenHandlers: ((token: any) => Promise<void>)[];
		let originalStripeCheckout: any;

		const cardToken = () => ({
			id: 'tok_first',
			email: 'customer@example.com',
		});

		const createPayment = async (): Promise<PaymentComponent> => {
			const fixture = TestBed.createComponent(PaymentComponent);
			fixture.componentInstance.order = {
				isPaid: false,
				products: [
					{ price: 10, product: { title: [], description: [] } },
				],
			} as any;
			// env.ts leaves the key empty, and the payment methods refuse to
			// run without one.
			(fixture.componentInstance as any).stripePublishableKey =
				'pk_test_payment_spec';
			// Lets getUserCard and the currency load finish.
			await settle();
			return fixture.componentInstance;
		};

		const useLocale = (locale: string) => {
			translate.setTranslation(locale, locales[locale]);
			translate.use(locale);
		};

		// What the server answers when the order was paid first
		const alreadyPaidError = (): Error => {
			const error = new Error('Order is already paid');
			error.name = ORDER_ALREADY_PAID_ERROR;
			return error;
		};

		beforeEach(async () => {
			tokenHandlers = [];
			originalStripeCheckout = (window as any).StripeCheckout;
			(window as any).StripeCheckout = {
				configure: (options) => {
					tokenHandlers.push(options.token);
					return { open: () => undefined };
				},
			};

			userRouter = jasmine.createSpyObj('UserRouter', [
				'getCards',
				'updateEmail',
				'addPaymentMethod',
			]);
			userRouter.getCards.and.returnValue(Promise.resolve([]));
			userRouter.updateEmail.and.returnValue(
				Promise.resolve({ id: 'user-1' } as any)
			);
			userRouter.addPaymentMethod.and.returnValue(
				Promise.resolve('card-1')
			);

			orderRouter = jasmine.createSpyObj('OrderRouter', [
				'payWithStripe',
				'confirm',
				'getStripeCurrency',
			]);
			orderRouter.getStripeCurrency.and.returnValue(
				Promise.resolve('usd')
			);

			const modalController = jasmine.createSpyObj('ModalController', [
				'dismiss',
				'create',
			]);

			await TestBed.configureTestingModule({
				declarations: [PaymentComponent],
				imports: [TranslateModule.forRoot()],
				providers: [
					{ provide: UserRouter, useValue: userRouter },
					{ provide: OrderRouter, useValue: orderRouter },
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

			// Store sets the app language when created, so create it before
			// a spec picks the locale.
			const store = TestBed.inject(Store);
			spyOnProperty(store, 'userId', 'get').and.returnValue('user-1');
			spyOnProperty(store, 'orderId', 'get').and.returnValue('order-1');
			translate = TestBed.inject(TranslateService);

			spyOn(window, 'alert');
			spyOn(console, 'log');
			spyOn(console, 'error');
		});

		afterEach(() => {
			(window as any).StripeCheckout = originalStripeCheckout;
		});

		Object.keys(locales).forEach((locale) => {
			it(`asks to check the email in ${locale}, without the server error, when the email update fails`, async () => {
				useLocale(locale);
				const error = new Error('E11000 duplicate key error: email');
				userRouter.updateEmail.and.rejectWith(error);
				const payment = await createPayment();

				await payment.toPaymentStage();
				await tokenHandlers[0](cardToken());

				const messages = messagesIn(locale);

				expect(window.alert).toHaveBeenCalledOnceWith(
					messages.EMAIL_NOT_SAVED
				);
				expect(window.alert).not.toHaveBeenCalledWith(
					messages.PAYMENT_FAILED
				);
				expect(messages.EMAIL_NOT_SAVED).not.toContain(error.message);
				expect(userRouter.addPaymentMethod).not.toHaveBeenCalled();
				expect(orderRouter.payWithStripe).not.toHaveBeenCalled();
			});

			it(`shows the ${locale} payment failed message when the new card is declined`, async () => {
				useLocale(locale);
				orderRouter.payWithStripe.and.rejectWith(
					new Error('Your card was declined.')
				);
				const payment = await createPayment();

				await payment.toPaymentStage();
				await tokenHandlers[0](cardToken());

				expect(window.alert).toHaveBeenCalledOnceWith(
					messagesIn(locale).PAYMENT_FAILED
				);
			});

			it(`says the order is already paid in ${locale}, not the server error, when the new card pays`, async () => {
				useLocale(locale);
				const error = alreadyPaidError();
				orderRouter.payWithStripe.and.rejectWith(error);
				const payment = await createPayment();

				await payment.toPaymentStage();
				await tokenHandlers[0](cardToken());

				const messages = messagesIn(locale);

				expect(window.alert).toHaveBeenCalledOnceWith(
					messages.ORDER_ALREADY_PAID
				);
				expect(window.alert).not.toHaveBeenCalledWith(
					messages.PAYMENT_FAILED
				);
				expect(window.alert).not.toHaveBeenCalledWith(error.message);
			});

			it(`says the order is already paid in ${locale} when the saved card pays`, async () => {
				useLocale(locale);
				orderRouter.payWithStripe.and.rejectWith(alreadyPaidError());
				const payment = await createPayment();
				payment.userCard = { id: 'card-saved', last4: '4242' } as any;

				await payment.payWithUserCard();

				const messages = messagesIn(locale);

				expect(window.alert).toHaveBeenCalledOnceWith(
					messages.ORDER_ALREADY_PAID
				);
				expect(window.alert).not.toHaveBeenCalledWith(
					messages.PAYMENT_FAILED
				);
			});
		});

		it('shows the payment failed message when saving the new card fails', async () => {
			useLocale('en-US');
			userRouter.addPaymentMethod.and.rejectWith(
				new Error('card_declined')
			);
			const payment = await createPayment();

			await payment.toPaymentStage();
			await tokenHandlers[0](cardToken());

			expect(window.alert).toHaveBeenCalledOnceWith(
				messagesIn('en-US').PAYMENT_FAILED
			);
			expect(orderRouter.payWithStripe).not.toHaveBeenCalled();
		});

		it('shows the payment failed message when the saved card is declined', async () => {
			useLocale('fr-FR');
			orderRouter.payWithStripe.and.rejectWith(
				new Error('Your card was declined.')
			);
			const payment = await createPayment();
			payment.userCard = { id: 'card-saved', last4: '4242' } as any;

			await payment.payWithUserCard();

			expect(window.alert).toHaveBeenCalledOnceWith(
				messagesIn('fr-FR').PAYMENT_FAILED
			);
		});

		it('shows the payment failed message when the charge currency could not be loaded', async () => {
			useLocale('he-IL');
			orderRouter.getStripeCurrency.and.rejectWith(
				new Error('network down')
			);
			const payment = await createPayment();

			await payment.toPaymentStage();

			expect(window.alert).toHaveBeenCalledOnceWith(
				messagesIn('he-IL').PAYMENT_FAILED
			);
		});

		it('says the card form did not load on Pay now when the Checkout script is missing', async () => {
			useLocale('es-ES');
			const payment = await createPayment();
			// A content blocker or no network kept checkout.js from loading
			delete (window as any).StripeCheckout;

			await expectAsync(payment.toPaymentStage()).toBeResolved();

			const messages = messagesIn('es-ES');

			expect(window.alert).toHaveBeenCalledOnceWith(
				messages.CARD_FORM_NOT_LOADED
			);
			expect(window.alert).not.toHaveBeenCalledWith(
				messages.PAYMENT_FAILED
			);
			expect(tokenHandlers.length).toBe(0);
		});

		describe('when the build has no Stripe publishable key', () => {
			const withoutKey = async (): Promise<PaymentComponent> => {
				const payment = await createPayment();
				(payment as any).stripePublishableKey = '';
				return payment;
			};

			it('says card payment is not available on Pay now', async () => {
				useLocale('ru-RU');
				const payment = await withoutKey();

				await expectAsync(payment.toPaymentStage()).toBeResolved();

				expect(window.alert).toHaveBeenCalledOnceWith(
					messagesIn('ru-RU').CARD_PAYMENT_UNAVAILABLE
				);
				expect(tokenHandlers.length).toBe(0);
			});

			it('says card payment is not available on Pay with card', async () => {
				useLocale('bg-BG');
				const payment = await withoutKey();
				payment.userCard = { id: 'card-saved', last4: '4242' } as any;

				await expectAsync(payment.payWithUserCard()).toBeResolved();

				expect(window.alert).toHaveBeenCalledOnceWith(
					messagesIn('bg-BG').CARD_PAYMENT_UNAVAILABLE
				);
				expect(orderRouter.payWithStripe).not.toHaveBeenCalled();
			});
		});
	});
});
