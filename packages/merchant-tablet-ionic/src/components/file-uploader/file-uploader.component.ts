import {
	Component,
	Input,
	Output,
	EventEmitter,
	ViewChild,
	OnInit,
} from '@angular/core';
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload';
import { environment } from 'environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ActionSheetController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { IProductImage } from '@modules/server.common/interfaces/IProduct';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { NgModel } from '@angular/forms';

@Component({
	selector: 'e-cu-file-uploader',
	templateUrl: './file-uploader.component.html',
	styleUrls: ['./file-uploader.component.scss'],
})
export class FileUploaderComponent implements OnInit {
	@ViewChild('shownInput', { static: true })
	shownInput: NgModel;

	@Input()
	labelText: string;
	@Input()
	name: string;
	@Input()
	buttonFullSpace: boolean;
	@Input()
	fileUrl: string;
	@Input()
	itemMode: string;
	@Input()
	inputCustomStyle: boolean;

	@Output()
	uploadedImgUrl: EventEmitter<string> = new EventEmitter<string>();
	@Output()
	uploadedImgObj: EventEmitter<IProductImage> = new EventEmitter<
		IProductImage
	>();

	uploader: FileUploader;

	private PREFIX: string = 'FILE_UPLOADER.';
	private DRAG_AND_DROB: string = 'DRAG_AND_DROP_FILE_HERE';
	private PICTURE_URL: string = 'PICTURE_URL';

	constructor(
		private translateService: TranslateService,
		private actionSheetCtrl: ActionSheetController,
		private camera: Camera,
		public readonly localeTranslateService: ProductLocalesService
	) {}

	get isBrowser() {
		return localStorage.getItem('_platform') === 'browser';
	}

	get dragAndDrob() {
		return this._translate(this.PREFIX + this.DRAG_AND_DROB);
	}

	get pictureURL() {
		return this._translate(this.PREFIX + this.PICTURE_URL);
	}

	get currentLocale() {
		return this.localeTranslateService.currentLocale;
	}

	ngOnInit(): void {
		this._uploaderConfig();
	}

	imageUrlChanged() {
		if (this.uploader.queue.length > 0) {
			this.uploader.queue[this.uploader.queue.length - 1].upload();
		} else {
			this.uploadedImgUrl.emit(this.fileUrl);
		}

		this.uploader.onSuccessItem = (
			item: any,
			response: string,
			status: number
		) => {
			const data = JSON.parse(response);
			this.fileUrl = data.url;
			const locale = this.currentLocale;
			const width = data.width;
			const height = data.height;
			const orientation = width !== height ? (width > height ? 2 : 1) : 0;
			const url = data.url;

			const newImage = {
				locale,
				url,
				width,
				height,
				orientation,
			};

			this.uploadedImgUrl.emit(data.url);
			this.uploadedImgObj.emit(newImage);
		};
	}

	async presentActionSheet() {
		const actionSheet = await this.actionSheetCtrl.create({
			header: 'Select Image Source',
			buttons: [
				{
					text: 'Load from Library',
					handler: () => {
						this._takePicture(
							this.camera.PictureSourceType.PHOTOLIBRARY
						);
					},
				},
				{
					text: 'Use Camera',
					handler: () => {
						this._takePicture(this.camera.PictureSourceType.CAMERA);
					},
				},
				{ text: 'Cancel', role: 'cancel' },
			],
		});
		await actionSheet.present();
	}

	private _uploaderConfig() {
		const uploaderOptions: FileUploaderOptions = {
			url: environment.API_FILE_UPLOAD_URL,

			isHTML5: true,
			removeAfterUpload: true,
			headers: [
				{
					name: 'X-Requested-With',
					value: 'XMLHttpRequest',
				},
			],
		};
		this.uploader = new FileUploader(uploaderOptions);

		this.uploader.onBuildItemForm = (
			fileItem: any,
			form: FormData
		): any => {
			form.append('upload_preset', 'everbie-products-images');
			let tags = 'myphotoalbum';
			if (this.name) {
				form.append('context', `photo=${this.name}`);
				tags = `myphotoalbum,${this.name}`;
			}

			form.append('folder', 'angular_sample');
			form.append('tags', tags);
			form.append('file', fileItem);

			fileItem.withCredentials = false;
			return { fileItem, form };
		};
	}

	private _translate(key: string) {
		let translationResult = '';

		this.translateService.get(key).subscribe((res) => {
			translationResult = res;
		});
		return translationResult;
	}

	private _takePicture(sourceType: number) {
		const options: CameraOptions = {
			quality: 50,
			destinationType: this.camera.DestinationType.DATA_URL,
			encodingType: this.camera.EncodingType.JPEG,
			mediaType: this.camera.MediaType.PICTURE,
			correctOrientation: true,
			sourceType,
		};

		this.camera.getPicture(options).then(
			async (imageData) => {
				const base64Image = 'data:image/jpeg;base64,' + imageData;
				const file = await this._urltoFile(
					base64Image,
					this._createFileName(),
					'image/jpeg'
				);
				const fileItem = new FileItem(this.uploader, file, {});
				this.uploader.queue.push(fileItem);
				this.imageUrlChanged();
			},
			(err) => {}
		);
	}

	private _urltoFile(url, filename, mimeType) {
		return fetch(url)
			.then(function (res) {
				return res.arrayBuffer();
			})
			.then(function (buf) {
				return new File([buf], filename, { type: mimeType });
			});
	}

	private _createFileName() {
		return new Date().getTime() + '.jpg';
	}
}
