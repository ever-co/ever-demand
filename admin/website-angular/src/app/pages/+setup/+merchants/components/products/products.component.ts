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
	currentView = this.componentViews.main;
	productsPerPage = 3;

	productsForAdd = [];

	get haveProductsForAdd() {
		let hasSelectedCarriers = false;

		if (this.productsCatalog) {
			hasSelectedCarriers = this.productsCatalog.productsTable
				.hasSelectedProducts;
		}

		return hasSelectedCarriers;
	}

	select() {
		this.productsForAdd = this.productsCatalog.productsTable.selectedProducts;
		this.currentView = this.componentViews.addProducts;
	}

	back() {
		this.currentView = this.componentViews.main;
	}
}
