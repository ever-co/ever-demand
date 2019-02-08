import { Component, Input, ViewChild } from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';
import { IWarehouseCreateObject } from '@modules/server.common/interfaces/IWarehouse';
import { map } from 'rxjs/operators';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { Observable, concat } from 'rxjs';
import { pick } from 'lodash';
import { FormHelpers } from '../../../forms/helpers';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { environment } from 'environments/environment';
import { getDummyImage } from '@modules/server.common/utils';

export type WarehouseBasicInfo = Pick<
	IWarehouseCreateObject,
	| 'name'
	| 'logo'
	| 'isActive'
	| 'username'
	| 'hasRestrictedCarriers'
	| 'usedCarriersIds'
>;

@Component({
	selector: 'ea-warehouse-basic-info-form',
	styleUrls: ['basic-info-form.component.scss'],
	templateUrl: 'basic-info-form.component.html'
})
export class BasicInfoFormComponent {
	@ViewChild('fileInput')
	fileInput: any;
	public uploader: FileUploader;

	@Input()
	readonly form: FormGroup;

	@Input()
	readonly password?: AbstractControl;

	carriersOptions$: Observable<IMultiSelectOption[]> = concat(
		Observable.of([]),
		this.carrierRouter.getAllActive().pipe(
			map((carriers) =>
				carriers.map((c) => {
					return {
						id: c.id,
						name: `${c.firstName} ${c.lastName}`
					};
				})
			)
		)
	);

	static buildForm(formBuilder: FormBuilder): FormGroup {
		// would be used in the parent component and injected into this.form
		return formBuilder.group({
			name: [
				'',
				[
					Validators.required,
					Validators.minLength(3),
					Validators.maxLength(255)
				]
			],
			logo: [
				'',
				[
					(control: AbstractControl) => {
						const isEmpty = control.value === '';
						if (!isEmpty) {
							if (
								!control.value.startsWith('http') ||
								control.value.match(
									/s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/
								) === null
							) {
								return { validUrl: true };
							}
						}
						return null;
					}
				]
			],
			isActive: [true, [Validators.required]],
			username: ['', [Validators.required]],

			hasRestrictedCarriers: [false, [Validators.required]],
			usedCarriersIds: [[]]
		});
	}

	static buildPasswordForm(formBuilder: FormBuilder): AbstractControl {
		return new FormControl('', [Validators.required]);
	}

	getValue(): WarehouseBasicInfo {
		const basicInfo = this.form.getRawValue() as {
			name: string;
			logo: string;
			isActive: boolean;
			username: string;

			hasRestrictedCarriers: boolean;
			usedCarriersIds: string[];
		};

		if (!basicInfo.logo) {
			const letter = basicInfo.name.charAt(0).toUpperCase();
			basicInfo.logo = getDummyImage(300, 300, letter);
		}

		return {
			isActive: basicInfo.isActive,
			name: basicInfo.name,
			username: basicInfo.username,
			logo: basicInfo.logo,
			...(basicInfo.hasRestrictedCarriers
				? {
						hasRestrictedCarriers: basicInfo.hasRestrictedCarriers,
						usedCarriersIds: basicInfo.usedCarriersIds
				  }
				: {})
		};
	}

	public setValue<T extends WarehouseBasicInfo>(basicInfo: T) {
		FormHelpers.deepMark(this.form, 'dirty');

		this.form.setValue(
			pick(basicInfo, [
				...Object.keys(this.getValue()),
				'hasRestrictedCarriers',
				'usedCarriersIds'
			])
		);
	}

	getPassword(): string {
		// password is not part of warehouse
		if (!this.password) {
			throw new Error("Form doesn't contain password");
		}
		return this.password.value as string;
	}

	setPassword(value: string) {
		this.password.setValue(value);
	}

	constructor(private readonly carrierRouter: CarrierRouter) {
		this.uploaderConfig();
	}

	get name() {
		return this.form.get('name');
	}

	get logo() {
		return this.form.get('logo');
	}

	get isActive() {
		return this.form.get('isActive');
	}

	get username() {
		return this.form.get('username');
	}

	get hasRestrictedCarriers() {
		return this.form.get('hasRestrictedCarriers');
	}

	get usedCarriersIds() {
		return this.form.get('usedCarriersIds');
	}

	get showLogoMeta() {
		return this.logo && this.logo.value !== '';
	}

	imageUrlChanged() {
		this.uploader.queue[0].upload();

		this.uploader.onSuccessItem = (
			item: any,
			response: string,
			status: number
		) => {
			const data = JSON.parse(response);
			this.logo.setValue(data.url);
		};
	}

	deleteImg() {
		this.logo.setValue('');
	}

	private uploaderConfig() {
		const uploaderOptions: FileUploaderOptions = {
			url: environment.API_FILE_UPLOAD_URL,
			isHTML5: true,
			removeAfterUpload: true,
			headers: [
				{
					name: 'X-Requested-With',
					value: 'XMLHttpRequest'
				}
			]
		};
		this.uploader = new FileUploader(uploaderOptions);

		this.uploader.onBuildItemForm = (
			fileItem: any,
			form: FormData
		): any => {
			form.append('upload_preset', 'everbie-products-images');
			let tags = 'myphotoalbum';
			if (this.name.value) {
				form.append('context', `photo=${this.name.value}`);
				tags = `myphotoalbum,${this.name.value}`;
			}

			form.append('folder', 'angular_sample');
			form.append('tags', tags);
			form.append('file', fileItem);

			fileItem.withCredentials = false;
			return { fileItem, form };
		};
	}
}
