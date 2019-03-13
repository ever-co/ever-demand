import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	FormControl,
	AbstractControl
} from '@angular/forms';

import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import User from '@modules/server.common/entities/User';
import { IUserCreateObject } from '@modules/server.common/interfaces/IUser';
import { UsersService } from '../../../../services/users.service';
import { FormHelpers } from '../../../forms/helpers';
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload';
import { TranslateService } from '@ngx-translate/core';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { environment } from '../../../../environments/environment';
import { ActionSheetController, AlertController } from '@ionic/angular';

export type CustomerBasicInfo = Pick<
	IUserCreateObject,
	'firstName' | 'lastName' | 'email' | 'image'
>;

@Component({
	selector: 'basic-info-form',
	styleUrls: ['./basic-info-form.component.scss'],
	templateUrl: 'basic-info-form.component.html'
})
export class BasicInfoFormComponent implements OnDestroy, OnInit {
	@Input()
	readonly form: FormGroup;

	private _ngDestroy$ = new Subject<void>();
	private static _users: User[] = [];

	public uploader: FileUploader;
	public emptyImage: boolean = false;

	constructor(
		private readonly _usersService: UsersService,
		private translateService: TranslateService,
		private camera: Camera,
		public actionSheetCtrl: ActionSheetController,
		public alertController: AlertController
	) {
		BasicInfoFormComponent.initialize(this._usersService, this._ngDestroy$);
	}

	ngOnInit() {
		this.uploaderConfig();
	}

	public PREFIX: string = 'CARRIERS_VIEW.ADD_CARRIER.';
	public DRAG_AND_DROB: string = 'DRAG_AND_DROP_FILE_HERE';
	public PICTURE_URL: string = 'PICTURE_URL';

	get firstName() {
		return this.form.get('firstName');
	}

	get lastName() {
		return this.form.get('lastName');
	}

	get email() {
		return this.form.get('email');
	}

	get image() {
		return this.form.get('image');
	}

	get dragAndDrob() {
		return this.translate(this.PREFIX + this.DRAG_AND_DROB);
	}

	get pictureURL() {
		return this.translate(this.PREFIX + this.PICTURE_URL);
	}

	get isBrowser() {
		return localStorage.getItem('_platform') === 'browser';
	}

	deleteImg() {
		this.image.setValue('');
	}

	imageUrlChanged() {
		if (this.uploader.queue.length > 0) {
			this.uploader.queue[this.uploader.queue.length - 1].upload();
		}

		this.uploader.onSuccessItem = (
			item: any,
			response: string,
			status: number
		) => {
			const data = JSON.parse(response);
			this.image.setValue(data.url);
			this.emptyImage = false;
		};
	}

	async presentActionSheet() {
		const actionSheet = await this.actionSheetCtrl.create({
			header: 'Select Image Source',
			buttons: [
				{
					text: 'Load from Library',
					handler: () => {
						this.takePicture(
							this.camera.PictureSourceType.PHOTOLIBRARY
						);
					}
				},
				{
					text: 'Use Camera',
					handler: () => {
						this.takePicture(this.camera.PictureSourceType.CAMERA);
					}
				},
				{ text: 'Cancel', role: 'cancel' }
			]
		});
		await actionSheet.present();
	}

	static initialize(usersService: UsersService, ngDestroy: Subject<void>) {
		usersService
			.getUsers()
			.pipe(takeUntil(ngDestroy))
			.subscribe((usersResult) => {
				this._users = usersResult;
			});
	}

	static buildForm(formBuilder: FormBuilder): FormGroup {
		const emailSearch$ = new Subject();
		let isSearchRdy = false;

		return formBuilder.group({
			firstName: [''],
			lastName: [''],
			email: [
				'',
				[
					(control: AbstractControl) =>
						control.value ? Validators.email(control) : null
				],
				async (ctrlEmail: FormControl) => {
					if (!isSearchRdy) {
						//
						emailSearch$.pipe(debounceTime(500)).subscribe(() => {
							//
							const hasExistedEmail = this._users.some(
								(u) => u.email === ctrlEmail.value
							);
							if (hasExistedEmail) {
								ctrlEmail.setErrors({ emailTaken: true });
							}
						});

						isSearchRdy = true;
					}

					if (isSearchRdy && ctrlEmail.value.length > 0) {
						emailSearch$.next();
					}
				}
			],
			image: ['']
		});
	}

	getValue(): CustomerBasicInfo {
		const basicInfo = this.form.getRawValue() as {
			firstName: string;
			lastName: string;
			email: string;
			image: string;
		};

		return {
			...(basicInfo.firstName ? { firstName: basicInfo.firstName } : {}),
			...(basicInfo.lastName ? { lastName: basicInfo.lastName } : {}),
			...(basicInfo.email ? { email: basicInfo.email } : {}),
			...(basicInfo.image ? { image: basicInfo.image } : {})
		};
	}

	setValue<T extends CustomerBasicInfo>(basicInfo: T) {
		FormHelpers.deepMark(this.form, 'dirty');

		this.form.setValue({
			firstName: basicInfo.firstName ? basicInfo.firstName : '',
			lastName: basicInfo.lastName ? basicInfo.lastName : '',
			email: basicInfo.email ? basicInfo.email : '',
			image: basicInfo.image ? basicInfo.image : ''
		});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
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

			// TODO: use settings from .env file
			form.append('folder', 'angular_sample');
			form.append('tags', tags);
			form.append('file', fileItem);

			fileItem.withCredentials = false;
			return { fileItem, form };
		};
	}

	private translate(key: string) {
		let translationResult = '';

		this.translateService.get(key).subscribe((res) => {
			translationResult = res;
		});
		return translationResult;
	}

	private takePicture(sourceType: number) {
		const options: CameraOptions = {
			quality: 50,
			destinationType: this.camera.DestinationType.DATA_URL,
			encodingType: this.camera.EncodingType.JPEG,
			mediaType: this.camera.MediaType.PICTURE,
			correctOrientation: true,
			sourceType
		};

		this.camera.getPicture(options).then(
			async (imageData) => {
				const base64Image = 'data:image/jpeg;base64,' + imageData;
				const file = await this.urltoFile(
					base64Image,
					this.createFileName(),
					'image/jpeg'
				);
				const fileItem = new FileItem(this.uploader, file, {});
				this.uploader.queue.push(fileItem);
				this.imageUrlChanged();
			},
			(err) => {}
		);
	}

	private urltoFile(url, filename, mimeType) {
		return fetch(url)
			.then(function(res) {
				return res.arrayBuffer();
			})
			.then(function(buf) {
				return new File([buf], filename, { type: mimeType });
			});
	}

	private createFileName() {
		return new Date().getTime() + '.jpg';
	}
}
