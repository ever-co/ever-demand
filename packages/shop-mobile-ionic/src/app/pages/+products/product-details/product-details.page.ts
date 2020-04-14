import {
	Component,
	OnDestroy,
	AfterViewInit,
	NgZone,
	EventEmitter,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '../../../services/store.service';
import {
	SwiperInterface as Swiper,
	SwiperOptions,
} from '@ionic/core/dist/ionic/swiper/swiper-interface';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { NavController, ModalController } from '@ionic/angular';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { OrderPage } from '../+order/order.page';
import Product from '@modules/server.common/entities/Product';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { IProductImage } from '@modules/server.common/interfaces/IProduct';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { environment } from 'environments/environment';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import Order from '@modules/server.common/entities/Order';
import { IOrderCreateInput } from '@modules/server.common/routers/IWarehouseOrdersRouter';
import { OrderTakeawayInfoPopup } from '../+order/takeaway/popup/popup.component';
import { takeUntil, first } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
	selector: 'e-cu-product-details',
	templateUrl: './product-details.page.html',
	styleUrls: ['./product-details.page.scss'],
})
export class ProductDetailsPage implements AfterViewInit, OnDestroy {
	private static MAX_DESCRIPTION_LENGTH: number = 53;
	private readonly ngDestroy$ = new Subject<void>();
	private swiper: Swiper;
	private readonly swiperEvents$ = new Subject<'init' | 'next' | 'prev'>();
	private warehouseId: string;
	private warehouseProduct$: any;

	public swiperOptions: SwiperOptions;
	public product: WarehouseProduct;
	public productID: string;
	public prevUrl: string;
	public warehouseLogo: string;
	public image: IProductImage;
	public images: IProductImage[];
	public modalOpen: boolean;
	public modalChange = new EventEmitter<boolean>();
	public soldOut: boolean;

	constructor(
		private route: ActivatedRoute,
		private store: Store,
		private readonly translateProductLocales: ProductLocalesService,
		private readonly ngZone: NgZone,
		private router: Router,
		public navCtrl: NavController,
		public warehouseOrdersRouter: WarehouseOrdersRouter,
		public modalController: ModalController,
		public warehouseRouter: WarehouseRouter,
		public warehouseProductsRouter: WarehouseProductsRouter
	) {
		this.slideOptions();

		this.getModalChange();
	}

	ngAfterViewInit() {
		this.prevUrl = this.route.snapshot.queryParams.backUrl;
		this.warehouseId = this.route.snapshot.queryParams.warehouseId;
		this.loadProductImages();
	}

	slideOptions() {
		// TODO: use arrow functions instead of 'self'
		const self = this;

		this.swiperOptions = {
			autoHeight: true,
			slidesPerView: 2,
			spaceBetween: 5,
			resistance: true,
			watchSlidesProgress: true,
			longSwipes: false,
			on: {
				init() {
					self.swiper = this; // this = swiper instance here

					(window as any).swiper = this.swiper; // used for debugging

					self.swiperEvents$.next('init');
				},
				transitionStart: () => {
					if (this.swiper) {
						this.ngZone.run(() => {
							// this.progressBar.set(
							// 	(this.swiper.activeIndex + 1) *
							// 		(100 / this.product.product['image'].length)
							// );
						});
					}
				},
			},
		};
	}

	localeTranslate(member: ILocaleMember[]): string {
		return this.translateProductLocales.getTranslate(member);
	}

	async buyItem(currentProduct: Product) {
		if (
			!this.store.userId &&
			this.store.registrationSystem === RegistrationSystem.Disabled
		) {
			this.store.registrationSystem = RegistrationSystem.Once;
			this.store.buyProduct = currentProduct.id;
			this.store.backToDetails = currentProduct.id;
			this.store.warehouseId = this.warehouseId;
			this.navCtrl.navigateRoot('/invite');
		} else {
			const orderCreateInput: IOrderCreateInput = {
				warehouseId: this.warehouseId,
				products: [{ count: 1, productId: currentProduct.id }],
				userId: this.store.userId,
				orderType: this.store.deliveryType,
				options: { autoConfirm: true },
			};

			const order: Order = await this.warehouseOrdersRouter.create(
				orderCreateInput
			);

			this.store.orderId = order.id;

			this.store.orderWarehouseId = order.warehouseId;

			if (environment.ORDER_INFO_TYPE === 'popup') {
				this.showOrderInfoModal();
			}

			if (environment.ORDER_INFO_TYPE === 'page') {
				this.router.navigate([
					`${
						this.store.deliveryType === DeliveryType.Delivery
							? '/order-info'
							: '/order-info-takeaway'
					}`,
				]);
			}
		}
	}

	// Should make goBack to previous page
	goToProductPage() {
		this.router.navigateByUrl(this.prevUrl);
	}

	shortenDescription(desc: string) {
		return desc.length < ProductDetailsPage.MAX_DESCRIPTION_LENGTH
			? desc
			: desc.substr(0, ProductDetailsPage.MAX_DESCRIPTION_LENGTH - 3) +
					'...';
	}
	private async showOrderInfoModal(): Promise<void> {
		const modal = await this.modalController.create({
			component:
				this.store.deliveryType === DeliveryType.Delivery
					? OrderPage
					: OrderTakeawayInfoPopup,
			cssClass: 'order-info-modal',
			componentProps: { modalChange: this.modalChange },
		});

		this.modalChange.emit(true);

		return modal.present();
	}

	private getModalChange() {
		this.modalChange
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe((result) => {
				this.modalOpen = result;
			});
	}

	private continueOrder() {
		const buyProductId = this.store.buyProduct;
		if (this.store.userId) {
			if (buyProductId && buyProductId !== 'null') {
				this.buyItem(this.product.product as Product);
				this.store.buyProduct = null;
				this.store.warehouseId = null;
			}
		} else {
			this.store.buyProduct = null;
			this.store.warehouseId = null;
		}
	}

	private _subscribeWarehouseProduct() {
		if (this.warehouseProduct$) {
			this.warehouseProduct$.unsubscribe();
		}

		if (this.product) {
			this.warehouseProduct$ = this.warehouseProductsRouter
				.get(this.warehouseId, false)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((r) => {
					const prod = r.filter(
						(p) => p.productId === this.product.productId
					)[0];
					this.soldOut = !prod || prod.count <= 0;
				});
		}
	}

	private async loadProductImages() {
		this.productID = this.route.snapshot.paramMap.get('id');

		const warehouse = await this.warehouseRouter
			.get(this.warehouseId, true)
			.pipe(first())
			.toPromise();

		this.warehouseLogo = warehouse.logo;

		const products = warehouse.products;

		// here is using "[0]" because filter return array, using id for filter we are sure that it will be correct
		this.product = products.filter(
			(p) => p.product['id'] === this.productID
		)[0];

		this.continueOrder();

		this.loadImages();

		this._subscribeWarehouseProduct();
	}

	private loadImages() {
		const currentProduct = this.product.product as Product;

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
				this.image = horizontal[0];
			} else if (vertical.length === 1) {
				this.images = horizontal;
			} else if (horizontal.length === 1) {
				this.images = vertical;
			} else {
				if (vertical.length > 0) {
					this.images = vertical;
				} else {
					this.images = horizontal;
				}
			}
		} else if (currentProduct.images.length === 1) {
			// here use "[0]" because from expression we have exactly one image
			this.image = currentProduct.images[0];
		}
	}

	ngOnDestroy() {
		if (this.swiperEvents$) {
			this.swiperEvents$.complete();
		}
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
