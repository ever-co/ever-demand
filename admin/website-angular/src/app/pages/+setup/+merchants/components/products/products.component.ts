import { Component, ViewChild } from '@angular/core';
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

	componentViews = {
		main: 'main',
		productsTable: 'productsTable',
		addNewProduct: 'addNewProduct',
		addWarehouseProducts: 'addWarehouseProducts'
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

	add() {
		if (this.currentView === this.componentViews.productsTable) {
			this.productsForAdd = this.productsCatalog.productsTable.selectedProducts;
		}
	}

	back() {
		this.currentView = this.componentViews.main;
	}
}
