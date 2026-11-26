import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ModalController, Platform } from '@ionic/angular/lazy';
import { TranslateService } from '@ngx-translate/core';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { Store } from 'app/services/store.service';
import { settle } from 'app/testing/fake-socket';
import bgBG from 'assets/i18n/bg-BG.json';
import enUS from 'assets/i18n/en-US.json';
import esES from 'assets/i18n/es-ES.json';
import frFR from 'assets/i18n/fr-FR.json';
import heIL from 'assets/i18n/he-IL.json';
import ruRU from 'assets/i18n/ru-RU.json';
import { PaymentComponent } from './payment.component';
import { vi } from 'vitest';
import { createSpyObj, type SpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

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

				expect(messages.PAYMENT_FAILED).toEqual(expect.any(String));
				expect(messages.PAYMENT_FAILED.trim()).not.toBe('');
				expect(messages.EMAIL_NOT_SAVED).toEqual(expect.any(String));
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
		});

		it('does not say the email is already used by another account', () => {
			// Saying so would tell anyone who types an email whether it
			// has an account in the shop.
			expect(messagesIn('en-US').EMAIL_NOT_SAVED).toEqual(
				expect.any(String)
			);
			expect(messagesIn('en-US').EMAIL_NOT_SAVED).not.toMatch(
				/exist|already|another account|taken|belongs/i
			);
		});
	});

	describe('shown to the customer', () => {
		let userRouter: SpyObj<UserRouter>;
		let orderRouter: SpyObj<OrderRouter>;
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

		beforeEach(async () => {
			tokenHandlers = [];
			originalStripeCheckout = (window as any).StripeCheckout;
			(window as any).StripeCheckout = {
				configure: (options) => {
					tokenHandlers.push(options.token);
					return { open: () => undefined };
				},
			};

			userRouter = createSpyObj('UserRouter', [
				'getCards',
				'updateEmail',
				'addPaymentMethod',
			]);
			userRouter.getCards.mockReturnValue(Promise.resolve([]));
			userRouter.updateEmail.mockReturnValue(
				Promise.resolve({ id: 'user-1' } as any)
			);
			userRouter.addPaymentMethod.mockReturnValue(
				Promise.resolve('card-1')
			);

			orderRouter = createSpyObj('OrderRouter', [
				'payWithStripe',
				'confirm',
				'getStripeCurrency',
			]);
			orderRouter.getStripeCurrency.mockReturnValue(
				Promise.resolve('usd')
			);

			const modalController = createSpyObj('ModalController', [
				'dismiss',
				'create',
			]);

			await TestBed.configureTestingModule({
				declarations: [PaymentComponent],
				imports: [...translateTesting()],
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
			vi.spyOn(store, 'userId', 'get').mockReturnValue('user-1');
			vi.spyOn(store, 'orderId', 'get').mockReturnValue('order-1');
			translate = TestBed.inject(TranslateService);

			vi.spyOn(window, 'alert').mockImplementation(() => undefined);
			vi.spyOn(console, 'log').mockImplementation(() => undefined);
			vi.spyOn(console, 'error').mockImplementation(() => undefined);
		});

		afterEach(() => {
			(window as any).StripeCheckout = originalStripeCheckout;
		});

		Object.keys(locales).forEach((locale) => {
			it(`asks to check the email in ${locale}, without the server error, when the email update fails`, async () => {
				useLocale(locale);
				const error = new Error('E11000 duplicate key error: email');
				userRouter.updateEmail.mockRejectedValue(error);
				const payment = await createPayment();

				await payment.toPaymentStage();
				await tokenHandlers[0](cardToken());

				const messages = messagesIn(locale);

				expect(window.alert).toHaveBeenCalledExactlyOnceWith(
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
				orderRouter.payWithStripe.mockRejectedValue(
					new Error('Your card was declined.')
				);
				const payment = await createPayment();

				await payment.toPaymentStage();
				await tokenHandlers[0](cardToken());

				expect(window.alert).toHaveBeenCalledExactlyOnceWith(
					messagesIn(locale).PAYMENT_FAILED
				);
			});
		});

		it('shows the payment failed message when saving the new card fails', async () => {
			useLocale('en-US');
			userRouter.addPaymentMethod.mockRejectedValue(
				new Error('card_declined')
			);
			const payment = await createPayment();

			await payment.toPaymentStage();
			await tokenHandlers[0](cardToken());

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				messagesIn('en-US').PAYMENT_FAILED
			);
			expect(orderRouter.payWithStripe).not.toHaveBeenCalled();
		});

		it('shows the payment failed message when the saved card is declined', async () => {
			useLocale('fr-FR');
			orderRouter.payWithStripe.mockRejectedValue(
				new Error('Your card was declined.')
			);
			const payment = await createPayment();
			payment.userCard = { id: 'card-saved', last4: '4242' } as any;

			await payment.payWithUserCard();

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				messagesIn('fr-FR').PAYMENT_FAILED
			);
		});

		it('shows the payment failed message when the charge currency could not be loaded', async () => {
			useLocale('he-IL');
			orderRouter.getStripeCurrency.mockRejectedValue(
				new Error('network down')
			);
			const payment = await createPayment();

			await payment.toPaymentStage();

			expect(window.alert).toHaveBeenCalledExactlyOnceWith(
				messagesIn('he-IL').PAYMENT_FAILED
			);
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
