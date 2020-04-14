import { Router } from '@angular/router';
import {
	Component,
	Input,
	AfterViewInit,
	EventEmitter,
	Output,
	OnChanges,
} from '@angular/core';
import {
	animate,
	state,
	style,
	transition,
	trigger,
} from '@angular/animations';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/fromEvent';
import { ElementQueries } from 'css-element-queries/src/ElementQueries';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { Store } from 'app/services/store';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';
import { IProductImage } from '@modules/server.common/interfaces/IProduct';

@Component({
	selector: 'product',
	animations: [
		trigger('show', [
			state('shown', style({ opacity: 1 })),
			state('hidden', style({ opacity: 0 })),
			transition('shown <=> hidden', animate('.2s')),
		]),
	],
	styleUrls: ['./product.component.scss'],
	templateUrl: './product.component.html',
})
export class ProductComponent implements OnChanges {
	@Output()
	load: EventEmitter<void> = new EventEmitter<void>();

	@Input()
	info: ProductInfo;

	showTitle: 'shown' | 'hidden' = 'hidden';
	isGridView: boolean;
	productImage: IProductImage;

	@Input()
	private layoutComplete: Observable<void>;

	constructor(
		private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
		private readonly orderRouter: OrderRouter,
		private readonly router: Router,
		private readonly _productLocalesService: ProductLocalesService,
		private readonly store: Store
	) {
		this.isGridView = this.store.productListViewType === 'grid';
	}

	ngOnChanges(): void {
		if (this.info) {
			this.productImage = this.info.warehouseProduct.product[
				'images'
			].find((i: IProductImage) => {
				return (
					i.url ===
					this.localeTranslate(
						this.info.warehouseProduct.product['images']
					)
				);
			});
		}
	}

	onImageLoad(): void {
		if (ElementQueries) {
			ElementQueries.init();
		}

		this.load.emit();
		this.showTitle = 'shown';
	}

	onLayoutComplete(): void {
		return;
	}

	async createOrder(): Promise<void> {
		if (
			!this.store.userId &&
			this.store.registrationSystem === RegistrationSystem.Disabled
		) {
			this.store.registrationSystem = RegistrationSystem.Once;
			this.store.buyProduct = this.info.warehouseProduct.id;
			this.store.mechantId = this.info.warehouseId;
			this.router.navigate(['/login']);
		} else {
			const userId = this.store.userId;

			const order = await this.warehouseOrdersRouter.createByProductType(
				userId,
				this.info.warehouseId,
				this.info.warehouseProduct.product['id'],
				this.store.deliveryType
			);

			await this.orderRouter.confirm(order.id);

			this.router.navigate(['/orders']);
		}
	}

	protected localeTranslate(member: ILocaleMember[]): string {
		return this._productLocalesService.getTranslate(member);
	}

	private resizeWorks(): void {
		/*Observable.fromEvent(this.titleElement.nativeElement, 'resize');
		 https://stackoverflow.com/questions/39084250/how-to-get-width-of-dom-element-in-angular2
		 https://stackoverflow.com/questions/37770226/observable-from-button-click-event-in-angular2*/
	}
}
