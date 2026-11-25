import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Component({
	standalone: false,
	styles: [
		`
			div {
				padding-bottom: 4px;
			}

			div img {
				width: 35px;
				height: 35px;
				border-radius: 50%;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './product-categories.html',
})
export class ProductCategoriesComponent implements ViewCell, OnInit {
	value: any;
	rowData: any;
	categoriesArr = [];

	constructor(private readonly _localeTranslate: ProductLocalesService) {}

	ngOnInit() {
		this.getCategories();
	}

	getCategories() {
		if (this.rowData.allCategories) {
			this.categoriesArr = this.rowData.allCategories.filter((category) =>
				this.rowData.categories.ids.includes(category.id),
			);
		}
	}

	getTranslates(categoryName) {
		return this._localeTranslate.getTranslate(categoryName);
	}
}
