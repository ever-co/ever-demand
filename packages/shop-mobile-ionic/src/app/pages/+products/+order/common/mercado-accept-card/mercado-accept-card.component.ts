import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, LoadingController } from '@ionic/angular';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import Order from '@modules/server.common/entities/Order';
import { IMercadoSavedCard } from '@modules/server.common/interfaces/IPayment';
import { Store } from 'app/services/store.service';
import { environment } from 'environments/environment';
import { Subscribable } from 'rxjs';
import { first } from 'rxjs/operators';
import User from '@modules/server.common/entities/User';

const ERROR_CODES = {
	E301: 'INVALID_CARD_NUMBER',
	E302: 'INVALID_SECURITY_CODE',
	'316': 'INVALID_NAME',
	'322': 'INVALID_DOCTYPE',
	'323': 'INVALID_DOC_SUBTYPE',
	'324': 'INVALID_DOC_NUMBER',
	'325': 'INVALID_MONTH',
	'326': 'INVALID_YEAR',
	default: 'DEFAULT',
};

@Component({
	selector: 'e-cu-mercado-accept-card',
	templateUrl: './mercado-accept-card.component.html',
	styleUrls: ['./mercado-accept-card.component.scss'],
})
export class MercadoAcceptCardComponent {
	@Input()
	order: Order;

	@Input()
	userCard: IMercadoSavedCard = null;

	@Input()
	public modalChange: EventEmitter<boolean>;

	user: User;
	expiryMonth: string;
	expiryYear: string;
	cardName: string;
	formGroup: FormGroup;

	documentTypes = [];
	cardThumbnail = '';
	paymentMethodId = '';
	hideSecondStep = true;
	loading = true;
	generalError = '';
	cardNumberError = '';

	private mercadoPublishableKey: string = environment.MERCADO_PUBLISHABLE_KEY;

	private headers: HttpHeaders = new HttpHeaders({
		'Content-Type': 'application/json',
	});

	constructor(
		private store: Store,
		private http: HttpClient,
		private orderRouter: OrderRouter,
		private modalController: ModalController,
		private userRouter: UserRouter,
		private fb: FormBuilder,
		private loadingController: LoadingController
	) {}

	ngOnInit(): void {
		(<any>window).Mercadopago.setPublishableKey(this.mercadoPublishableKey);

		console.log(this.userCard);

		this.getDocumentTypes().subscribe((res) => {
			if (res) {
				this.documentTypes = res;
				console.log(this.documentTypes);
			} else {
				console.log('error');
			}
		});

		this.userRouter.get(this.store.userId).subscribe((user) => {
			this.user = user;
			this.setSavedCard();
			this.loading = false;
			console.log(user);
		});
	}

	setSavedCard() {
		this.formGroup = this.fb.group({
			cardNumber: [
				{
					value: this.userCard
						? `**** **** **** ${this.userCard.last_four_digits}`
						: '',
					disabled: this.userCard,
				},
				[Validators.required],
			],
			cardExpirationMonth: [
				{
					value: this.userCard?.expiration_month,
					disabled: this.userCard,
				},
				[Validators.required],
			],
			cardExpirationYear: [
				{
					value: this.userCard?.expiration_year,
					disabled: this.userCard,
				},
				[Validators.required],
			],
			cardholderName: [
				{
					value: this.userCard?.cardholder.name,
					disabled: this.userCard,
				},
				[Validators.required],
			],
			securityCode: ['', [Validators.required]],
			email: [this.user?.email, [Validators.required]],
			docType: ['', [Validators.required]],
			docNumber: ['', [Validators.required]],
		});
		this.cardThumbnail = this.userCard?.payment_method?.thumbnail;
	}

	guessPaymentMethod(event) {
		let cardnumber = event.target.value;

		if (cardnumber.length >= 6) {
			let bin = cardnumber.substring(0, 6);
			(<any>window).Mercadopago.getPaymentMethod(
				{
					bin: bin,
				},
				(status, response) => this.setPaymentMethod(status, response)
			);
		}
	}

	setPaymentMethod(status, response) {
		console.log(response);
		if (status == 200) {
			this.cardThumbnail = response[0].thumbnail;
			this.paymentMethodId = response[0].id;
			this.getInstallments(this.paymentMethodId);
			this.hideSecondStep = false;
			this.cardNumberError = '';
		} else {
			this.cardNumberError = 'Please check the card number.';
		}
	}

	getInstallments(paymentMethodId: string) {
		(<any>window).Mercadopago.getInstallments(
			{
				payment_method_id: paymentMethodId,
				amount: this.order.totalPrice,
			},
			(status, response) => this.setInstallments(status, response)
		);
	}

