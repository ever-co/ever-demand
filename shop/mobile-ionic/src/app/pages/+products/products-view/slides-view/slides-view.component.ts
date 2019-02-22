import {
	AfterViewInit,
	Component,
	EventEmitter,
	Input,
	NgZone,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChange,
	ViewChild
} from '@angular/core';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { Subject } from 'rxjs';
import {
	SwiperInterface as Swiper,
	SwiperOptions
} from '@ionic/core/dist/ionic/swiper/swiper-interface';
import { differenceBy, pullAllBy } from 'lodash';
// TODO Fix Progress Bar
// import { NgProgress } from '@ngx-progressbar/core';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { Router } from '@angular/router';
import { Store } from '../../../../services/store.service';
import { takeUntil } from 'rxjs/operators';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { IonSlides } from '@ionic/angular';
import { environment } from 'environment';

@Component({
	selector: 'e-cu-products-slides-view',
	templateUrl: './slides-view.component.html',
	styleUrls: ['./slides-view.component.scss']
})
export class ProductsSlidesViewComponent
	implements OnInit, AfterViewInit, OnChanges, OnDestroy {
	private static MAX_DESCRIPTION_LENGTH: number = 45;
	@Input()
	products: ProductInfo[];

	@Input()
	placeholder: string;

	@Output()
	buy = new EventEmitter<ProductInfo>();

	@ViewChild(IonSlides)
	slides: IonSlides;

	public done: boolean;

	private swiper: Swiper;
	private readonly swiperEvents$ = new Subject<'init' | 'next' | 'prev'>();

	private readonly ngDestroy$ = new Subject<void>();

	// http://idangero.us/swiper/api/#events
	readonly swiperOptions: SwiperOptions;

	private slides$: any;

	warehouseProduct: ProductInfo;
	private warehouseProduct$;

	soldOut: boolean;

	constructor(
		// TODO Fix Progress Bar
		// private readonly progressBar: NgProgress,
		private readonly translateProductLocales: ProductLocalesService,
		private readonly ngZone: NgZone,
		private router: Router,
		private store: Store,
		private warehouseProductsRouter: WarehouseProductsRouter
	) {
		// tslint:disable-next-line:no-this-assignment
		const self = this;

		this.swiperOptions = {
			autoHeight: true,
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
							// TODO Fix Progress Bar
							// this.progressBar.set(
							// 	(this.swiper.activeIndex + 1) *
							// 		(100 / this.products.length)
							// );
						});
					}
				}
			}
		};
	}

	ngOnInit() {
		const correctProducts = this.products.map((p: ProductInfo) => {
			const product = p;
			product.product['images'] = p.product['images'].filter(
				(i) =>
					i.orientation === 1 &&
					(i.locale === this.store.language ||
						i.locale === environment.DEFAULT_LOCALE)
			);
			return product;
		});
		this.products = correctProducts.filter(
			(p) => p.product['images'].length > 0
		);

		this.done = true;
	}

	ngOnChanges({ products }: { products: SimpleChange }) {
		if (!products || products.isFirstChange()) {
			return;
		}

		const previousProducts = products.previousValue as ProductInfo[];
		const currentProducts = products.currentValue as ProductInfo[];

		const removedProducts: ProductInfo[] = differenceBy(
			previousProducts,
			currentProducts,
			'warehouseProduct.id'
		);
		const newProducts: ProductInfo[] = differenceBy(
			currentProducts,
			previousProducts,
			'warehouseProduct.id'
		);

		pullAllBy(
			currentProducts,
			removedProducts /*TODO without(removedProducts, this.currentProduct)*/,
			'warehouseProduct.id'
		); // remove all removed products that are not the one shown
		currentProducts.push(...newProducts); // add all the new products at the end
	}

	buyProduct(prod: ProductInfo) {
		this.buy.emit(prod);
	}

	ngAfterViewInit() {
		// TODO Progressbar doesn't work
		// this.progressBar.start();
		// this.progressBar.set(100 / this.products.length);

		this._loadData(0);
		this._subscribeWarehouseProduct();
		this.slides$ = this.slides.ionSlideWillChange.subscribe(async () => {
			const index = await this.slides.getActiveIndex();
			this._loadData(index);
			this._subscribeWarehouseProduct();
		});
	}
	shortenDescription(desc: string) {
		return desc.length < ProductsSlidesViewComponent.MAX_DESCRIPTION_LENGTH
			? desc
			: desc.substr(
					0,
					ProductsSlidesViewComponent.MAX_DESCRIPTION_LENGTH - 3
			  ) + '...';
	}

	localeTranslate(member: ILocaleMember[]): string {
		return this.translateProductLocales.getTranslate(member);
	}

	goToDetailsPage(product: ProductInfo) {
		this.router.navigate(
			[
				`/products/product-details/${
					product.warehouseProduct.product['_id']
				}`
			],
			{
				queryParams: {
					backUrl: '/products',
					warehouseId: product.warehouseId
				}
			}
		);
	}

	private _loadData(index: number) {
		this.warehouseProduct = this.products[index];
	}

	private _subscribeWarehouseProduct() {
		if (this.warehouseProduct$) {
			this.warehouseProduct$.unsubscribe();
		}

		if (this.warehouseProduct) {
			this.warehouseProduct$ = this.warehouseProductsRouter
				.get(this.warehouseProduct.warehouseId, false)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((r) => {
					const prod = r.filter(
						(p) =>
							p.productId === this.warehouseProduct.product['id']
					)[0];
					this.soldOut = !prod || prod.count <= 0;
				});
		}
	}

	ngOnDestroy() {
		this.swiperEvents$.complete();

		if (this.slides$) {
			this.slides$.unsubscribe();
		}

		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
