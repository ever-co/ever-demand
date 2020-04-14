import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import {
	FormGroup,
	AbstractControl,
	FormBuilder,
	Validators,
} from '@angular/forms';
import Admin from '@modules/server.common/entities/Admin';
import { takeUntil, first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IAdminUpdateObject } from '@modules/server.common/interfaces/IAdmin';
import { AdminsService } from '../../../../@core/data/admins.service';
import { getDummyImage } from '@modules/server.common/utils';
import { ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import 'rxjs/add/operator/debounceTime';

@Component({
	selector: 'ea-basic-info',
	styleUrls: ['/basic-info.component.scss'],
	templateUrl: './basic-info.component.html',
})
export class BasicInfoComponent implements OnChanges, OnDestroy {
	@Input()
	admin: Admin;

	uploaderPlaceholder: string;
	basicInfoForm: FormGroup;
	username: AbstractControl;
	email: AbstractControl;
	picture: AbstractControl;
	firstName: AbstractControl;
	lastName: AbstractControl;

	usernameErrorMsg: string;
	emailErrorMsg: string;
	firstNameErrorMsg: string;
	lastNameErrorMsg: string;
	INVALID_EMAIL_ADDRESS: string = 'INVALID_EMAIL_ADDRESS';
	INVALID_URL: string = 'INVALID_URL';
	NAME_MUST_CONTAIN_ONLY_LETTERS: string = 'NAME_MUST_CONTAIN_ONLY_LETTERS';
	PREFIX: string = 'PROFILE_VIEW.';
	loading: boolean;

	private ngDestroy$ = new Subject<void>();

	constructor(
		private formBuilder: FormBuilder,
		private adminsService: AdminsService,
		private toasterService: ToasterService,
		private _translateService: TranslateService
	) {
		this.getUploaderPlaceholderText();
		this.buildForm();
		this.bindFormControls();
		this._applyTranslationOnSmartTable();

		this.loadControls();
	}

	get pictureUrlErrorMsg() {
		return this.picture.errors.pattern
			? this.invalidURL()
			: Object.keys(this.picture.errors)[0];
	}

	ngOnChanges(): void {
		this._applyTranslationOnSmartTable();
		if (this.admin) {
			this.username.setValue(this.admin.name);
			this.email.setValue(this.admin.email);
			this.picture.setValue(this.admin.pictureUrl);
			this.firstName.setValue(this.admin.firstName);
			this.lastName.setValue(this.admin.lastName);
		}
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}

	invalidEmailAddress() {
		return this._translate(this.PREFIX + this.INVALID_EMAIL_ADDRESS);
	}

	invalidURL() {
		return this._translate(this.PREFIX + this.INVALID_URL);
	}

	nameMustContainOnlyLetters() {
		return this._translate(
			this.PREFIX + this.NAME_MUST_CONTAIN_ONLY_LETTERS
		);
	}

	async saveChanges() {
		try {
			this.loading = true;
			const res = await this.adminsService
				.updateById(this.admin.id, this.getAdminCreateObj())
				.pipe(first())
				.toPromise();
			this.loading = false;
			this.toasterService.pop('success', 'Successfully updated data');
		} catch (error) {
			this.loading = false;
			this.toasterService.pop('error', error);
		}
	}

	buildForm() {
		const imgUrlRegex: RegExp = new RegExp(
			`(http(s?):)s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))`
		);
		const nameRegex: RegExp = new RegExp(`^[a-z ,.'-]+$`, 'i');

		this.basicInfoForm = this.formBuilder.group({
			username: ['', Validators.required],
			email: ['', [Validators.required, Validators.email]],
			picture: ['', [Validators.pattern(imgUrlRegex)]],
			firstName: ['', Validators.pattern(nameRegex)],
			lastName: ['', Validators.pattern(nameRegex)],
		});
	}

	bindFormControls() {
		this.username = this.basicInfoForm.get('username');
		this.email = this.basicInfoForm.get('email');
		this.picture = this.basicInfoForm.get('picture');
		this.firstName = this.basicInfoForm.get('firstName');
		this.lastName = this.basicInfoForm.get('lastName');
	}

	loadControls() {
		this.validations.usernameControl();
		this.validations.emailControl();
		this.validations.firstNameControl();
		this.validations.lastNameControl();
	}

	deleteImg() {
		this.picture.setValue('');
		this.basicInfoForm.markAsDirty();
	}

	private _applyTranslationOnSmartTable() {
		this._translateService.onLangChange.subscribe(() => {
			this.loadControls();
		});
	}

	// Use "errors[0]" because to show messages one by one till all are fixed
	private validations = {
		usernameControl: () => {
			this.username.valueChanges
				.debounceTime(500)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((value) => {
					this.usernameErrorMsg = this.hasError(this.username)
						? Object.keys(this.username.errors)[0]
						: '';
				});
		},
		emailControl: () => {
			this.email.valueChanges
				.debounceTime(500)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((value) => {
					this.emailErrorMsg = this.hasError(this.email)
						? this.email.errors.email
							? this.invalidEmailAddress()
							: Object.keys(this.email.errors)[0]
						: '';
				});
		},
		firstNameControl: () => {
			this.firstName.valueChanges
				.debounceTime(500)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((value) => {
					this.firstNameErrorMsg = this.hasError(this.firstName)
						? this.firstName.errors.pattern
							? this.nameMustContainOnlyLetters()
							: Object.keys(this.firstName.errors)[0]
						: '';
				});
		},
		lastNameControl: () => {
			this.lastName.valueChanges
				.debounceTime(500)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((value) => {
					this.lastNameErrorMsg = this.hasError(this.lastName)
						? this.lastName.errors.pattern
							? this.nameMustContainOnlyLetters()
							: Object.keys(this.lastName.errors)[0]
						: '';
				});
		},
	};

	private hasError(control: AbstractControl) {
		return (control.touched || control.dirty) && control.errors;
	}

	private getAdminCreateObj(): IAdminUpdateObject {
		if (!this.picture.value) {
			const letter = this.username.value.charAt(0).toUpperCase();
			this.picture.setValue(getDummyImage(300, 300, letter));
		}
		return {
			name: this.username.value,
			email: this.email.value,
			firstName: this.firstName.value,
			lastName: this.lastName.value,
			pictureUrl: this.picture.value,
		};
	}

	private _translate(key: string): string {
		let translationResult = '';

		this._translateService.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}

	private async getUploaderPlaceholderText() {
		this.uploaderPlaceholder = await this._translateService
			.get('PROFILE_VIEW.PICTURE_URL')
			.pipe(first())
			.toPromise();
	}
}
