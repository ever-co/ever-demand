import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
	IPromotion,
	IPromotionCreateObject,
} from '@modules/server.common/interfaces/IPromotion';
import { Subject } from 'rxjs';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { takeUntil } from 'rxjs/operators';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import IProduct from '@modules/server.common/interfaces/IProduct';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import {
	LanguageCodesEnum,
	LanguagesEnum,
} from '@modules/server.common/interfaces/ILanguage';

@Component({
	selector: 'basic-info-form',
	styleUrls: ['./basic-info-form.component.scss'],
	templateUrl: 'basic-info-form.component.html',
})
export class BasicInfoFormComponent implements OnInit, OnDestroy {
	@Input()
	readonly form: FormGroup;

	@Input()
	promotionData: IPromotion;

	public languages = Object.keys(LanguageCodesEnum);

	availableProducts: Partial<IProduct>[] = [];
	displayProducts: { id: string; title: string; image: string }[];

	private languageCode: string;

	private promotion: Partial<IPromotion>;

	private translateProperties = ['title', 'description'];

	get locale() {
		return this.form.get('locale');
	}

	get title() {
		return this.form.get('title');
	}

	get description() {
		return this.form.get('description');
	}

	get warehouseId() {
		return localStorage.getItem('_warehouseId');
	}

	get language() {
		return localStorage.getItem('_language');
	}

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly warehouseProductService: WarehouseProductsRouter,
		private readonly productLocalesService: ProductLocalesService
	) {}

	ngOnInit(): void {
		this._setDefaultLocaleValue();

		this._initMerchantProducts();

		this.promotion = this.promotionData || this._initPromotion();

		this._initTranslationValues();

		this._setValue();

		this._subscribeToLanguageChanges();
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	getValue() {
		this._saveTranslationValues();

		let basicInfoValue = this.form.value;

		basicInfoValue.warehouse = { _id: this.warehouseId };

		basicInfoValue.title = this.promotion.title.map((localeMember: any) => {
			return {
				locale: localeMember.locale,
				value: localeMember.value,
			};
		});

		basicInfoValue.description = this.promotion.description.map(
			(localeMember: any) => {
				return {
					locale: localeMember.locale,
					value: localeMember.value,
				};
			}
		);

		delete basicInfoValue.locale;

		return basicInfoValue as IPromotionCreateObject;
	}

	getLanguageCode(language: string) {
		return LanguageCodesEnum[language];
	}

	private _setValue() {
		if (!this.promotion) return;

		const promotionFormValue = {
			title: this.productLocalesService.getTranslate(
				this.promotion.title,
				this.languageCode
			),
			description: this.productLocalesService.getTranslate(
				this.promotion.description,
				this.languageCode
			),
			activeFrom: this.promotion.activeFrom || new Date(),
			activeTo: this.promotion.activeTo || null,
			product: this.promotion.productId || null,
		};

		this.form.patchValue(promotionFormValue);
	}

	static buildForm(formBuilder: FormBuilder): FormGroup {
		return formBuilder.group({
			locale: ['en-US'],
			title: ['', Validators.required],
			description: [''],
			activeFrom: [null, Validators.required],
			activeTo: [null, Validators.required],
			product: [null, Validators.required],
		});
	}

	private _saveLocaleMember(
		translateProp: string,
		member: ILocaleMember[]
	): void {
		const memberValue = this._getLocaleMember(member, this.languageCode);

		if (memberValue) {
			let updateProperty = this.promotion[translateProp].find(
				(localeValue) => {
					return localeValue['locale'] === this.languageCode;
				}
			);
			updateProperty.value = this[translateProp].value;
		}
	}

	private _addLocaleMember(member: ILocaleMember[]): void {
		const memberValue = this._getLocaleMember(member, this.locale.value);

		if (!memberValue) {
			member.push({ locale: this.locale.value, value: '' });
		}
	}

	private _initTranslationValues() {
		this.translateProperties.forEach((promotionTranslateProp) => {
			this._addLocaleMember(this.promotion[promotionTranslateProp]);
		});
	}

	private _saveTranslationValues() {
		this.translateProperties.forEach((promotionTranslateProp) => {
			this._saveLocaleMember(
				promotionTranslateProp,
				this.promotion[promotionTranslateProp]
			);
		});
	}

	private _initMerchantProducts() {
		this.warehouseProductService
			.getAvailable(this.warehouseId || null)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((resData) => {
				if (!resData) return;

				this.availableProducts = resData.map((warehouseProduct) => {
					return {
						id: warehouseProduct.product['id'] || null,
						title: warehouseProduct.product['title'] || [],
						images: warehouseProduct.product['images'] || [],
					};
				});

				this._initFormDisplayProducts();
			});
	}

	private _initFormDisplayProducts() {
		if (!this.availableProducts) return;

		this.displayProducts = this.availableProducts.map((product) => {
			return {
				id: product['id'],
				image: this.productLocalesService.getTranslate(product.images),
				title: this.productLocalesService.getTranslate(product.title),
			};
		});
	}

	private _subscribeToLanguageChanges() {
		this.locale.valueChanges
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((value) => {
				this._saveTranslationValues();
				this._initTranslationValues();

				this.languageCode = value;

				this._initFormDisplayProducts();
				this._setValue();
			});
	}

	private _initPromotion() {
		return {
			title: [],
			description: [],
			activeFrom: new Date(),
			activeTo: null,
			product: null,
		};
	}

	private _setDefaultLocaleValue() {
		this.languageCode = this.language || 'en-US';
	}

	private _getLocaleMember(
		promotionMember: ILocaleMember[],
		languageCode: string
	): ILocaleMember | boolean {
		let resultLocale: ILocaleMember;

		if (promotionMember) {
			resultLocale = promotionMember.find((t) => {
				return t.locale === languageCode;
			});
		}

		return resultLocale ? resultLocale : false;
	}
}
