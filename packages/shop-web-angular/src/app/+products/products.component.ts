import {
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import { Store } from 'app/services/store';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { IOrderCreateInput } from '@modules/server.common/routers/IWarehouseOrdersRouter';
import { Router } from '@angular/router';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import {
	first,
	takeUntil,
	debounceTime,
	distinctUntilChanged,
} from 'rxjs/operators';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { GeoLocationService } from 'app/services/geo-location';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';
import { GeoLocationProductsService } from 'app/services/geo-location-products';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import { WarehouseProductsService } from 'app/services/warehouse-products';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { CarouselViewComponent } from './views/carousel/carousel-view.component';
import { environment } from 'environments/environment';

const initializeProductsNumber: number = 10;

@Component({
	selector: 'products',
	styleUrls: ['./products.component.scss'],
	templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit, OnDestroy {
	@ViewChild('carouselView')
	carouselView: CarouselViewComponent;

	products: ProductInfo[] = [];
	productsLoading: boolean = true;
	searchModel: string;
	searchText: string;
	modelChanged: Subject<string> = new Subject<string>();
	isWideView: boolean;

	private getOrdersGeoObj: { loc: ILocation };
	private productsCount: number;
	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly store: Store,
		private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
		private readonly router: Router,
		private readonly userRouter: UserRouter,
		private readonly geoLocationService: GeoLocationService,
		private readonly geoLocationProductsService: GeoLocationProductsService,
		private readonly warehouseProductsService: WarehouseProductsService
	) {
		this.isWideView = this.store.productListViewSpace === 'wide';
		this.loadGeoLocationProducts();
		this.productsFilter();
	}

	get isListView() {
		return this.store.productViewType !== 'carousel';
	}

	productsFilter() {
		this.modelChanged
			.pipe(
				debounceTime(1000), // wait 500ms after the last event before emitting last event
				distinctUntilChanged() // only emit if value is different from previous valuetakeUntil(this._ngDestroy$))
			)
			.subscribe(async (text) => {
				this.searchText = text;
				this.products = [];
				this.productsLoading = true;

				if (this.carouselView) {
					this.carouselView.currentIndex = 0;
				}

				await this.loadProducts();
			});
	}

	changedProducts(text: string) {
		this.modelChanged.next(text);
	}

	ngOnInit() {
		if (this.products) {
			this.continueOrder();
		}
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	private async buyItem(currentProduct: WarehouseProduct, warehouseId) {
		const orderCreateInput: IOrderCreateInput = {
			warehouseId,
			orderType: this.store.deliveryType,
			products: [{ count: 1, productId: currentProduct.product['id'] }],
			userId: this.store.userId,
			options: { autoConfirm: true },
		};

		await this.warehouseOrdersRouter.create(orderCreateInput);

		this.router.navigate(['/orders']);
	}

	private async continueOrder() {
		const buyProduct = this.store.buyProduct;

		if (buyProduct) {
			const userId = this.store.userId;
			const mechantId = this.store.mechantId;

			if (userId && mechantId) {
				const productForBuy = await this.warehouseProductsService.getWarehouseProduct(
					mechantId,
					buyProduct
				);

				if (productForBuy) {
					this.buyItem(productForBuy, mechantId);
					this.store.buyProduct = '';
					this.store.mechantId = '';
				}
			} else {
				this.store.buyProduct = '';
				this.store.mechantId = '';
			}
		}
	}
	private async loadGeoLocationProducts() {
		let geoLocationForProducts: GeoLocation;

		const isProductionEnv = environment.production;

		if (this.store.userId && isProductionEnv) {
			const user = await this.userRouter
				.get(this.store.userId)
				.pipe(first())
				.toPromise();

			geoLocationForProducts = user.geoLocation;
		} else {
			try {
				geoLocationForProducts = await this.geoLocationService.getCurrentGeoLocation();
			} catch (error) {
				console.warn(error);
			}
		}

		this.getOrdersGeoObj = {
			loc: {
				type: 'Point',
				coordinates: geoLocationForProducts.loc.coordinates,
			},
		};

		this.loadProducts();
	}

	private async loadProducts(count?: number) {
		this.productsLoading = true;
		await this.loadProductsCount();

		if (this.productsCount > this.products.length) {
			if (this.getOrdersGeoObj) {
				const isDeliveryRequired =
					this.store.deliveryType === DeliveryType.Delivery;
				const isTakeaway =
					this.store.deliveryType === DeliveryType.Takeaway;

				const products = await this.geoLocationProductsService
					.geoLocationProductsByPaging(
						this.getOrdersGeoObj,
						{
							skip: this.products.length,
							limit: count ? count : initializeProductsNumber,
						},
						{ isDeliveryRequired, isTakeaway },
						this.searchText
					)
					.pipe(first())
					.toPromise();

				this.products.push(...products);
			} else {
				this.store.registrationSystem = RegistrationSystem.Once;
				this.router.navigate(['/login']);
			}
		}
		this.productsLoading = false;
	}

	private async loadProductsCount() {
		if (this.getOrdersGeoObj) {
			const isDeliveryRequired =
				this.store.deliveryType === DeliveryType.Delivery;
			const isTakeaway =
				this.store.deliveryType === DeliveryType.Takeaway;

			this.productsCount = await this.geoLocationProductsService.getCountOfGeoLocationProducts(
				this.getOrdersGeoObj,
				{ isDeliveryRequired, isTakeaway },
				this.searchText
			);
		}
	}
}