	setInstallments(status, response) {
		if (status == 200) {
			(<any>window).document.getElementById(
				'installments'
			).options.length = 0;
			response[0].payer_costs.forEach((installment) => {
				let opt = document.createElement('option');
				opt.text = installment.recommended_message;
				opt.value = installment.installments;
				(<any>window).document
					.getElementById('installments')
					.appendChild(opt);
			});
			this.generalError = '';
		} else {
			this.generalError = 'Please try again';
		}
	}

	async doPay(event) {
		const loading = await this.loadingController.create({
			message: 'Processing payment',
		});
		loading.present();

		event.preventDefault();

		var $form = (<any>window).document.querySelector('#pay');

		(<any>window).Mercadopago.clearSession();
		(<any>window).Mercadopago.createToken($form, (status, response) =>
			this.userCard
				? this.savedCard(status, response, event, loading)
				: this.newCard(status, response, event, loading)
		);

		return false;
	}

	async savedCard(status, response, event, loading) {
		if (status != 200 && status != 201) {
			this.handlePaymentErrorResponse(response);
		} else {
			try {
				this.generalError = '';
				let order = await this.orderRouter.payWithMercado(
					this.store.orderId,
					response.id
				);
				console.log('Payment Done!');
				try {
					order = await this.orderRouter.confirm(this.store.orderId);
					console.log('Order Confirmed!');
					this.close(true);
				} catch (err) {
					console.error('Could not confirm the order!');
				}
			} catch (err) {
				alert('Payment Failed!');
				console.error('Payment Failed!', err);
			}
		}
		loading.dismiss();
	}

	async newCard(status, response, event, loading) {
		if (status != 200 && status != 201) {
			this.handlePaymentErrorResponse(response);
		} else {
			this.generalError = '';
			const description = `${this.order.orderNumber}: + ${(
				this.order.products || []
			)
				.map((product) => product.product.title)
				.toString()}}`;
			const transaction_amount = this.order.totalPrice;
			const installments = (<any>window).document.getElementById(
				'installments'
			).value;
			const payment_method_id = this.paymentMethodId;
			console.log({
				description,
				transaction_amount,
				installments,
				payment_method_id,
				token: response.id,
			});
			try {
				if (!this.user.email) {
					const user = await this.userRouter.updateEmail(
						this.store.userId,
						this.formGroup.value.email
					);
				}

				await this.userRouter.addPaymentMethodMercado(
					this.store.userId,
					response.id
				);

				try {
					let order = await this.orderRouter.payWithMercado(
						this.store.orderId,
						response.id
					);
					console.log('Payment Done!');
					try {
						order = await this.orderRouter.confirm(
							this.store.orderId
						);
						console.log('Order Confirmed!');
						this.close(true);
					} catch (err) {
						console.error('Could not confirm the order!');
					}
				} catch (err) {
					this.generalError = err.message;
					console.error('Payment Failed!', err);
				}
			} catch (err) {
				console.error('Mercado Payment Method creation failed!', err);
			}
		}
		loading.dismiss();
	}

	handlePaymentErrorResponse(response) {
		for (const cause of response.cause) {
			const errorCode = cause?.code || 'DEFAULT';
			const errorTranslation = ERROR_CODES[errorCode];
			switch (errorCode) {
				case 'E301':
					this.formGroup.controls['cardNumber'].setErrors({
						incorrect: true,
					});
					break;
				case 'E302':
					this.formGroup.controls['securityCode'].setErrors({
						incorrect: true,
					});
					break;
				case '316':
					this.formGroup.controls['cardholderName'].setErrors({
						incorrect: true,
					});
					break;
				case '322':
					this.formGroup.controls['docType'].setErrors({
						incorrect: true,
					});
					break;
				case '323':
					this.formGroup.controls['docNumber'].setErrors({
						incorrect: true,
					});
					break;
				case '324':
					this.formGroup.controls['docNumber'].setErrors({
						incorrect: true,
					});
					break;
				case '325':
					this.formGroup.controls['cardExpirationMonth'].setErrors({
						incorrect: true,
					});
					break;
				case '326':
					this.formGroup.controls['cardExpirationYear'].setErrors({
						incorrect: true,
					});
					break;
				default:
					break;
			}

			this.generalError = `PAYMENT.ERRORS.${errorTranslation}`;
		}
	}

	async close(closeListModal: boolean) {
		await this.modalController.dismiss();
		if (closeListModal && this.modalChange) {
			this.modalChange.emit(false);
		}
	}

	private getDocumentTypes(): Subscribable<any | null> {
		return this.http.get(
			'https://api.mercadopago.com/v1/identification_types?public_key=TEST-12d2d7a9-8add-491f-a9d2-c21c7c502f91',
			{ headers: this.headers }
		);
	}
}
