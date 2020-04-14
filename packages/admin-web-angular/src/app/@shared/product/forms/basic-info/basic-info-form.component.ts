import {
	Component,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
	ElementRef,
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	AbstractControl,
} from '@angular/forms';
import {
	IProductImage,
	IProductCreateObject,
	IProductTitle,
	IProductDescription,
	IProductDetails,
} from '@modules/server.common/interfaces/IProduct';
import Product from '@modules/server.common/entities/Product';
import { Subject } from 'rxjs';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { FormHelpers } from '../../../forms/helpers';
import _ from 'lodash';
import isUrl from 'is-url';
import { takeUntil, first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'ea-product-basic-info-form',
	styleUrls: ['./basic-info-form.component.scss'],
	templateUrl: 'basic-info-form.component.html',
})
export class BasicInfoFormComponent implements OnDestroy, OnInit {
	@ViewChild('fileInput')
	fileInput: any;
	@ViewChild('productImagePreview')
	productImagePreview: ElementRef;

	@Input()
	readonly form: FormGroup;
	@Input()
	productCategories: any;
	@Input()
	currentProduct: Product;

	uploaderPlaceholder: string;
	product: any;
	uploaderChanged: boolean;

	title: AbstractControl;
	description: AbstractControl;
	details: AbstractControl;
	image: AbstractControl;
	locale: AbstractControl;
	category: AbstractControl;
	selectedProductCategories: AbstractControl;

	private _selectedProductCategories: string[];
	private actualCategories: any = [];
	private _category: string;
	private _title: string;
	private _description: string;
	private _details: string;
	private _image: string;
	private _locale: string;

	private _ngDestroy$ = new Subject();
	public categoryOptions: IMultiSelectOption[];
	private onLocaleChanges: any;
	private images: IProductImage[] = [];

	static hasValidImage(images) {
		if (images) {
			let imageUrls = images.toString().split(/\s+/);
			imageUrls = imageUrls.filter((a) => a.toString().trim() !== '');

			if (imageUrls.length > 0) {
				for (const imageUrl of imageUrls) {
					if (isUrl(imageUrl)) {
						return true;
					}
				}
			}
		}

		return false;
	}

	static buildForm(formBuilder: FormBuilder): FormGroup {
		// would be used in the parent component and injected into this.form
		return formBuilder.group({
			title: ['', [Validators.required, Validators.maxLength(255)]],
			description: ['', [Validators.required, Validators.maxLength(255)]],
			details: [''],
			locale: ['', Validators.required],
			selectedProductCategories: [[]],
			image: [
				'',
				[
					Validators.required,
					(control: AbstractControl) => {
						const value = control.value;
						const hasImage = BasicInfoFormComponent.hasValidImage(
							value
						);
						if (hasImage) {
							return null;
						} else {
							return { invalidImageUrl: true };
						}
					},
				],
			],
		});
	}

	constructor(
		private _productLocalesService: ProductLocalesService,
		private _translateService: TranslateService
	) {
		this.getUploaderPlaceholderText();
	}

	get imageControl() {
		return this.form.get('image');
	}

	get imagesUrls() {
		return this.images ? this.images.map((i) => i.url).join(' ') : '';
	}

	get imagesArr() {
		if (this.imagesUrls) {
			const imagesStr = this.imagesUrls;

			let imageUrls = imagesStr.split(/\s+/);
			imageUrls = imageUrls.filter((a) => a.trim() !== '');

			return imageUrls;
		}
		return null;
	}

	ngOnInit() {
		if (this.productCategories) {
			this.categoryOptions = this.productCategories.map((category) => {
				return {
					id: category.id,
					name: category.name[0].value,
				};
			});
		}

		this._bindFormControls();
		this._setDefaultLocaleValue();

		this.onLocaleChanges = this.locale.valueChanges
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((v) => {
				if (v !== this._productLocalesService.currentLocale) {
					this._productLocalesService.currentLocale = v;
					this.setValue(this.product);
				}
			});

		this.laodData();
	}

