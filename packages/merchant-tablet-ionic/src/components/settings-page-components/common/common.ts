import { Component, Input, OnChanges } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	AbstractControl,
	Validators,
} from '@angular/forms';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { AlertController } from '@ionic/angular';

@Component({
	selector: 'merchant-common',
	templateUrl: 'common.html',
})
export class CommonComponent implements OnChanges {
	commonForm: FormGroup;
	name: AbstractControl;
	logo: AbstractControl;
	email: AbstractControl;
	phone: AbstractControl;

	@Input()
	private currWarehouse: Warehouse;

	constructor(
		private formBuilder: FormBuilder,
		private warehouseRouter: WarehouseRouter,
		public alertController: AlertController
	) {
		this.buildForm();
		this.bindFormControls();
	}

	async saveChanges() {
		this.prepareUpdate();
		await this.warehouseRouter.save(this.currWarehouse);
		const alert = await this.alertController.create({
			cssClass: 'success-info',
			message: 'Successfully saved changes',
			buttons: ['OK'],
		});

		await alert.present();
	}

	ngOnChanges(): void {
		if (this.currWarehouse) {
			this.loadData();
		}
	}

	prepareUpdate() {
		this.currWarehouse.name = this.name.value;
		this.currWarehouse.logo = this.logo.value;
		this.currWarehouse.contactPhone = this.phone.value;
		this.currWarehouse.contactEmail = this.email.value;
	}

	loadData() {
		this.name.setValue(this.currWarehouse.name);
		this.logo.setValue(this.currWarehouse.logo);
		this.email.setValue(this.currWarehouse.contactEmail);
		this.phone.setValue(this.currWarehouse.contactPhone);
	}

	buildForm() {
		this.commonForm = this.formBuilder.group({
			name: ['', Validators.required],
			logo: [''],
			email: [''],
			phone: [''],
		});
	}

	bindFormControls() {
		this.name = this.commonForm.get('name');
		this.logo = this.commonForm.get('logo');
		this.email = this.commonForm.get('email');
		this.phone = this.commonForm.get('phone');
	}

	deleteImg() {
		this.logo.setValue('');
	}
}
