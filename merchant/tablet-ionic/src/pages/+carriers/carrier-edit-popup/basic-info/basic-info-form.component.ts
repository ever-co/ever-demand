import { Component, OnDestroy, OnInit, OnChanges } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	AbstractControl
} from '@angular/forms';

import { Subject } from 'rxjs';
import { ICarrierCreateObject } from '@modules/server.common/interfaces/ICarrier';
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { environment } from '../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ActionSheetController } from '@ionic/angular';

export type CarrierBasicInfo = Pick<
	ICarrierCreateObject,
	'firstName' | 'lastName' | 'phone' | 'email' | 'logo'
>;

@Component({
	selector: 'basic-info-form',
	styleUrls: ['./basic-info-form.component.scss'],
	templateUrl: 'basic-info-form.component.html'
})
export class BasicInfoFormComponent implements OnDestroy, OnInit, OnChanges {
	private _ngDestroy$ = new Subject<void>();

	form: FormGroup;
	firstName: AbstractControl;
	lastName: AbstractControl;
	logo: AbstractControl;
	phone: AbstractControl;
	email: AbstractControl;
	PREFIX: string = 'CARRIERS_VIEW.ADD_CARRIER.';
	DRAG_AND_DROB: string = 'DRAG_AND_DROP_FILE_HERE';
	PICTURE_URL: string = 'PICTURE_URL';

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	uploader: FileUploader;

	emptyLogo: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		public actionSheetCtrl: ActionSheetController,
		private camera: Camera,
		private translateService: TranslateService
	) {
		this.buildForm(this.formBuilder);
	}

	ngOnInit() {
		this.bindFormControls();
		this.uploaderConfig();
	}

	ngOnChanges(): void {}

	get isFirstNameValid() {
		return (
			this.firstName.errors &&
			(this.firstName.dirty || this.firstName.touched)
		);
	}

	get isLastNameValid() {
		return (
			this.lastName.errors &&
			(this.lastName.dirty || this.lastName.touched)
		);
	}

	get isPhoneValid() {
		return this.phone && (this.phone.dirty || this.phone.touched);
	}

	get isEmailValid() {
		return this.email && (this.email.dirty || this.email.touched);
	}

	get dragAndDrob() {
		return this.translate(this.PREFIX + this.DRAG_AND_DROB);
	}

	get pictureURL() {
		return this.translate(this.PREFIX + this.PICTURE_URL);
	}

	buildForm(formBuilder: FormBuilder) {
		this.form = formBuilder.group({
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
			phone: [
				'',
				[
					Validators.required,
					Validators.pattern(BasicInfoFormComponent.phoneNumberRegex)
				]
			],
			email: ['', Validators.required],
			logo: ['']
		});
	}

	bindFormControls() {
		this.firstName = this.form.get('firstName');
		this.lastName = this.form.get('lastName');
		this.logo = this.form.get('logo');
		this.email = this.form.get('email');
		this.phone = this.form.get('phone');
	}

	get isBrowser() {
		return localStorage.getItem('_platform') === 'browser';
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

	deleteImg() {
		this.logo.setValue('');
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
			this.logo.setValue(data.url);
			this.emptyLogo = false;
		};
	}

	private static phoneNumberRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9x]*$/;

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
}
