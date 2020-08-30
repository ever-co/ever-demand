import {
	Component,
	Input,
	ViewChild,
	ElementRef,
	AfterViewInit,
	OnInit,
} from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { ICarrierCreateObject } from '@modules/server.common/interfaces/ICarrier';
import _ from 'lodash';
import { FormHelpers } from '../../../forms/helpers';
import isUrl from 'is-url';
import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';

export type CarrierBasicInfo = Pick<
	ICarrierCreateObject,
	| 'isDeleted'
	| 'username'
	| 'phone'
	| 'firstName'
	| 'lastName'
	| 'logo'
	| 'apartment'
	| 'isSharedCarrier'
>;

@Component({
	selector: 'ea-carrier-basic-info-form',
	templateUrl: 'basic-info-form.component.html',
	styleUrls: ['basic-info-form.component.scss'],
})
export class BasicInfoFormComponent implements OnInit, AfterViewInit {
	@ViewChild('logoImagePreview')
	logoImagePreview: ElementRef;

	uploaderPlaceholder: string;

	@Input()
	readonly form: FormGroup;

	@Input()
	readonly password?: AbstractControl;

	@Input()
	boxShadow;

	constructor(private translateService: TranslateService) {}

	get isActive() {
		return this.form.get('isActive');
	}

	get isSharedCarrier() {
		return this.form.get('isSharedCarrier');
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

	static buildForm(formBuilder: FormBuilder): FormGroup {
		// would be used in the parent component and injected into this.form
		return formBuilder.group({
			firstName: [
				'',
				[
					Validators.required,
					Validators.pattern(new RegExp(`^[a-z ,.'-]+$`, 'i')),
				],
			],
			lastName: [
				'',
				[
					Validators.required,
					Validators.pattern(new RegExp(`^[a-z ,.'-]+$`, 'i')),
				],
			],
			isActive: [true, Validators.required],
			isSharedCarrier: [false],
			phone: [
				'',
				[
					Validators.required,
					Validators.pattern(BasicInfoFormComponent.phoneNumberRegex),
				],
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
					},
				],
			],
		});
	}

	static buildPasswordForm(formBuilder: FormBuilder): AbstractControl {
		return new FormControl('', [Validators.required]);
	}

	ngOnInit(): void {
		this.getuploaderPlaceholderText();
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

	deleteImg() {
		this.logo.setValue('');
	}

	async getuploaderPlaceholderText() {
		this.uploaderPlaceholder = await this.translateService
			.get('CARRIERS_VIEW.EDIT.PHOTO_URL')
			.pipe(first())
			.toPromise();

		// TODO add translate
		this.uploaderPlaceholder += ' (optional)';
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
}
