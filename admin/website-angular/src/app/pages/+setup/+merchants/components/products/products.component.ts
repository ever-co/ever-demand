import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { SetupMerchantProductsCatalogComponent } from './products-catalog/products-catalog.component';
import Product from '@modules/server.common/entities/Product';

@Component({
	selector: 'ea-merchants-setup-products',
	templateUrl: './products.component.html',
	styleUrls: ['./products.component.scss']
})
export class SetupMerchantProductsComponent {
	@ViewChild('productsCatalog')
	productsCatalog: SetupMerchantProductsCatalogComponent;

	@Output()
	previousStep: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output()
	nextStep: EventEmitter<boolean> = new EventEmitter<boolean>();

	componentViews = {
		main: 'main',
		productsTable: 'productsTable',
		createProduct: 'createProduct',
		addProducts: 'addProducts'
	};
	productsPerPage = 3;

	productsForAdd = [];

	private _currentView = this.componentViews.main;
	private _prevView = this.componentViews.main;

	get haveProductsForAdd() {
		let hasSelectedCarriers = false;

		if (this.productsCatalog) {
			hasSelectedCarriers = this.productsCatalog.productsTable
				.hasSelectedProducts;
		}

		return hasSelectedCarriers;
	}

	get currentView() {
		return this._currentView;
	}

	set currentView(view: string) {
		this._prevView = this.currentView;
		this._currentView = view;
	}

	select() {
		this.productsForAdd = this.productsCatalog.productsTable.selectedProducts;
		this.currentView = this.componentViews.addProducts;
	}

	back() {
		if (this.currentView === this.componentViews.addProducts) {
			this.currentView = this._prevView;
			return;
		}

		this.currentView = this.componentViews.main;
	}
}
