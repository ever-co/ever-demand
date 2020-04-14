import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { CustomOrderComponent } from '../../../../pages/+customers/+customer/ea-customer-products/custom-order';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Product from '@modules/server.common/entities/Product';

@Component({
	templateUrl: './order-btn-order-products.component.html',
})
export class OrderBtnOrderProductsComponent implements ViewCell, OnInit {
	value: string | number;

	@Input()
	rowData: any;

	@Input()
	availableProducts: Product[];

	@Input()
	userId: string;

	private productId: string;

	constructor(private readonly modalService: NgbModal) {}

	ngOnInit(): void {
		this.productId = this.rowData.warehouseProduct.product.id;
	}

	openModal() {
		const productsArray: any = this.availableProducts;
		if (productsArray) {
			localStorage.setItem('ever_customOrderProductId', this.productId);
			const currProduct = productsArray.find((x) => {
				return x.warehouseProduct.product.id === this.productId;
			});
			const activeModal = this.modalService.open(CustomOrderComponent, {
				size: 'lg',
				container: 'nb-layout',
			});

			const modalComponent: CustomOrderComponent =
				activeModal.componentInstance;
			modalComponent.warehouseId = currProduct.warehouseId;
			modalComponent.userId = this.userId;
			modalComponent.currentProduct = currProduct;
		}
	}
}
