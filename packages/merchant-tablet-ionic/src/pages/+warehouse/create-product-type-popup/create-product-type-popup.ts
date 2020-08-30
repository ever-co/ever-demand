import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import {
	IProductCreateObject,
	IProductImage,
} from '@modules/server.common/interfaces/IProduct';
import { IWarehouseProductCreateObject } from '@modules/server.common/interfaces/IWarehouseProduct';
import { ProductRouter } from '@modules/client.common.angular2/routers/product-router.service';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { ProductsCategoryService } from '../../../services/products-category.service';
import { first } from 'rxjs/operators';
import ProductsCategory from '@modules/server.common/entities/ProductsCategory';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { ProductImagesPopup } from '../product-pictures-popup/product-images-popup.component';

@Component({
	selector: 'page-create-product-type-popup',
	templateUrl: 'create-product-type-popup.html',
	styleUrls: ['./create-product-type-popup.scss'],
})
export class CreateProductTypePopupPage implements OnInit {
	OK: string = 'OK';
	CANCEL: string = 'CANCEL';
	SELECT_CATEGORIES: string = 'SELECT_CATEGORIES';
	PREFIX: string = 'WAREHOUSE_VIEW.SELECT_POP_UP.';
	selectOptionsObj: object;

	takaProductDelivery: boolean;
	takaProductTakeaway: boolean;

	uploader: FileUploader;

	productsCategories: ProductsCategory[];
	selectedProductCategories: string[] = [];

	productCreateObject: IProductCreateObject = {
		title: [],
		description: [],
		images: [],
		categories: [],
	};

	warehouseProductCreateObject: IWarehouseProductCreateObject = {
		price: null,
		count: null,
		product: null,
		initialPrice: null,
	};

	translLang: string;

	hasImage: boolean;

	@ViewChild('fileInput', { static: true })
	fileInput: ElementRef;

	private imagesData: IProductImage[];

	constructor(
		public readonly localeTranslateService: ProductLocalesService,
		private productRouter: ProductRouter,
		private warehouseProductsRouter: WarehouseProductsRouter,
		private warehouseRouter: WarehouseRouter,
		public modalCtrl: ModalController,
		private camera: Camera,
		public actionSheetCtrl: ActionSheetController,
		private translate: TranslateService,
		private readonly _productsCategorySrvice: ProductsCategoryService
	) {
		this.loadMerchantSettings();

		this.translLang = this.translate.currentLang;
		this.currentLocale =
			this.localeTranslateService.takeSelectedLang(this.translLang) ||
			'en-US';

		const uploaderOptions: FileUploaderOptions = {
			url: environment.API_FILE_UPLOAD_URL,

			// Use xhrTransport in favor of iframeTransport
			isHTML5: true,
			// Calculate progress independently for each uploaded file
			removeAfterUpload: true,
			// XHR request headers
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
			// Add Cloudinary's unsigned upload preset to the upload form
			form.append('upload_preset', 'everbie-products-images');
			// Add built-in and custom tags for displaying the uploaded photo in the list
			let tags = 'myphotoalbum';
			if (this.productCreateObject.title) {
				form.append(
					'context',
					`photo=${this.productCreateObject.title}`
				);
				tags = `myphotoalbum,${this.productCreateObject.title}`;
			}
			// Upload to a custom folder
			// Note that by default, when uploading via the API, folders are not automatically created in your Media Library.
			// In order to automatically create the folders based on the API requests,
			// please go to your account upload settings and set the 'Auto-create folders' option to enabled.
			// TODO: use settings from .env file
			form.append('folder', 'angular_sample');
			// Add custom tags
			form.append('tags', tags);
			// Add file to upload
			form.append('file', fileItem);

			// Use default "withCredentials" value for CORS requests
			fileItem.withCredentials = false;
			return { fileItem, form };
		};
	}

	ionViewDidLoad() {}

	@ViewChild('imageHolder', { static: true })
	private _imageHolder: ElementRef;

	imageUrlChanged(ev) {
		const reader = new FileReader();

		reader.addEventListener('load', (e) => {
			const imageBase64 = e.target['result'];
			this.hasImage = true;
			this._setImageHolderBackground(<string>imageBase64);
		});

		reader.readAsDataURL(ev.target.files[0]);
	}

	get buttonOK() {
		return this._translate(this.PREFIX + this.OK);
	}

	get buttonCancel() {
		return this._translate(this.PREFIX + this.CANCEL);
	}

	get selectOptionTitle() {
		const title = this._translate(this.PREFIX + this.SELECT_CATEGORIES);
		this.selectOptionsObj = { subHeader: title };
		return this.selectOptionsObj;
	}

	get warehouseId() {
		return localStorage.getItem('_warehouseId');
	}

	get isBrowser() {
		return localStorage.getItem('_platform') === 'browser';
	}

	get isReadyToCreate() {
		return (
			this.localeTranslateService.isServiceStateValid &&
			this.warehouseProductCreateObject.price !== null &&
			this.warehouseProductCreateObject.price !== 0 &&
			(this.uploader.queue[0] ||
				(this.imagesData && this.imagesData.length > 0))
		);
	}

	get currentLocale() {
		return this.localeTranslateService.currentLocale;
	}

	set currentLocale(locale: string) {
		this.localeTranslateService.currentLocale = locale;
	}

	get productTitle() {
		return this.localeTranslateService.getMemberValue(
			this.productCreateObject.title
		);
	}
	set productTitle(title: string) {
		this.localeTranslateService.setMemberValue('title', title);
	}

	get productDescription() {
		return this.localeTranslateService.getMemberValue(
			this.productCreateObject.description
		);
	}

