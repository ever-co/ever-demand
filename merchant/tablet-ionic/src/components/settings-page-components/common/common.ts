import { Component, Input, OnChanges } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	AbstractControl,
	Validators
} from '@angular/forms';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { environment } from '../../../environments/environment';
import { ActionSheetController, AlertController } from '@ionic/angular';

@Component({
	selector: 'merchant-common',
	templateUrl: 'common.html'
})
export class CommonComponent implements OnChanges {
	uploader: FileUploader;
	commonForm: FormGroup;
	name: AbstractControl;
	logo: AbstractControl;
	email: AbstractControl;
	phone: AbstractControl;
	emptyLogo: boolean = false;

	@Input()
	private currWarehouse: Warehouse;

	constructor(
		private formBuilder: FormBuilder,
		private warehouseRouter: WarehouseRouter,
		public actionSheetCtrl: ActionSheetController,
		private camera: Camera,
		public alertController: AlertController
	) {
		this.buildForm();
		this.bindFormControls();

		this.uploaderConfig();
	}

	get isBrowser() {
		return localStorage.getItem('_platform') === 'browser';
	}

	async saveChanges() {
		this.prepareUpdate();
		await this.warehouseRouter.save(this.currWarehouse);
		const alert = await this.alertController.create({
			cssClass: 'success-info',
			message: 'Successfully saved changes',
			buttons: ['OK']
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
			phone: ['']
		});
	}

	bindFormControls() {
		this.name = this.commonForm.get('name');
		this.logo = this.commonForm.get('logo');
		this.email = this.commonForm.get('email');
		this.phone = this.commonForm.get('phone');
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

			// TODO: use settings from .env file
			form.append('folder', 'angular_sample');
			form.append('tags', tags);
			form.append('file', fileItem);

			fileItem.withCredentials = false;
			return { fileItem, form };
		};
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
