import {
	OnDestroy,
	Component,
	Output,
	EventEmitter,
	Input,
	ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { Subscription } from 'apollo-client/util/Observable';
import { Router } from '@angular/router';
import { NotifyService } from '../../../../@core/services/notify/notify.service';
import { ConfimationModalComponent } from '../../../../@shared/confirmation-modal/confirmation-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
	WarehouseProductViewModel,
	WarehouseProductsComponent,
} from '@app/@shared/warehouse-product/forms/warehouse-products-table';

@Component({
	selector: 'ea-store-products-table',
	templateUrl: './products-table.component.html',
	styleUrls: ['./products-table.component.scss'],
})
export class ProductsTableComponent implements OnDestroy {
	@ViewChild('productsTable', { static: true })
	productsTable: WarehouseProductsComponent;

	@Output()
	addProducts: EventEmitter<boolean> = new EventEmitter();

	@Input()
	warehouse: Warehouse;

	loading: boolean;

	private ngDestroy$ = new Subject<void>();
	private warehouseProducts$: Subscription;

	constructor(
		private readonly _warehouseProductsRouter: WarehouseProductsRouter,
		private readonly _productLocalesService: ProductLocalesService,
		private readonly warehouseRouter: WarehouseRouter,
		private readonly _router: Router,
		private readonly _notifyService: NotifyService,
		private readonly modalService: NgbModal
	) {}

	editProduct(ev) {
		this._router.navigate(['/products/list/' + ev.data.id + '/edit']);
	}

	removeProduct(ev) {
		const activeModal = this.modalService.open(ConfimationModalComponent, {
			size: 'sm',
			container: 'nb-layout',
			backdrop: 'static',
		});
		const modalComponent: ConfimationModalComponent =
			activeModal.componentInstance;

		modalComponent.confirmEvent
			.pipe(takeUntil(modalComponent.ngDestroy$))
			.subscribe((dataEvent) => {
				this.removeProducts([ev.data]);
				modalComponent.cancel();
			});
	}

	deleteSelectedRows() {
		this.removeProducts(this.productsTable.selectedProducts);
	}

	localeTranslate(member: ILocaleMember[]) {
		return this._productLocalesService.getTranslate(member);
	}

	async loadDataSmartTable(storeId) {
		if (this.warehouseProducts$) {
			this.warehouseProducts$.unsubscribe();
			this.productsTable.selectedProducts = [];
		}

		this.warehouseProducts$ = this._warehouseProductsRouter
			.get(storeId)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((p: WarehouseProduct[]) => {
				this.productsTable.loadDataSmartTable(p, storeId);
			});
	}

	removeProducts(warehouseProducts: WarehouseProductViewModel[]) {
		if (this.warehouse) {
			this.loading = true;
			this.warehouse.products = this.warehouse.products.filter(
				(p: WarehouseProduct) =>
					!warehouseProducts
						.map((product) => product.id)
						.includes(p.productId)
			);
			this.warehouseRouter.save(this.warehouse);
			this.loading = false;
			const message = 'Selected products are deleted!';
			this._notifyService.success(message);
		} else {
			const message = `Can't remove products`;
			this.loading = false;
			this._notifyService.error(message);
		}
	}

	ngOnDestroy(): void {
		console.warn('ProductsTableComponent destroyed');
	}
}
