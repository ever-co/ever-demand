import {
	Component,
	Input,
	ViewChild,
	ElementRef,
	AfterViewInit
} from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';
import { ICarrierCreateObject } from '@modules/server.common/interfaces/ICarrier';
import * as _ from 'lodash';
import { FormHelpers } from '../../../forms/helpers';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { environment } from 'environments/environment';
import * as isUrl from 'is-url';

export type CarrierBasicInfo = Pick<
	ICarrierCreateObject,
	| 'isDeleted'
	| 'username'
	| 'phone'
	| 'firstName'
	| 'lastName'
	| 'logo'
	| 'apartment'
>;

@Component({
	selector: 'ea-carrier-basic-info-form',
	templateUrl: 'basic-info-form.component.html',
	styleUrls: ['basic-info-form.component.scss']
})
export class BasicInfoFormComponent implements AfterViewInit {
	@ViewChild('logoImagePreview')
	logoImagePreview: ElementRef;

	uploader: FileUploader;

	@Input()
	readonly form: FormGroup;

	@Input()
	readonly password?: AbstractControl;

	constructor() {
		this.uploaderConfig();
	}

	get isActive() {
		return this.form.get('isActive');
	}

	get username() {
		return this.form.get('username');
	}

	get phone() {
		return this.form.get('phone');
	}

	get firstName() {
		return this.form.get('firstName');
	}

	get lastName() {
		return this.form.get('lastName');
	}

	get logo() {
		return this.form.get('logo');
	}

	get showLogoMeta() {
		return this.logo && this.logo.value !== '';
	}

	get isFirstNameValid(): boolean {
		return (
			this.firstName.errors &&
			(this.firstName.dirty || this.firstName.touched)
		);
	}

	get isLastNameValid(): boolean {
		return (
			this.lastName.errors &&
			(this.lastName.dirty || this.lastName.touched)
		);
	}

	get isActiveValid(): boolean {
		return (
			this.isActive.errors &&
			(this.isActive.dirty || this.isActive.touched)
		);
	}

	get isPhoneValid(): boolean {
		return this.phone.errors && (this.phone.dirty || this.phone.touched);
	}

	get isUsernameValid(): boolean {
		return (
			this.username.errors &&
			(this.username.dirty || this.username.touched)
		);
	}

	get isPasswordValid(): boolean {
		return (
			this.password.errors &&
			(this.password.dirty || this.password.touched)
		);
	}

	get isLogoValid(): boolean {
		return this.logo.errors && (this.logo.dirty || this.logo.touched);
	}

	static buildForm(formBuilder: FormBuilder): FormGroup {
		// would be used in the parent component and injected into this.form
		return formBuilder.group({
			firstName: [
				'',
				[
					Validators.required,
					Validators.pattern(new RegExp(`^[a-z ,.'-]+$`, 'i'))
				]
			],
			lastName: [
				'',
				[
					Validators.required,
					Validators.pattern(new RegExp(`^[a-z ,.'-]+$`, 'i'))
				]
			],
			isActive: [true, Validators.required],
			phone: [
				'',
				[
					Validators.required,
					Validators.pattern(BasicInfoFormComponent.phoneNumberRegex)
				]
			],
			username: ['', Validators.required],
			logo: [
				'',
				[
					(control: AbstractControl) => {
						const imageUrl = control.value;

						if (!isUrl(imageUrl) && !_.isEmpty(imageUrl)) {
							return { invalidImageUrl: true };
						}

						return null;
					}
				]
			]
		});
	}

	static buildPasswordForm(formBuilder: FormBuilder): AbstractControl {
		return new FormControl('', [Validators.required]);
	}

	ngAfterViewInit() {
		this._setupCarrierLogoUrlValidation();
	}

	getValue(): CarrierBasicInfo {
		return this.form.getRawValue() as CarrierBasicInfo;
	}

	setValue<T extends CarrierBasicInfo>(basicInfo: T) {
		FormHelpers.deepMark(this.form, 'dirty');

		this.form.setValue(_.pick(basicInfo, Object.keys(this.getValue())));
	}

	getPassword(): string {
		// password is not part of carrier
		if (!this.password) {
			throw new Error("Form doesn't contain password");
		}
		return this.password.value as string;
	}

	setPassword(value: string) {
		this.password.setValue(value);
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

	private static phoneNumberRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9x]*$/;

	private _setupCarrierLogoUrlValidation() {
		this.logoImagePreview.nativeElement.onload = () => {
			if (this.showLogoMeta) {
				this.logo.setErrors(null);
			}
		};

		this.logoImagePreview.nativeElement.onerror = () => {
			if (this.showLogoMeta) {
				this.logo.setErrors({ invalidUrl: true });
			}
		};
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

			if (this.username.value) {
				form.append('context', `photo=${this.username.value}`);
				tags = `myphotoalbum,${this.username.value}`;
			}

			form.append('folder', 'angular_sample');
			form.append('tags', tags);
			form.append('file', fileItem);

			fileItem.withCredentials = false;

			return { fileItem, form };
		};
	}
}