	ngOnDestroy() {
		this.onLocaleChanges.unsubscribe();
		this.form.reset();
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	deleteImg(image) {
		this.images = this.images.filter((i) => i.url !== image);

		this.image.setValue(this.imagesUrls);
	}

	addImageObj(imgData: IProductImage) {
		this.uploaderChanged = true;
		if (imgData) {
			const existData = this.images.find((i) => i.url === imgData.url);
			if (!existData) {
				this.images.push(imgData);

				this.image.setValue(imgData.url);
			}
		}
	}

	getValue(): IProductCreateObject {
		return this.form.getRawValue() as IProductCreateObject;
	}

	setValue<T extends IProductCreateObject>(product: Product) {
		if (this.productCategories) {
			this.categoryOptions = this.productCategories.map((category) => {
				return {
					id: category.id,
					name: category.name[0].value,
				};
			});
		}

		FormHelpers.deepMark(this.form, 'dirty');

		if (!this.product) {
			this.product = product;
		}
		if (this.product) {
			let image = '';
			const imgs = product.images.filter(
				(i) => i.locale === this.locale.value
			);
			if (imgs) {
				image = imgs.map((i) => i.url).join(' ');
			}

			this.images = imgs;

			const product1 = {
				title: this._productLocalesService.getMemberValue(
					product.title
				),
				description: this._productLocalesService.getMemberValue(
					product.description
				),
				details: this._productLocalesService.getMemberValue(
					product.details
				),
				image,
				locale: this.locale.value,
				selectedProductCategories: [...this.product.categories],
			};

			this.form.setValue(_.pick(product1, Object.keys(this.getValue())));
		}
	}

	async setupProductCreateObject(): Promise<IProductCreateObject> {
		this._bindModelProperties();

		const productLocale = this._locale;

		const productImages: IProductImage[] = this.images.filter(
			(i) => i.locale === productLocale && isUrl(i.url)
		);

		const productTitle: IProductTitle = {
			locale: productLocale,
			value: this._title,
		};

		const productDescription: IProductDescription = {
			locale: productLocale,
			value: this._description,
		};

		const productDetails: IProductDetails = {
			locale: productLocale,
			value: this._details || '',
		};

		let productCreateObject: IProductCreateObject = {
			title: [productTitle],
			description: [productDescription],
			details: [productDetails],
			categories: this.actualCategories.map((c) => {
				return {
					_id: c.id,
					name: c.name,
				};
			}),
			images: productImages,
		};

		if (this.product) {
			productCreateObject = {
				title: [
					...this.product.title
						.filter((t) => t.locale !== this._locale)
						.map((t) => ({ locale: t.locale, value: t.value })),
					productTitle,
				],
				description: [
					...this.product.description
						.filter((d) => d.locale !== this._locale)
						.map((d) => ({ locale: d.locale, value: d.value })),
					productDescription,
				],
				details: [
					...this.product.details
						.filter((d) => d.locale !== this._locale)
						.map((d) => ({ locale: d.locale, value: d.value })),
					productDetails,
				],
				categories: this.actualCategories.map((c) => {
					return {
						_id: c.id,
						name: c.name,
					};
				}),
				images: [
					...this.product.images
						.filter((i) => i.locale !== this._locale)
						.map((i) => this.getProductImage(i)),
					...productImages.map((i) => this.getProductImage(i)),
				],
			};
		}

		return productCreateObject;
	}

	imgOnLoad() {
		this.imageControl.setErrors(null);
	}
	imgOnError() {
		if (this.imageControl.value !== '') {
			const hasImage = BasicInfoFormComponent.hasValidImage(
				this.image.value
			);

			if (hasImage) {
				this.imageControl.setErrors(null);
			} else {
				this.imageControl.setErrors({ invalidUrl: true });
			}
		}
	}

	private _setDefaultLocaleValue() {
		this.locale.setValue('en-US');
	}

	private _bindFormControls() {
		this.title = this._getFormControlByName('title');
		this.description = this._getFormControlByName('description');
		this.details = this._getFormControlByName('details');
		this.image = this._getFormControlByName('image');
		this.category = this._getFormControlByName('category');
		this.locale = this._getFormControlByName('locale');
		this.selectedProductCategories = this._getFormControlByName(
			'selectedProductCategories'
		);
	}

	private _getFormControlByName(controlName: string): AbstractControl {
		return this.form.get(controlName);
	}

	private _bindModelProperties() {
		const getInputVal = (name: string) =>
			this._getFormControlByName(name).value;

		this._selectedProductCategories = getInputVal(
			'selectedProductCategories'
		);
		this.actualCategories = [];

		if (this._selectedProductCategories) {
			for (const val of this._selectedProductCategories) {
				for (const val1 of this.productCategories) {
					if (val === val1.id) {
						const newObj: any = {};
						newObj.name = [];
						newObj.id = val1.id;
						for (let i = 0; i < val1.name.length; i++) {
							newObj.name[i] = {};
							newObj.name[i].locale = val1.name[i].locale;
							newObj.name[i].value = val1.name[i].value;
						}
						this.actualCategories.push(newObj);
					}
				}
			}
		}

		// stores the IDs of categories we've selected
		this._title = getInputVal('title');
		this._description = getInputVal('description');
		this._details = getInputVal('details');
		this._image = getInputVal('image');
		this._locale = getInputVal('locale');
	}

	private async getUploaderPlaceholderText() {
		this.uploaderPlaceholder = await this._translateService
			.get('WAREHOUSE_VIEW.PLACEHOLDER.IMAGE_URL')
			.pipe(first())
			.toPromise();
	}

	private getProductImage(data: IProductImage): IProductImage {
		return {
			locale: data.locale,
			url: data.url,
			orientation: data.orientation,
			width: data.width,
			height: data.height,
		};
	}

	private laodData() {
		if (this.currentProduct) {
			this.setValue(this.currentProduct);
		}
	}
}
