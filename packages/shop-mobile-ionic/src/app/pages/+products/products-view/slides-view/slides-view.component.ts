import {
	ChangeDetectionStrategy,
	AfterViewInit,
	Component,
	ElementRef,
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
import type { SwiperContainer } from 'swiper/element';
import type { Swiper, SwiperOptions } from 'swiper/types';
// TODO Fix Progress Bar
// import { NgProgress } from 'ngx-progressbar';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { Router } from '@angular/router';
import { Store } from '../../../../services/store.service';

const initializeProductsNumber: number = 10;

@Component({
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
	selector: 'e-cu-products-slides-view',
	templateUrl: './slides-view.component.html',
	styleUrls: ['./slides-view.component.scss'],
})
export class ProductsSlidesViewComponent
	implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
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

	// ion-slides was removed in Ionic 7. The feed is a Swiper element now
	// (registered in main.ts) with the same options as before.
	@ViewChild('slides')
	slides: ElementRef<SwiperContainer>;

	imageOrientation: number = 1;
	product: ProductInfo;

	// https://swiperjs.com/swiper-api#events
	readonly swiperOptions: SwiperOptions;

	private swiper: Swiper;
	private readonly swiperEvents$ = new Subject<'init' | 'next' | 'prev'>();
	private readonly ngDestroy$ = new Subject<void>();
	private static MAX_DESCRIPTION_LENGTH: number = 45;

	constructor(
		// TODO Fix Progress Bar
		// private readonly progressBar: NgProgress,
		private readonly translateProductLocales: ProductLocalesService,
		private readonly ngZone: NgZone,
		private router: Router,
		private store: Store
	) {
		this.swiperOptions = {
			autoHeight: true,
			resistance: true,
			watchSlidesProgress: true,
			longSwipes: false,
			// Slides come and go with *ngFor, so Swiper watches them.
			observer: true,
			observeParents: true,
			on: {
				init: (swiper: Swiper) => {
					this.swiper = swiper;
					(window as any).swiper = swiper; // used for debugging

					this.swiperEvents$.next('init');
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
		if (products && products.currentValue.length === 0 && this.swiper) {
			this.swiper.slideTo(0);
		}
	}

	ngAfterViewInit() {
		// TODO Progressbar doesn't work
		// this.progressBar.start();
		// this.progressBar.set(100 / this.products.length);

		this._loadData(0);

		const element = this.slides?.nativeElement;

		// The Swiper element is not registered in unit tests (jsdom).
		if (element && typeof element.initialize === 'function') {
			Object.assign(element, this.swiperOptions);
			element.initialize();
			this.swiper = this.swiper || element.swiper;
		}
	}

	// Swiper's slideChangeTransitionStart is the event ion-slides called
	// ionSlideWillChange.
	onSlideWillChange() {
		const index = this.swiper ? this.swiper.activeIndex : 0;

		if (this.products.length - 1 <= index + 1) {
			this.loadProducts.emit({
				count: initializeProductsNumber,
				imageOrientation: this.imageOrientation,
			});
		}

		this._loadData(index);
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

		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}

	private _loadData(index: number) {
		this.product = this.products[index];
	}
}
