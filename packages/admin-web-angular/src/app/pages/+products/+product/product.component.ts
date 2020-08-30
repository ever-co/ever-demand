import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../@core/data/products.service';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { IProductsCategory } from '@modules/server.common/interfaces/IProductsCategory';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import Product from '@modules/server.common/entities/Product';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ProductsCategoryService } from '../../../@core/data/productsCategory.service';
import { Location } from '@angular/common';

@Component({
	selector: 'ea-product',
	templateUrl: './product.component.html',
	styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit, OnDestroy {
	product: Product;
	productLangToShow: string;

	private _productId: string;
	private _ngDestroy$ = new Subject<void>();
	public productCategoriesArr = [];
	public allCategories: any;

	constructor(
		public readonly translateService: TranslateService,
		private readonly _location: Location,
		private readonly _router: ActivatedRoute,
		private readonly _productsService: ProductsService,
		private readonly _productLocalesService: ProductLocalesService,
		private productsCategoryService: ProductsCategoryService
	) {
		this._router.params
			.pipe(first())
			.toPromise()
			.then((res) => {
				this._productId = res.id;
			});

		this.getAllCategories();
	}

	get showCategories(): boolean {
		return this.product && this.product.categories.length > 0;
	}

	ngOnInit() {
		this._loadProduct();
		this._setProductLanguage();
		this.productCategoriesArr = this.allCategories;
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	getLanguageFullName(langAbbreviation: string) {
		switch (langAbbreviation) {
			case 'en-US':
				return 'English';
			case 'bg-BG':
				return 'Български';
			case 'he-IL':
				return 'עברית';
			case 'ru-RU':
				return 'Русский';
			case 'es-ES':
				return 'Spanish';
		}
	}

	getTranslatedValue(member: ILocaleMember[]): string {
		return this._productLocalesService.getTranslate(
			member,
			this.productLangToShow
		);
	}

	getCategories(categories: IProductsCategory[]) {
		return categories
			.map((c) => this.getTranslatedValue(c.name))
			.join(', ');
	}
	async getAllCategories() {
		this.allCategories = await this.productsCategoryService
			.getCategories()
			.pipe(first())
			.toPromise();
	}

	getTranslates(categoryName) {
		return this._productLocalesService.getTranslate(categoryName);
	}

	onProductLangChange(selectedLanguage: string) {
		this.productLangToShow = selectedLanguage;
	}

	getProductCategories(categoriesID) {
		this.productCategoriesArr = this.allCategories.filter((c) =>
			categoriesID.includes(c.id)
		);
	}

	back() {
		this._location.back();
	}

	private _loadProduct() {
		this._productsService
			.getProductById(this._productId)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((p) => {
				this.product = p;
				this.getProductCategories(p.categories);
			});
	}

	private _setProductLanguage() {
		this.productLangToShow = this.translateService.currentLang;
	}
}
