import { Component, Input, OnInit, OnChanges, OnDestroy } from '@angular/core';
import {
	FormGroup,
	FormBuilder,
	Validators,
	AbstractControl,
} from '@angular/forms';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { AlertController } from '@ionic/angular';

@Component({
	selector: 'merchant-account',
	templateUrl: 'account.html',
})
export class AccountComponent implements OnInit, OnChanges, OnDestroy {
	accountForm: FormGroup;
	username: AbstractControl;
	oldPassword: AbstractControl;
	password: AbstractControl;
	repeatPassword: AbstractControl;
	$password: any;

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
		if (this.password.value) {
			try {
				await this.warehouseRouter.updatePassword(
					this.currWarehouse.id,
					{
						current: this.oldPassword.value,
						new: this.password.value,
					}
				);
			} catch (error) {
				const alertError = await this.alertController.create({
					cssClass: 'error-info',
					message: error.message,
					buttons: ['OK'],
				});

				await alertError.present();

				return;
			}
		}
		const alertSuccess = await this.alertController.create({
			cssClass: 'success-info',
			message: 'Successfully saved changes',
			buttons: ['OK'],
		});

		await alertSuccess.present();
	}

	ngOnChanges(): void {
		if (this.currWarehouse) {
			this.username.setValue(this.currWarehouse.username);
		}
	}

	buildForm() {
		this.accountForm = this.formBuilder.group({
			username: ['', Validators.minLength(4)],
			password: [''],
			oldPassword: [''],
			repeatPassword: [
				'',
				[
					(control: AbstractControl) => {
						if (this.password) {
							return control.value === this.password.value
								? null
								: { validUrl: true };
						} else {
							return null;
						}
					},
				],
			],
		});
	}

	bindFormControls() {
		this.username = this.accountForm.get('username');
		this.oldPassword = this.accountForm.get('oldPassword');
		this.password = this.accountForm.get('password');
		this.repeatPassword = this.accountForm.get('repeatPassword');
	}

	prepareUpdate() {
		this.currWarehouse.username = this.username.value;
	}

	ngOnInit(): void {
		this.$password = this.password.valueChanges.subscribe((res) => {
			this.repeatPassword.setValue('');
		});
	}

	ngOnDestroy(): void {
		if (this.$password) {
			this.$password.unsubscribe();
		}
	}
}
