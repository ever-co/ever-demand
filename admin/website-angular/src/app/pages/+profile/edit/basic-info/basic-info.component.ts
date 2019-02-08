import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import {
	FormGroup,
	AbstractControl,
	FormBuilder,
	Validators
} from '@angular/forms';
import Admin from '@modules/server.common/entities/Admin';
import { takeUntil, first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FileUploaderOptions, FileUploader } from 'ng2-file-upload';
import { environment } from 'environments/environment';
import { IAdminUpdateObject } from '@modules/server.common/interfaces/IAdmin';
import { AdminsService } from '../../../../@core/data/admins.service';
import { getDummyImage } from '@modules/server.common/utils';
import { ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import 'rxjs/add/operator/debounceTime';

@Component({
	selector: 'ea-basic-info',
	styleUrls: ['/basic-info.component.scss'],
	templateUrl: './basic-info.component.html'
})
export class BasicInfoComponent implements OnChanges, OnDestroy {
	public uploader: FileUploader;

	public basicInfoForm: FormGroup;
	public username: AbstractControl;
	public email: AbstractControl;
	public picture: AbstractControl;
	public firstName: AbstractControl;
	public lastName: AbstractControl;

	public usernameErrorMsg: string;
	public emailErrorMsg: string;
	public pictureUrlErrorMsg: string;
	public firstNameErrorMsg: string;
	public lastNameErrorMsg: string;
	public INVALID_EMAIL_ADDRESS: string = 'INVALID_EMAIL_ADDRESS';
	public INVALID_URL: string = 'INVALID_URL';
	public NAME_MUST_CONTAIN_ONLY_LETTERS: string =
		'NAME_MUST_CONTAIN_ONLY_LETTERS';
	public PREFIX: string = 'PROFILE_VIEW.';

	public loading: boolean;

	@Input()
	private admin: Admin;
	private ngDestroy$ = new Subject<void>();

	constructor(
		private formBuilder: FormBuilder,
		private adminsService: AdminsService,
		private toasterService: ToasterService,
		private _translateService: TranslateService
	) {
		this.uploaderConfig();
		this.buildForm();
		this.bindFormControls();
		this._applyTranslationOnSmartTable();

		this.loadControls();
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
			lastName: ['', Validators.pattern(nameRegex)]
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
		this.validations.pictureUrlControl();
		this.validations.firstNameControl();
		this.validations.lastNameControl();
	}

	imageUrlChanged() {
		this.uploader.queue[0].upload();

		this.uploader.onSuccessItem = (
			item: any,
			response: string,
			status: number
		) => {
			const data = JSON.parse(response);
			this.picture.setValue(data.url);
			this.basicInfoForm.markAsDirty();
		};
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
		pictureUrlControl: () => {
			this.picture.valueChanges
				.debounceTime(500)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((value) => {
					this.pictureUrlErrorMsg = this.hasError(this.picture)
						? this.picture.errors.pattern
							? this.invalidURL()
							: Object.keys(this.picture.errors)[0]
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
		}
	};

	private hasError(control: AbstractControl) {
		return (control.touched || control.dirty) && control.errors;
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
			pictureUrl: this.picture.value
		};
	}

	private _translate(key: string): string {
		let translationResult = '';

		this._translateService.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
