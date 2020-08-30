import { Component, Input } from '@angular/core';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import IWarehouse from '@modules/server.common/interfaces/IWarehouse';
import IWarehouseProduct from '@modules/server.common/interfaces/IWarehouseProduct';
import IUser from '@modules/server.common/interfaces/IUser';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { Store } from 'app/services/store';

@Component({
	selector: 'taggroup-remove-modal',
	templateUrl: './buy-product.component.html',
})
export class BuyProductComponent {
	@Input()
	public warehouse: IWarehouse;
	@Input()
	public warehouseProduct: IWarehouseProduct;
	@Input()
	public user: IUser;

	constructor(
		// private readonly activeModal: NgbActiveModal,
		private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
		private readonly _productLocalesService: ProductLocalesService,
		private readonly store: Store
	) {}

	async createOrder() {
		this.warehouseOrdersRouter.createByProductType(
			this.user._id.toString(),
			this.warehouse._id.toString(),
			this.warehouseProduct._id.toString(),
			this.store.deliveryType
		);
	}

	protected localeTranslate(member: ILocaleMember[]) {
		return this._productLocalesService.getTranslate(member);
	}
}
