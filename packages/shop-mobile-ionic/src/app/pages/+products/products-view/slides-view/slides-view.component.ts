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
	ViewChild,
} from '@angular/core';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { Subject } from 'rxjs';
import {
	SwiperInterface as Swiper,
	SwiperOptions,
} from '@ionic/core/dist/ionic/swiper/swiper-interface';
import { differenceBy, pullAllBy } from 'lodash';
// TODO Fix Progress Bar
// import { NgProgress } from '@ngx-progressbar/core';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { Router } from '@angular/router';
import { Store } from '../../../../services/store.service';
import { IonSlides } from '@ionic/angular';

const initializeProductsNumber: number = 10;

@Component({
	selector: 'e-cu-products-slides-view',
	templateUrl: './slides-view.component.html',
	styleUrls: ['./slides-view.component.scss'],
})
export class ProductsSlidesViewComponent
	implements OnInit, AfterViewInit, OnChanges, OnDestroy {
	@Input()
	products: ProductInfo[];

	@Input()
	placeholder: string;

	@Output()
	buy = new EventEmitter<ProductInfo>();

	@Input()
	$areProductsLoaded: EventEmitter<boolean>;

	@Input()
	areProductsLoaded: boolean;

	@Output()
	loadProducts = new EventEmitter<{
		count?: number;
		imageOrientation?: number;
	}>();

	@Output()
	goToDetailsPage = new EventEmitter<ProductInfo>();

	@ViewChild(IonSlides)
	slides: IonSlides;

	imageOrientation: number = 1;
	product: ProductInfo;

	// http://idangero.us/swiper/api/#events
	readonly swiperOptions: SwiperOptions;

	private swiper: Swiper;
	private readonly swiperEvents$ = new Subject<'init' | 'next' | 'prev'>();
	private readonly ngDestroy$ = new Subject<void>();
	private slides$: any;
	private static MAX_DESCRIPTION_LENGTH: number = 45;

	constructor(
		// TODO Fix Progress Bar
		// private readonly progressBar: NgProgress,
		private readonly translateProductLocales: ProductLocalesService,
		private readonly ngZone: NgZone,
		private router: Router,
		private store: Store
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
				},
			},
		};
	}

	get showProducts() {
		return this.products.filter((p) => p.warehouseProduct.count !== 0);
	}

	ngOnInit() {
		this.loadProducts.emit({
			count: initializeProductsNumber,
			imageOrientation: this.imageOrientation,
		});
	}

	ngOnChanges({ products }: { products: SimpleChange }) {
		if (products && products.currentValue.length === 0 && this.slides) {
			this.slides.slideTo(0);
		}

		//This logic works when all products are loaded in the begin
		// if (!products || products.isFirstChange()) {
		// 	return;
		// }
		// const previousProducts = products.previousValue as ProductInfo[];
		// const currentProducts = products.currentValue as ProductInfo[];
		// const removedProducts: ProductInfo[] = differenceBy(
		// 	previousProducts,
		// 	currentProducts,
		// 	'warehouseProduct.id'
		// );
		// const newProducts: ProductInfo[] = differenceBy(
		// 	currentProducts,
		// 	previousProducts,
		// 	'warehouseProduct.id'
		// );
		// pullAllBy(
		// 	currentProducts,
		// 	removedProducts /*TODO without(removedProducts, this.currentProduct)*/,
		// 	'warehouseProduct.id'
		// ); // remove all removed products that are not the one shown
		// currentProducts.push(...newProducts); // add all the new products at the end
	}

	ngAfterViewInit() {
		// TODO Progressbar doesn't work
		// this.progressBar.start();
		// this.progressBar.set(100 / this.products.length);

		this._loadData(0);
		this.slides$ = this.slides.ionSlideWillChange.subscribe(async () => {
			const index = await this.slides.getActiveIndex();

			if (this.products.length - 1 <= index + 1) {
				this.loadProducts.emit({
					count: initializeProductsNumber,
					imageOrientation: this.imageOrientation,
				});
			}

			this._loadData(index);
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

	ngOnDestroy() {
		this.swiperEvents$.complete();

		if (this.slides$) {
			this.slides$.unsubscribe();
		}

		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}

	private _loadData(index: number) {
		this.product = this.products[index];
	}
}
