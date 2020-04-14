import {
	Component,
	ViewChild,
	ElementRef,
	OnInit,
	Input,
	AfterViewInit,
} from '@angular/core';
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import {
	IProductDescription,
	IProductTitle,
	IProductImage,
} from '@modules/server.common/interfaces/IProduct';
import { ProductRouter } from '@modules/client.common.angular2/routers/product-router.service';
import Product from '@modules/server.common/entities/Product';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { TranslateService } from '@ngx-translate/core';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { environment } from '../../../environments/environment';
import ProductsCategory from '@modules/server.common/entities/ProductsCategory';
import { first } from 'rxjs/operators';
import { ProductsCategoryService } from '../../../services/products-category.service';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { ProductImagesPopup } from '../product-pictures-popup/product-images-popup.component';

@Component({
	selector: 'page-edit-product-type-popup',
	templateUrl: 'edit-product-type-popup.html',
	styleUrls: ['./edit-product-type-popup.scss'],
})
export class EditProductTypePopupPage implements OnInit, AfterViewInit {
	OK: string = 'OK';
	CANCEL: string = 'CANCEL';
	SELECT_CATEGORIES: string = 'SELECT_CATEGORIES';
	PREFIX: string = 'WAREHOUSE_VIEW.SELECT_POP_UP.';
	selectOptionsObj: object;
	takaProductDelivery: boolean = true;
	takaProductTakeaway: boolean;

	@Input()
	warehouseProduct: WarehouseProduct;
	product: Product;
	readyToUpdate: boolean = false;
	uploader: FileUploader;
	translLang: string;
	productsCategories: ProductsCategory[];
	selectedProductCategories: string[] = [];
	hasImage: boolean = true;

	private lastProductTitle: IProductTitle[];
	private lastProductDescription: IProductDescription[];
	private lastProductPrice: number;
	private lastProductCount: number;
	private imagesData: IProductImage[];

	@ViewChild('fileInput', { static: true })
	private fileInput: ElementRef;

