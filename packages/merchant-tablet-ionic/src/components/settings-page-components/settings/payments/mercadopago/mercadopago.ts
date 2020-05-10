import {
	OnInit,
	OnDestroy,
	Component,
	Input,
	Output,
	EventEmitter,
} from '@angular/core';
import { Subject } from 'rxjs';
import {
	FormGroup,
	AbstractControl,
	FormBuilder,
	Validators,
} from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import IPaymentGatewayCreateObject from '@modules/server.common/interfaces/IPaymentGateway';
import PaymentGateways from '@modules/server.common/enums/PaymentGateways';

@Component({
	selector: 'e-cu-mercadopago-gateway',
	templateUrl: './mercadopago.html',
	styleUrls: ['mercadopago.scss', '../mutation/mutation.scss'],
})
export class MercadopagoGatewayComponent implements OnInit, OnDestroy {
	@Input()
	currenciesCodes: string[] = [];
	@Input()
	defaultCurrency: string;
	@Input()
	data: {
		currency: string;
		publishableKey: string;
		secretKey: string;
		payButtontext: boolean;
	};
	@Input()
	isValid: boolean;

	@Output()
	isValidChange = new EventEmitter();
	@Output()
	configureObject = new Subject();

	form: FormGroup;

	currency: AbstractControl;
	publishableKey: AbstractControl;
	secretKey: AbstractControl;
	payButtontext: AbstractControl;

	mercadopagoTypes = ['sandbox', 'live'];

	private _ngDestroy$ = new Subject<void>();

	constructor(private formBuilder: FormBuilder) {}

	ngOnInit() {
		this.buildForm(this.formBuilder);
		this.bindFormControls();
		this.onFormChanges();
	}

	ngOnDestroy(): void {
		this.configureObject.next(this.getConfigureObject());
	}

	private buildForm(formBuilder: FormBuilder) {
		this.form = formBuilder.group({
			currency: [
				this.data ? this.data.currency : this.defaultCurrency,
				[Validators.required],
			],
			publishableKey: [
				this.data ? this.data.publishableKey : '',
				[Validators.required],
			],
			secretKey: [
				this.data ? this.data.secretKey : '',
				Validators.required,
			],
			payButtontext: [
				this.data ? this.data.payButtontext : '',
				Validators.required,
			],
		});
	}

	private bindFormControls() {
		this.currency = this.form.get('currency');
		this.publishableKey = this.form.get('publishableKey');
		this.secretKey = this.form.get('secretKey');
		this.payButtontext = this.form.get('payButtontext');
	}

	private onFormChanges() {
		this.form.statusChanges
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((value) => {
				this.isValid = this.form.valid;
				this.isValidChange.emit(this.isValid);
			});
	}

	private getConfigureObject(): IPaymentGatewayCreateObject {
		return {
			paymentGateway: PaymentGateways.MercadoPago,
			configureObject: this.form.getRawValue(),
		};
	}
}
