import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { ToasterService } from 'angular2-toaster';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';

@Component({
	styleUrls: ['store-product-amount.component.scss'],
	templateUrl: 'store-product-amount.component.html',
})
export class StoreProductAmountComponent implements ViewCell, OnInit {
	value: any;
	rowData: any;

	public storeID: string;
	public productID: string;
	public productTitle: string;
	public productAmount: number;

	public loading: boolean;

	constructor(
		private productLocalesService: ProductLocalesService,
		private toasterService: ToasterService,
		private warehouseProductsRouter: WarehouseProductsRouter
	) {}

	ngOnInit() {
		this.productID = this.rowData.product.id;
		this.storeID = this.rowData.storeId;
		this.storeID = this.rowData.storeId;
		this.productAmount = this.value;
		this.productTitle = this.localeTranslate(this.rowData.product.title);
	}

	protected localeTranslate(member: ILocaleMember[]) {
		return this.productLocalesService.getTranslate(member);
	}

	addProduct() {
		this.loading = true;
		this.warehouseProductsRouter.increaseCount(
			this.storeID,
			this.productID,
			1
		);
		// this.loading = false;
		this.toasterService.pop(
			'info',
			`${this.productTitle} product amound increased!`
		);
	}

	removeProduct() {
		this.loading = true;
		this.warehouseProductsRouter.decreaseCount(
			this.storeID,
			this.productID,
			1
		);
		// this.loading = false;

		this.toasterService.pop(
			'info',
			`${this.productTitle} product amound decreased!`
		);
	}
}
