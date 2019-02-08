import {
	Component,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
	ElementRef,
	AfterViewInit
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	AbstractControl
} from '@angular/forms';
import {
	IProductImage,
	IProductCreateObject,
	IProductTitle,
	IProductDescription,
	IProductDetails
} from '@modules/server.common/interfaces/IProduct';
import Product from '@modules/server.common/entities/Product';
import { Subject } from 'rxjs';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { FormHelpers } from '../../../forms/helpers';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { environment } from 'environments/environment';
import * as _ from 'lodash';
import * as isUrl from 'is-url';

@Component({
	selector: 'ea-product-basic-info-form',
	styleUrls: ['./basic-info-form.component.scss'],
	templateUrl: 'basic-info-form.component.html'
})
export class BasicInfoFormComponent
	implements OnDestroy, OnInit, AfterViewInit {
	@ViewChild('fileInput')
	fileInput: any;

	@ViewChild('productImagePreview')
	productImagePreview: ElementRef;

	public uploader: FileUploader;

	@Input()
	readonly form: FormGroup;
	public product: any;

	@Input()
	public productCategories: any;

	protected title: AbstractControl;
	protected description: AbstractControl;
	protected details: AbstractControl;
	protected image: AbstractControl;
	protected locale: AbstractControl;
	protected category: AbstractControl;
	protected selectedProductCategories: AbstractControl;

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
						const imageUrl = control.value;

						if (!isUrl(imageUrl) && !_.isEmpty(imageUrl)) {
							return { invalidImageUrl: true };
						}

						return null;
					}
				]
			]
		});
	}

	constructor(private _productLocalesService: ProductLocalesService) {
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
			const tags = 'myphotoalbum';

			form.append('upload_preset', 'everbie-products-images');
			form.append('folder', 'angular_sample');
			form.append('tags', tags);
			form.append('file', fileItem);

			fileItem.withCredentials = false;
			return { fileItem, form };
		};
	}

	get imageControl() {
		return this.form.get('image');
	}

	ngOnInit() {
		if (this.productCategories) {
			this.categoryOptions = this.productCategories.map((category) => {
				return {
					id: category.id,
					name: category.name[0].value
				};
			});
		}

		this._bindFormControls();
		this._setDefaultLocaleValue();

		this.locale.valueChanges.subscribe((v) => {
			if (v !== this._productLocalesService.currentLocale) {
				this._productLocalesService.currentLocale = v;
				this.setValue(this.product);
			}
		});
	}

	ngAfterViewInit() {
		this._setupProductImageUrlValidation();
	}

	deleteImg() {
		this.image.setValue('');
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

	getValue(): IProductCreateObject {
		return this.form.getRawValue() as IProductCreateObject;
	}

	setValue<T extends IProductCreateObject>(product: Product) {
		if (this.productCategories) {
			this.categoryOptions = this.productCategories.map((category) => {
				return {
					id: category.id,
					name: category.name[0].value
				};
			});
		}

		FormHelpers.deepMark(this.form, 'dirty');

		if (!this.product) {
			this.product = product;
		}
		if (this.product) {
			let image = '';
			const img = product.images.filter(
				(i) => i.locale === this.locale.value
			)[0];
			if (img) {
				image = img.url;
			}

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
				selectedProductCategories: [...this.product.categories]
			};

			this.form.setValue(_.pick(product1, Object.keys(this.getValue())));
		}
	}

	async setupProductCreateObject(): Promise<IProductCreateObject> {
		this._bindModelProperties();

		const productLocale = this._locale;

		const productImage: IProductImage = await this._setupImage();

		const productTitle: IProductTitle = {
			locale: productLocale,
			value: this._title
		};

		const productDescription: IProductDescription = {
			locale: productLocale,
			value: this._description
		};

		const productDetails: IProductDetails = {
			locale: productLocale,
			value: this._details || ''
		};

		let productCreateObject: IProductCreateObject = {
			title: [productTitle],
			description: [productDescription],
			details: [productDetails],
			categories: this.actualCategories.map((c) => {
				return {
					_id: c.id,
					name: c.name
				};
			}),
			images: [productImage]
		};

		if (this.product) {
			productCreateObject = {
				title: [
					...this.product.title
						.filter((t) => t.locale !== this._locale)
						.map((t) => ({ locale: t.locale, value: t.value })),
					productTitle
				],
				description: [
					...this.product.description
						.filter((d) => d.locale !== this._locale)
						.map((d) => ({ locale: d.locale, value: d.value })),
					productDescription
				],
				details: [
					...this.product.details
						.filter((d) => d.locale !== this._locale)
						.map((d) => ({ locale: d.locale, value: d.value })),
					productDetails
				],
				categories: this.actualCategories.map((c) => {
					return {
						_id: c.id,
						name: c.name
					};
				}),
				images: [
					...this.product.images
						.filter((i) => i.locale !== this._locale)
						.map((i) => ({
							locale: i.locale,
							url: i.url,
							orientation: i.orientation,
							width: i.width,
							height: i.height
						})),
					productImage
				]
			};
		}

		return productCreateObject;
	}

	private _setupProductImageUrlValidation() {
		this.productImagePreview.nativeElement.onload = () => {
			this.imageControl.setErrors(null);
		};

		this.productImagePreview.nativeElement.onerror = () => {
			if (this.imageControl.value !== '') {
				this.imageControl.setErrors({ invalidUrl: true });
			}
		};
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

	private async _setupImage() {
		try {
			const img = await this._getImageMeta(this._image);
			const width = img['width'];
			const height = img['height'];
			const orientation = width !== height ? (width > height ? 2 : 1) : 0;
			const locale = this._locale;
			const url = this._image;
			return {
				locale,
				url,
				width,
				height,
				orientation
			};
		} catch (error) {
			return error;
		}
	}

	private async _getImageMeta(url) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = (err) => reject(err);
			img.src = url;
		});
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
		// stores the IDs of categories we've selected
		this._title = getInputVal('title');
		this._description = getInputVal('description');
		this._details = getInputVal('details');
		this._image = getInputVal('image');
		this._locale = getInputVal('locale');
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
