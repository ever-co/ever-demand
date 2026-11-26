import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	Input,
	NgZone,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
// Types only: a value import of '@stripe/stripe-js' would add the script.
import type {
	Stripe,
	StripeCardElement,
	StripeElementLocale,
	StripeError,
} from '@stripe/stripe-js';

// The card token the server saves the card from (userRouter.addPaymentMethod)
// and the email it saves for the customer (userRouter.updateEmail): what the
// Stripe Checkout token callback got.
export interface CardFormToken {
	// Stripe card token id, tok_...
	id: string;
	email: string;
}

// The role the card form is dismissed with when it made a card token.
export const CARD_TOKEN_ROLE = 'token';

export type CardFormDismiss = (
	token?: CardFormToken,
	role?: string
) => Promise<boolean>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The shop's languages (Store._initLanguage) in Stripe's locale names, so
// the card fields and their messages are in the app language.
const STRIPE_LOCALES: { [language: string]: StripeElementLocale } = {
	'bg-BG': 'bg',
	'en-US': 'en',
	'es-ES': 'es',
	'fr-FR': 'fr',
	'he-IL': 'he',
	'ru-RU': 'ru',
};

// Stripe's own messages for these are written for the customer and come in
// the card form's locale ("Your card number is incomplete."). Any other
// error (no connection, a bad key, Stripe down) gets the app's message.
const CUSTOMER_FACING_ERRORS: StripeError['type'][] = [
	'validation_error',
	'card_error',
];

// The new-card form behind Pay now, in place of the legacy Stripe Checkout
// popup: the product, the email and a Stripe Card Element. Pay makes a card
// token with Stripe.js (stripe.createToken) and dismisses the form with it;
// StripeCardForm hands the token to the payment. A card the form cannot
// tokenize stays in the form with Stripe's message.
//
// Standalone, so no NgModule declares it: StripeCardForm opens it with the
// ModalController and passes these inputs as componentProps.
@Component({
	changeDetection: ChangeDetectionStrategy.Eager,
	selector: 'e-cu-stripe-card-modal',
	imports: [FormsModule, TranslatePipe],
	templateUrl: './stripe-card-modal.component.html',
	styleUrls: ['./stripe-card-modal.component.scss'],
})
export class StripeCardModalComponent
	implements OnInit, AfterViewInit, OnDestroy
{
	// Stripe.js for the app's key (StripeLoader)
	@Input()
	stripe: Stripe;
	// STRIPE_POP_UP_LOGO, the image Checkout showed
	@Input()
	image: string;
	// The product title and description, in the app language
	@Input()
	name: string;
	@Input()
	description: string;
	// In the currency's smallest unit (cents), as Checkout took it
	@Input()
	amount: number;
	// The currency the server charges in, e.g. 'USD'
	@Input()
	currency: string;
	// Dismisses this form's modal
	@Input()
	dismiss: CardFormDismiss;

	@ViewChild('card', { static: true })
	cardHost: ElementRef<HTMLElement>;

	email: string = '';
	emailError: string | null = null;
	cardError: string | null = null;
	// True while Stripe makes the card token
	creatingToken: boolean = false;
	amountText: string = '';

	private card: StripeCardElement | null = null;

	constructor(
		private readonly _translateService: TranslateService,
		private readonly _zone: NgZone
	) {}

	ngOnInit(): void {
		this.amountText = this.formatAmount();
	}

	ngAfterViewInit(): void {
		const elements = this.stripe.elements({
			locale: STRIPE_LOCALES[this.language()] ?? 'auto',
		});

		this.card = elements.create('card', {
			// Checkout asked for no postal code and had "remember me" off
			hidePostalCode: true,
			disableLink: true,
			style: {
				base: {
					color: '#2a2c39',
					fontSize: '16px',
					'::placeholder': { color: '#8a8c99' },
				},
				invalid: { color: '#bd4742' },
			},
		});

		// Stripe.js calls back from its iframe messages, outside the Angular
		// zone: run in it, so the message shows.
		this.card.on('change', (event) =>
			this._zone.run(() => {
				this.cardError = event.error ? event.error.message : null;
			})
		);

		this.card.mount(this.cardHost.nativeElement);
	}

	ngOnDestroy(): void {
		this.card?.destroy();
		this.card = null;
	}

	async pay(): Promise<void> {
		if (this.creatingToken || this.card == null) {
			return;
		}

		const email = this.email.trim();

		if (!EMAIL.test(email)) {
			this.emailError = this._translateService.instant(
				'BUY_POPUP.CARD_FORM.EMAIL_INVALID'
			);
			return;
		}

		this.emailError = null;
		this.cardError = null;
		this.creatingToken = true;

		try {
			// Checkout gave the card the customer's email as its name.
			const result = await this.stripe.createToken(this.card, {
				name: email,
			});

			if (result.token) {
				await this.dismiss({ id: result.token.id, email }, CARD_TOKEN_ROLE);
				return;
			}

			this.cardError = this.cardErrorMessage(result.error);
			console.error('Could not create the card token!', result.error);
		} catch (err) {
			this.cardError = this._translateService.instant(
				'BUY_POPUP.PAYMENT_FAILED'
			);
			console.error('Could not create the card token!', err);
		} finally {
			this.creatingToken = false;
		}
	}

	cancel(): void {
		void this.dismiss(undefined, 'cancel');
	}

	focusCard(): void {
		this.card?.focus();
	}

	private cardErrorMessage(error: StripeError | undefined): string {
		return error?.message && CUSTOMER_FACING_ERRORS.includes(error.type)
			? error.message
			: this._translateService.instant('BUY_POPUP.PAYMENT_FAILED');
	}

	private language(): string {
		return this._translateService.getCurrentLang() ?? 'en-US';
	}

	// "$10.00" for 1000 USD cents, in the app language. Checkout formatted
	// the amount it got in the currency's smallest unit the same way.
	private formatAmount(): string {
		try {
			const format = new Intl.NumberFormat(this.language(), {
				style: 'currency',
				currency: this.currency,
			});
			const digits = format.resolvedOptions().maximumFractionDigits ?? 2;

			return format.format(this.amount / 10 ** digits);
		} catch {
			return `${(this.amount / 100).toFixed(2)} ${this.currency}`;
		}
	}
}
