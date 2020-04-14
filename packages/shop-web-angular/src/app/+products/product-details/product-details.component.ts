import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { takeUntil, first } from 'rxjs/operators';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import IWarehouse from '@modules/server.common/interfaces/IWarehouse';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { Store } from 'app/services/store';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import Product from '@modules/server.common/entities/Product';
import { IProductImage } from '@modules/server.common/interfaces/IProduct';

const defaultDeliveryTimeMin = environment.DELIVERY_TIME_MIN;
const defaultDeliveryTimeMax = environment.DELIVERY_TIME_MAX;

interface RouteParams {
	productId: string;
	warehouseId: string;
}

@Component({
	selector: 'product-details',
	styleUrls: ['./product-details.component.scss'],
	animations: [
		trigger('enterAnimation', [
			transition(':enter', [
				style({ opacity: 0 }),
				animate('200ms', style({ opacity: 1 })),
			]),
			transition(':leave', [
				style({ opacity: 1 }),
				animate('200ms', style({ opacity: 0 })),
			]),
		]),
	],
	templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
	@HostBinding('@enterAnimation')
	enterAnimation: any;

	productId: string;
	warehouseId: string;

	warehouse: IWarehouse;
	warehouseProduct: WarehouseProduct;

	images: IProductImage[];

	private ngUnsubscribe: Subject<void> = new Subject<void>();
	private isTakeaway: boolean;
	private minutesText: string;
	private readyForText: string;

	constructor(
		private readonly route: ActivatedRoute,
		private readonly router: Router,
		private readonly warehouseRouter: WarehouseRouter,
		private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
		private readonly orderRouter: OrderRouter,
		private readonly _productLocalesService: ProductLocalesService,
		private readonly store: Store,
		private translateService: TranslateService
	) {
		this.isTakeaway = this.store.deliveryType === DeliveryType.Takeaway;
		this.route.params
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((params: RouteParams) => this.onParams(params));
	}

	ngOnInit() {
		this.getMinutesText();
		this.getReadyForText();
		this.warehouseRouter.get(this.warehouseId, true).subscribe((w) => {
			this.warehouseProduct = w.products.filter(
				(res) => res.product['id'] === this.productId
			)[0];
			this.warehouse = w;
			this.loadImages();
		});
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	async createOrder(): Promise<void> {
		if (
			!this.store.userId &&
			this.store.registrationSystem === RegistrationSystem.Disabled
		) {
			this.store.registrationSystem = RegistrationSystem.Once;
			this.store.buyProduct = this.warehouseProduct.id;
			this.store.mechantId = this.warehouseId;
			this.router.navigate(['/login']);
		} else {
			const userId = this.store.userId;

			const order = await this.warehouseOrdersRouter.createByProductType(
				userId,
				this.warehouseId,
				this.productId,
				this.store.deliveryType
			);

			await this.orderRouter.confirm(order.id);

			this.router.navigate(['/orders']);
		}
	}

	getDeliveryTime() {
		if (this.warehouseProduct != null) {
			const productInfo = this.warehouseProduct;

			if (!this.isTakeaway) {
				if (
					productInfo.deliveryTimeMax != null &&
					productInfo.deliveryTimeMin != null
				) {
					return (
						productInfo.deliveryTimeMin +
						'-' +
						productInfo.deliveryTimeMax +
						' ' +
						this.minutesText
					);
				} else {
					return (
						defaultDeliveryTimeMin +
						'-' +
						defaultDeliveryTimeMax +
						' ' +
						this.minutesText
					);
				}
			} else {
				if (
					productInfo.deliveryTimeMax == null ||
					productInfo.deliveryTimeMax <= 15
				) {
					return this.readyForText;
				} else {
					if (
						productInfo.deliveryTimeMax != null &&
						productInfo.deliveryTimeMin != null
					) {
						return (
							productInfo.deliveryTimeMin +
							'-' +
							productInfo.deliveryTimeMax +
							' ' +
							this.minutesText
						);
					} else {
						return (
							defaultDeliveryTimeMin +
							'-' +
							defaultDeliveryTimeMax +
							' ' +
							this.minutesText
						);
					}
				}
			}
		}
	}

	protected localeTranslate(member: ILocaleMember[]): string {
		return this._productLocalesService.getTranslate(member);
	}

	private onParams(params: RouteParams): void {
		this.productId = params.productId;
		this.warehouseId = params.warehouseId;
	}

	private async getMinutesText() {
		this.minutesText = await this.translateService
			.get('PRODUCTS_VIEW.MINUTES')
			.pipe(first())
			.toPromise();
	}

	private async getReadyForText() {
		this.readyForText = await this.translateService
			.get('PRODUCTS_VIEW.READYFOR')
			.pipe(first())
			.toPromise();
	}

	private loadImages() {
		const currentProduct = this.warehouseProduct.product as Product;

		if (currentProduct.images.length > 1) {
			const horizontal = currentProduct.images.filter(
				(i: IProductImage) => i.orientation === 2
			);

			const vertical = currentProduct.images.filter(
				(i: IProductImage) => i.orientation !== 2
			);

			if (
				vertical.length === horizontal.length &&
				vertical.length === 1
			) {
				// here use "[0]" because from expression we have exactly one image
				this.images = [horizontal[0]];
			} else if (vertical.length === 1) {
				this.images = horizontal;
			} else if (horizontal.length === 1) {
				this.images = vertical;
			} else {
				if (horizontal.length > 0) {
					this.images = horizontal;
				} else {
					this.images = vertical;
				}
			}
		} else if (currentProduct.images.length === 1) {
			// here use "[0]" because from expression we have exactly one image
			this.images = [currentProduct.images[0]];
		}
	}
}