	set productDescription(description: string) {
		this.localeTranslateService.setMemberValue('description', description);
	}

	async ngOnInit() {
		await this._loadProductsCategories();
	}

	async showPicturesPopup() {
		let images = [];

		if (!this.imagesData) {
			this.imagesData = [await this.getProductImage()];
		} else {
			const imagesDataLocale = this.imagesData[0].locale;

			if (imagesDataLocale === this.currentLocale) {
				images = this.imagesData;
			} else {
				for (const image of this.imagesData) {
					image.locale = this.currentLocale;
				}
			}
		}

		images = this.imagesData;

		const modal = await this.modalCtrl.create({
			component: ProductImagesPopup,
			componentProps: {
				images,
			},
			backdropDismiss: false,
			cssClass: 'mutation-product-images-modal',
		});

		await modal.present();

		const res = await modal.onDidDismiss();
		const imageArray = res.data;
		if (imageArray && imageArray.length > 0) {
			const firstImgUrl = imageArray[0].url;
			this._setImageHolderBackground(firstImgUrl);
			this.imagesData = imageArray;
		}
	}

	getProductTypeChange(type: string) {
		if (DeliveryType[type] === DeliveryType.Delivery) {
			if (!this.takaProductDelivery && !this.takaProductTakeaway) {
				this.takaProductTakeaway = true;
			}
		} else {
			if (!this.takaProductDelivery && !this.takaProductTakeaway) {
				this.takaProductDelivery = true;
			}
		}
	}

	async createProduct() {
		let productImages = [];
		if (this.imagesData && this.imagesData.length > 0) {
			productImages = this.imagesData;
		} else {
			productImages = [await this.getProductImage()];
		}
		this.productCreateObject.images = productImages;

		this.localeTranslateService.assignPropertyValue(
			this.productCreateObject.title,
			'title'
		);
		this.localeTranslateService.assignPropertyValue(
			this.productCreateObject.description,
			'description'
		);

		this.productCreateObject.categories = this.productsCategories
			.filter(
				(category) =>
					this.selectedProductCategories &&
					this.selectedProductCategories.some(
						(categoryId) => categoryId === category.id
					)
			)
			.map((category) => {
				return {
					_id: category.id,
					_createdAt: null,
					_updatedAt: null,
					name: category.name,
				};
			});

		const product = await this.productRouter.create(
			this.productCreateObject
		);

		this.warehouseProductCreateObject.product = product.id;
		this.warehouseProductCreateObject.initialPrice =
			this.warehouseProductCreateObject.price || 0;

		this.warehouseProductCreateObject.count =
			this.warehouseProductCreateObject.count || 0;

		this.warehouseProductCreateObject.isDeliveryRequired = this.takaProductDelivery;
		this.warehouseProductCreateObject.isTakeaway = this.takaProductTakeaway;

		await this.warehouseProductsRouter.add(this.warehouseId, [
			this.warehouseProductCreateObject,
		]);

		this.cancelModal();
	}

	takePicture(sourceType: number) {
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
				const file = await this.urltoFile(
					base64Image,
					this.createFileName(),
					'image/jpeg'
				);
				const fileItem = new FileItem(this.uploader, file, {});
				this.uploader.queue.push(fileItem);
			},
			(err) => {}
		);
	}

	urltoFile(url, filename, mimeType) {
		return fetch(url)
			.then(function (res) {
				return res.arrayBuffer();
			})
			.then(function (buf) {
				return new File([buf], filename, { type: mimeType });
			});
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
					},
				},
				{
					text: 'Use Camera',
					handler: () => {
						this.takePicture(this.camera.PictureSourceType.CAMERA);
					},
				},
				{ text: 'Cancel', role: 'cancel' },
			],
		});

		await actionSheet.present();
	}

	cancelModal() {
		this.modalCtrl.dismiss();
	}

	private async _loadProductsCategories() {
		this.productsCategories = await this._productsCategorySrvice
			.getCategories()
			.pipe(first())
			.toPromise();
	}

	private _translate(key: string): string {
		let translationResult = '';

		this.translate.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}

	private createFileName() {
		return new Date().getTime() + '.jpg';
	}

	private _setImageHolderBackground(imageUrl: string) {
		const gradient = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${imageUrl})`;
		this._imageHolder.nativeElement.style.background = gradient;
		this._imageHolder.nativeElement.style.backgroundSize = `cover`;
		this._imageHolder.nativeElement.style.backgroundRepeat = 'no-repeat';
		this._imageHolder.nativeElement.style.color = `white`;
	}

	private async loadMerchantSettings() {
		if (this.warehouseId) {
			const warehouse: Warehouse = await this.warehouseRouter
				.get(this.warehouseId, false)
				.pipe(first())
				.toPromise();
			if (warehouse) {
				this.takaProductDelivery = warehouse.productsDelivery;
				this.takaProductTakeaway = warehouse.productsTakeaway;
			}
		}

		if (!this.takaProductDelivery && !this.takaProductTakeaway) {
			this.takaProductDelivery = true;
		}
	}

	private getProductImage(): Promise<IProductImage> {
		return new Promise(async (resolve, reject) => {
			if (this.uploader.queue.length > 0) {
				this.uploader.queue[this.uploader.queue.length - 1].upload();
			}

			this.uploader.onSuccessItem = (
				item: any,
				response: string,
				status: number
			) => {
				const data = JSON.parse(response);
				const locale = this.currentLocale;
				const width = data.width;
				const height = data.height;
				const orientation =
					width !== height ? (width > height ? 2 : 1) : 0;
				const url = data.url;

				resolve({
					locale,
					url,
					width,
					height,
					orientation,
				});
			};
		});
	}
}
