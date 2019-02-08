import {
	Component,
	Input,
	OnDestroy,
	ViewChild,
	ElementRef,
	AfterViewInit
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	FormControl,
	AbstractControl
} from '@angular/forms';
import { Subject } from 'rxjs';
import { IUserCreateObject } from '@modules/server.common/interfaces/IUser';
import { UsersService } from '../../../../@core/data/users.service';
import { FormHelpers } from '../../../forms/helpers';
import { ActivatedRoute } from '@angular/router';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { environment } from 'environments/environment';
import 'rxjs/add/operator/debounceTime';

export type CustomerBasicInfo = Pick<
	IUserCreateObject,
	'firstName' | 'lastName' | 'email' | 'image'
>;

@Component({
	selector: 'ea-user-basic-info-form',
	styleUrls: ['./basic-info-form.component.scss'],
	templateUrl: 'basic-info-form.component.html'
})
export class BasicInfoFormComponent implements OnDestroy, AfterViewInit {
	@ViewChild('logoImagePreview')
	logoImagePreview: ElementRef;

	public uploader: FileUploader;

	@Input()
	readonly form: FormGroup;
	@Input()
	showBasicInfoLabel: boolean = false;

	private _ngDestroy$ = new Subject<void>();
	private static _usersService: UsersService;
	private static _customerId: string;

	constructor(
		private readonly _usersService: UsersService,
		private readonly _route: ActivatedRoute
	) {
		const customerId = this._route.snapshot.paramMap.get('id');
		BasicInfoFormComponent.initialize(this._usersService, customerId);

		this.uploaderConfig();
	}

	ngAfterViewInit() {
		this._setupUserLogoUrlValidation();
	}

	get firstName() {
		return this.form.get('firstName');
	}

	get lastName() {
		return this.form.get('lastName');
	}

	get image() {
		return this.form.get('image');
	}
	get showLogoMeta() {
		return this.image && this.image.value !== '';
	}

	get email() {
		return this.form.get('email');
	}

	static initialize(usersService: UsersService, customerId: string) {
		this._usersService = usersService;
		this._customerId = customerId;
	}

	static destroy() {
		BasicInfoFormComponent._usersService = null;
		BasicInfoFormComponent._customerId = null;
	}

	get isLogoValid(): boolean {
		return this.image.errors && (this.image.dirty || this.image.touched);
	}

	static buildForm(formBuilder: FormBuilder): FormGroup {
		const emailSearch$ = new Subject();
		let isSearchRdy = false;

		return formBuilder.group({
			firstName: [''],
			lastName: [''],
			image: [''],
			email: [
				'',
				[
					(control: AbstractControl) =>
						control.value ? Validators.email(control) : null
				],
				async (ctrlEmail: FormControl) => {
					if (!isSearchRdy) {
						emailSearch$.debounceTime(500).subscribe(async () => {
							const hasExistedEmail = await this._usersService
								.isUserExists({
									exceptCustomerId: this._customerId,
									memberKey: 'email',
									memberValue: ctrlEmail.value
								})
								.toPromise();

							if (hasExistedEmail) {
								ctrlEmail.setErrors({ emailTaken: true });
							}
						});

						isSearchRdy = true;
					}

					if (
						isSearchRdy &&
						ctrlEmail.value &&
						ctrlEmail.value.length > 0
					) {
						emailSearch$.next();
					}
				}
			]
		});
	}

	getValue(): CustomerBasicInfo {
		const basicInfo = this.form.getRawValue() as {
			firstName: string;
			lastName: string;
			image: string;
			email: string;
		};

		return {
			...(basicInfo.firstName ? { firstName: basicInfo.firstName } : {}),
			...(basicInfo.lastName ? { lastName: basicInfo.lastName } : {}),
			...(basicInfo.image ? { image: basicInfo.image } : {}),
			...(basicInfo.email ? { email: basicInfo.email } : {})
		};
	}

	setValue<T extends CustomerBasicInfo>(basicInfo: T) {
		FormHelpers.deepMark(this.form, 'dirty');

		this.form.setValue({
			firstName: basicInfo.firstName ? basicInfo.firstName : '',
			lastName: basicInfo.lastName ? basicInfo.lastName : '',
			image: basicInfo.image ? basicInfo.image : '',
			email: basicInfo.email ? basicInfo.email : ''
		});
	}

	imageUrlChanged() {
		this.uploader.queue[0].upload();

		this.uploader.onSuccessItem = (
			item: any,
			response: string,
			status: number
		) => {
			const data = JSON.parse(response);
			this.image.setValue(data.url);
		};
	}

	deleteImg() {
		this.image.setValue('');
	}

	private _setupUserLogoUrlValidation() {
		this.logoImagePreview.nativeElement.onload = () => {
			if (this.showLogoMeta) {
				this.image.setErrors(null);
			}
		};

		this.logoImagePreview.nativeElement.onerror = () => {
			if (this.showLogoMeta) {
				this.image.setErrors({ invalidUrl: true });
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
			if (this.firstName.value) {
				form.append('context', `photo=${this.firstName.value}`);
				tags = `myphotoalbum,${this.firstName.value}`;
			}

			form.append('folder', 'angular_sample');
			form.append('tags', tags);
			form.append('file', fileItem);

			fileItem.withCredentials = false;
			return { fileItem, form };
		};
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
		BasicInfoFormComponent.destroy();
	}
}
