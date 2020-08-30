import {
	Component,
	Output,
	EventEmitter,
	OnInit,
	OnDestroy,
} from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { ToasterService } from 'angular2-toaster';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfimationModalComponent } from '@app/@shared/confirmation-modal/confirmation-modal.component';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { root } from 'rxjs/internal/util/root';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
	styleUrls: ['store-order-product-amount.component.scss'],
	templateUrl: 'store-order-product-amount.component.html',
})
export class StoreOrderProductAmountComponent
	implements ViewCell, OnInit, OnDestroy {
	value: any;
	rowData: any;

	private ngDestroy$ = new Subject<void>();

	public storeID: string;
	public productID: string;
	public productTitle: string;
	public productAmount: number;

	public productObj: any;

	public orderId: string;
	public orderWarehouseId: string;

	public availableProducts: number;

	public loading: boolean;

	public modalTitle: string;

	constructor(
		private productLocalesService: ProductLocalesService,
		private toasterService: ToasterService,
		private warehouseProductsRouter: WarehouseProductsRouter,
		private readonly modalService: NgbModal,
		private readonly orderRouter: OrderRouter
	) {}

	ngOnInit() {
		this.productID = this.rowData.product.id;
		this.storeID = this.rowData.storeId;
		this.storeID = this.rowData.storeId;
		this.productAmount = this.value;
		this.productTitle = this.localeTranslate(this.rowData.product.title);
		this.orderId = this.rowData.orderId;
		this.orderWarehouseId = this.rowData.orderWarehouseId;

		this.availableProducts = this.rowData.warehouseProducts
			.filter((d) => d.product === this.productID)
			.map((d) => d.count)[0];

		this.productObj = [
			{
				productId: this.productID,
				count: 1,
			},
		];
	}

	protected localeTranslate(member: ILocaleMember[]) {
		return this.productLocalesService.getTranslate(member);
	}
	async addProduct() {
		if (this.availableProducts > 0) {
			const activeModal = this.modalService.open(
				ConfimationModalComponent,
				{
					size: 'sm',
					container: 'nb-layout',
					backdrop: 'static',
				}
			);
			const modalComponent: ConfimationModalComponent =
				activeModal.componentInstance;

			modalComponent.mainText = 'ARE_YOU_SURE_YOU_WANT_TO_INCREASE';

			this.loading = true;

			await modalComponent.confirmEvent
				.pipe(takeUntil(modalComponent.ngDestroy$))
				.subscribe((dataEvent) => {
					// if (this.availableProducts > 0) {
					this.orderRouter
						.addProducts(
							this.orderId,
							this.productObj,
							this.orderWarehouseId
						)
						.then((r) => {
							this.toasterService.pop(
								`info`,
								`Increased amount of the order's product!`
							);
						})
						.catch((err) => {
							this.toasterService.pop(`error`, `Error!`);
						});
					// } else {
					// 	this.toasterService.pop(
					// 		`error`,
					// 		`There are no more available products!`
					// 	);
					// }
					modalComponent.cancel();
				});
		} else {
			this.toasterService.pop(
				`error`,
				`There are no more available products!`
			);
		}
		this.loading = false;
	}

	async removeProduct() {
		if (this.productAmount >= 1) {
			const activeModal = this.modalService.open(
				ConfimationModalComponent,
				{
					size: 'sm',
					container: 'nb-layout',
					backdrop: 'static',
				}
			);
			const modalComponent: ConfimationModalComponent =
				activeModal.componentInstance;

			modalComponent.mainText = 'ARE_YOU_SURE_YOU_WANT_TO_DECREASE';
			this.loading = true;

			await modalComponent.confirmEvent
				.pipe(takeUntil(modalComponent.ngDestroy$))
				.subscribe((dataEvent) => {
					this.orderRouter
						.decreaseOrderProducts(
							this.orderId,
							this.productObj,
							this.orderWarehouseId
						)
						.then((r) => {
							this.toasterService.pop(
								`info`,
								`Decreased amount of the order's product!`
							);
						})
						.catch((err) => {
							this.toasterService.pop(
								`error`,
								`You can not decrease the qty
							of the product to 0, but you can remove selected product!`
							);
						});
					modalComponent.cancel();
				});
		} else {
			this.toasterService.pop(
				`error`,
				`There are no products for remove!`
			);
		}
		this.loading = false;
	}

	ngOnDestroy(): void {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
