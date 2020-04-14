import {
	Component,
	ViewChild,
	Input,
	AfterViewInit,
	OnInit,
} from '@angular/core';
import { BasicInfoFormComponent } from '@app/@shared/carrier/forms/basic-info/basic-info-form.component';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { first } from 'rxjs/operators';

@Component({
	selector: 'ea-merchants-setup-add-new-carrier',
	templateUrl: './add-new-carrier.component.html',
})
export class SetupMerchantAddNewCarrierComponent
	implements AfterViewInit, OnInit {
	@ViewChild('basicInfoForm', { static: true })
	basicInfoForm: BasicInfoFormComponent;

	@Input()
	carrierId: string;

	form: FormGroup = this.formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this.formBuilder),
		password: BasicInfoFormComponent.buildPasswordForm(this.formBuilder),
	});

	readonly basicInfo = this.form.get('basicInfo') as FormControl;
	password: FormControl;

	constructor(
		private readonly formBuilder: FormBuilder,
		private carrierRouter: CarrierRouter
	) {}

	ngOnInit(): void {
		if (!this.carrierId) {
			this.password = this.form.get('password') as FormControl;
		}
	}

	ngAfterViewInit(): void {
		this.laodData();
	}

	private async laodData() {
		if (this.carrierId) {
			const carrier = await this.carrierRouter
				.get(this.carrierId)
				.pipe(first())
				.toPromise();

			this.basicInfoForm.setValue(carrier);
		}
	}
}
