import { Component, ViewChild } from '@angular/core';
import { ProductsTableComponent } from 'app/@shared/product/forms/products-table';

@Component({
	selector: 'ea-merchants-setup-add-products',
	templateUrl: './add-products.component.html'
})
export class SetupMerchantAddProductsComponent {
	@ViewChild('productsTable')
	productsTable: ProductsTableComponent;

	perPage = 3;
}
