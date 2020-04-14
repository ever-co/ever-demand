import {
	Component,
	OnInit,
	Input,
	OnDestroy,
	Output,
	EventEmitter,
} from '@angular/core';
import {
	FormGroup,
	AbstractControl,
	FormBuilder,
	Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import PaymentGateways from '@modules/server.common/enums/PaymentGateways';
import { IPaymentGatewayCreateObject } from '@modules/server.common/interfaces/IPaymentGateway';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'e-cu-stripe-gateway',
	templateUrl: './stripe.html',
	styleUrls: ['stripe.scss', '../mutation/mutation.scss'],
})
export class StripeGatewayComponent implements OnInit, OnDestroy {
	@Input()
	currenciesCodes: string[] = [];
	@Input()
	defaultCompanyBrandLogo: string;
	@Input()
	defaultCurrency: string;
	@Input()
	data: {
		payButtontext: string;
		currency: string;
		companyBrandLogo: string;
		publishableKey: string;
		allowRememberMe: boolean;
	};
	@Input()
	isValid: boolean;

	@Output()
	isValidChange = new EventEmitter();
	@Output()
	configureObject = new Subject();

	form: FormGroup;

	payButtontext: AbstractControl;
	currency: AbstractControl;
	companyBrandLogo: AbstractControl;
	publishableKey: AbstractControl;
	allowRememberMe: AbstractControl;
	invalidUrl: boolean;

	private _ngDestroy$ = new Subject<void>();

	constructor(private formBuilder: FormBuilder) {}

	ngOnInit() {
		this.buildForm(this.formBuilder);
		this.bindFormControls();
		this.onFormChanges();
	}

	deleteImg() {
		this.companyBrandLogo.setValue('');
	}

	ngOnDestroy(): void {
		this.configureObject.next(this.getConfigureObject());
	}

	onUrlChanges(isInvalid: boolean) {
		this.invalidUrl = isInvalid;
		this.isValid = this.form.valid && !isInvalid;
		this.isValidChange.emit(this.isValid);
	}

	private buildForm(formBuilder: FormBuilder) {
		this.form = formBuilder.group({
			payButtontext: [
				this.data ? this.data.payButtontext : '',
				[Validators.required],
			],
			currency: [
				this.data ? this.data.currency : this.defaultCurrency,
				[Validators.required],
			],
			companyBrandLogo: [
				this.data
					? this.data.companyBrandLogo
					: this.defaultCompanyBrandLogo,
				[Validators.required],
			],
			publishableKey: [
				this.data ? this.data.publishableKey : '',
				Validators.required,
			],
			allowRememberMe: [this.data ? this.data.allowRememberMe : ''],
		});
	}

	private bindFormControls() {
		this.payButtontext = this.form.get('payButtontext');
		this.currency = this.form.get('currency');
		this.companyBrandLogo = this.form.get('companyBrandLogo');
		this.publishableKey = this.form.get('publishableKey');
		this.allowRememberMe = this.form.get('allowRememberMe');
	}

	private getConfigureObject(): IPaymentGatewayCreateObject {
		return {
			paymentGateway: PaymentGateways.Stripe,
			configureObject: this.form.getRawValue(),
		};
	}

	private onFormChanges() {
		this.form.statusChanges
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((value) => {
				this.isValid = this.form.valid && !this.invalidUrl;
				this.isValidChange.emit(this.isValid);
			});
	}
}