	constructor(
		// public navParams: NavParams,
		private productRouter: ProductRouter,
		private warehouseProductsRouter: WarehouseProductsRouter,
		private readonly _productsCategorySrvice: ProductsCategoryService,
		public modalController: ModalController,
		private camera: Camera,
		public actionSheetCtrl: ActionSheetController,
		public readonly localeTranslateService: ProductLocalesService,
		private translate: TranslateService
	) {
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
			if (this.product.title) {
				form.append('context', `photo=${this.product.title}`);
				tags = `myphotoalbum,${this.product.title}`;
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
		this.selectOptionsObj = { subTitle: title };
		return this.selectOptionsObj;
	}

	get isReadyToUpdate() {
		return (
			this.localeTranslateService.isServiceStateValid &&
			this.warehouseProduct.price !== null &&
			this.warehouseProduct.count !== null &&
			this.warehouseProduct.price !== 0 &&
			this.warehouseProduct.count >= 0
		);
	}

	get warehouseId() {
		return localStorage.getItem('_warehouseId');
	}

	get isBrowser() {
		return localStorage.getItem('_platform') === 'browser';
	}

	get currentLocale() {
		return this.localeTranslateService.currentLocale;
	}

	set currentLocale(locale: string) {
		this.localeTranslateService.currentLocale = locale;
	}

	get productTitle() {
		return this.localeTranslateService.getMemberValue(this.product.title);
	}

	set productTitle(memberValue: string) {
		this.localeTranslateService.setMemberValue('title', memberValue);
	}

	get productDescription() {
		return this.localeTranslateService.getMemberValue(
			this.product.description
		);
	}

	set productDescription(memberValue: string) {
		this.localeTranslateService.setMemberValue('description', memberValue);
	}

	async ngOnInit() {
		this.product = this.warehouseProduct.product as Product;
		this.lastProductCount = this.warehouseProduct.count;
		this.lastProductPrice = this.warehouseProduct.price;
		this.lastProductDescription = this.product.description;
		this.lastProductTitle = this.product.title;
		this.translLang = this.translate.currentLang;
		this.takaProductDelivery = this.warehouseProduct.isDeliveryRequired;
		this.takaProductTakeaway = this.warehouseProduct.isTakeaway;

		this.currentLocale =
			this.localeTranslateService.takeSelectedLang(this.translLang) ||
			'en-US';

		this._setupLocaleServiceValidationState();

		this._selectExistingProductCategories();
		await this._loadProductsCategories();
	}

	ngAfterViewInit(): void {
		const currentProductImage = this.localeTranslateService.getTranslate(
			this.product.images
		);

		if (currentProductImage) {
			this.hasImage = true;
		} else {
			this.hasImage = false;
		}

		this._setImageHolderBackground(currentProductImage);
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

	localeTranslate(member: ILocaleMember[]): string {
		return this.localeTranslateService.getTranslate(member);
	}

	async showPicturesPopup() {
		let images = this.product.images.filter(
			(i) => i.locale === this.currentLocale
		);

		if (this.imagesData) {
			const imagesDataLocale = this.imagesData[0].locale;
			if (imagesDataLocale === this.currentLocale) {
				images = this.imagesData;
			}
		}

		const modal = await this.modalController.create({
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

	takePicture(sourceType: number) {
		const options: CameraOptions = {
			quality: 50,
			destinationType: this.camera.DestinationType.DATA_URL,
			encodingType: this.camera.EncodingType.JPEG,
			mediaType: this.camera.MediaType.PICTURE,
			correctOrientation: true,
			sourceType,
		};

		this.camera.getPicture(options).then(async (imageData) => {
			const base64Image = 'data:image/jpeg;base64,' + imageData;
			const file = await this.urltoFile(
				base64Image,
				this.createFileName(),
				'image/jpeg'
			);
			const fileItem = new FileItem(this.uploader, file, {});
			this.uploader.queue.push(fileItem);
		});
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
		this.warehouseProduct.count = this.lastProductCount;
		this.warehouseProduct.price = this.lastProductPrice;
		this.product.description = this.lastProductDescription;
		this.product.title = this.lastProductTitle;
		this.modalController.dismiss();
	}

	updateProduct() {
		if (this.uploader.queue.length >= 1) {
			this.uploader.queue[this.uploader.queue.length - 1].upload();

			this.uploader.response.subscribe((res) => {
				res = JSON.parse(res);

				const locale = this.currentLocale;
				const width = res.width;
				const height = res.height;
				const orientation =
					width !== height ? (width > height ? 2 : 1) : 0;
				const url = res.url;

				const newImage = {
					locale,
					url,
					width,
					height,
					orientation,
				};

				if (this.product.images.length > 0) {
					this.product.images.forEach((img, index) => {
						if (img.locale === locale) {
							this.product.images[index] = newImage;
						}
					});
				} else {
					this.product.images.push(newImage);
				}

				this.uploadProduct();
			});
		} else {
			this.uploadProduct();
		}
	}

	uploadProduct() {
		if (this.imagesData && this.imagesData.length > 0) {
			// Because all images in "imgLocale" has same local value we get first one
			const imgLocale = this.imagesData[0].locale;
			if (imgLocale === this.currentLocale) {
				this.product.images = this.product.images.filter(
					(i) => i.locale !== imgLocale
				);

				this.product.images.push(...this.imagesData);
			}
		}

		this.localeTranslateService.assignPropertyValue(
			this.product.title,
			'title'
		);
		this.localeTranslateService.assignPropertyValue(
			this.product.description,
			'description'
		);

		this.product.categories = this.productsCategories
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

		this.productRouter.save(this.product).then((product: Product) => {
			this.product = product;
			this.warehouseProduct.product = product.id;
			this.warehouseProduct.isDeliveryRequired = this.takaProductDelivery;
			this.warehouseProduct.isTakeaway = this.takaProductTakeaway;

			this.warehouseProductsRouter
				.saveUpdated(this.warehouseId, this.warehouseProduct)
				.then((warehouse) => {
					this.modalController.dismiss();
				});
		});
	}

	private _setImageHolderBackground(imageUrl: string) {
		const gradient = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${imageUrl})`;
		this._imageHolder.nativeElement.style.background = gradient;
		this._imageHolder.nativeElement.style.backgroundSize = `cover`;
		this._imageHolder.nativeElement.style.backgroundRepeat = 'no-repeat';
		this._imageHolder.nativeElement.style.color = `white`;
	}

	private _translate(key: string): string {
		let translationResult = '';

		this.translate.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}

	private _selectExistingProductCategories() {
		this.selectedProductCategories =
			this.product.categories.map((category) => `${category}`) || [];
	}

	private _setupLocaleServiceValidationState() {
		this.localeTranslateService.setMemberValue('title', this.productTitle);
		this.localeTranslateService.setMemberValue(
			'description',
			this.productDescription
		);
	}

	private async _loadProductsCategories() {
		this.productsCategories = await this._productsCategorySrvice
			.getCategories()
			.pipe(first())
			.toPromise();
	}

	private createFileName() {
		const newFileName = new Date().getTime() + '.jpg';
		return newFileName;
	}
}
