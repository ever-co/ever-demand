import {
	Component,
	ViewChild,
	OnInit,
	OnDestroy,
	EventEmitter,
	Input,
	OnChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster';
import { WizardComponent } from 'angular2-wizard';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';

const SHOW_TOP_PRODUCTS_QUANTITY: number = 10;

@Component({
	selector: 'ea-warehouse-products-view',
	styleUrls: ['./warehouse-products-view.component.scss'],
	templateUrl: './warehouse-products-view.component.html',
})
export class WarehouseProductsViewComponent
	implements OnInit, OnDestroy, OnChanges {
	private _ngDestroy$ = new Subject<void>();

	protected warehouseID: string;
	protected topWarehouseProducts: WarehouseProduct[];

	public productTitle: string;

	@Input()
	public warehouse: Warehouse;

	constructor(
		private warehouseProductsRouter: WarehouseProductsRouter,
		private _productLocalesService: ProductLocalesService,
		private warehouseRouter: WarehouseRouter,
		private readonly _router: Router,
		private toasterService: ToasterService
	) {}

	ngOnChanges() {
		this._getTopWarehouseProducts();
	}
	ngOnInit() {
		this._getTopWarehouseProducts();
	}

	removeProduct(warehouseProduct: WarehouseProduct) {
		this.warehouse.products = this.warehouse.products.filter(
			(p: WarehouseProduct) => p.id !== warehouseProduct.id
		);
		this.warehouseRouter.save(this.warehouse);
	}

	editProduct(warehouseProduct: WarehouseProduct) {
		this._router.navigate([
			'/products/list/' + warehouseProduct.product['id'] + '/edit',
		]);
	}

	protected addProduct(warehouseProduct: WarehouseProduct) {
		this.warehouseProductsRouter.increaseCount(
			this.warehouse.id,
			warehouseProduct.productId,
			1
		);
		this.productTitle = this.localeTranslate(
			warehouseProduct.product['title']
		);

		this.toasterService.pop(
			'info',
			`${this.productTitle} product amound increased!`
		);
	}

	protected localeTranslate(member: ILocaleMember[]) {
		return this._productLocalesService.getTranslate(member);
	}

	private _getTopWarehouseProducts() {
		const id = this.warehouse.id;
		const quantity = SHOW_TOP_PRODUCTS_QUANTITY;
		this.warehouseID = id;

		this.warehouseProductsRouter
			.getTopProducts(this.warehouseID, quantity)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((products) => (this.topWarehouseProducts = products));
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
