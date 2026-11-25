import {
	Component,
	Input,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
} from '@angular/core';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { IProductImage } from '@modules/server.common/interfaces/IProduct';

/**
 * Products in a horizontal carousel, `showNum` at a time. The item at `currentIndex` is
 * highlighted; moving next near the end asks the parent for more products.
 * (A small native replacement for ngx-hm-carousel, which does not support Angular 22.)
 */
@Component({
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
	selector: 'carousel-view',
	styleUrls: ['./carousel-view.component.scss'],
	templateUrl: './carousel-view.component.html',
})
export class CarouselViewComponent {
	@Input()
	products: ProductInfo[];
	currentIndex = 0;
	direction = 'right';

	/** How many products are visible at once. */
	showNum = 4;

	productsCount: number = 5;

	@Output()
	loadProducts = new EventEmitter<number>();

	constructor(
		private readonly productLocalesService: ProductLocalesService
	) {}

	/** Width of one item, in % of the carousel. */
	get itemWidth(): number {
		return 100 / this.showNum;
	}

	/** Index of the first visible item: the current one, without blank space at the end. */
	get offset(): number {
		const length = this.products ? this.products.length : 0;
		return Math.max(
			0,
			Math.min(this.currentIndex, length - this.showNum)
		);
	}

	localeTranslate(member: ILocaleMember[]): string {
		return this.productLocalesService.getTranslate(member);
	}

	getImageOrientation(images: IProductImage[]) {
		return images.find(
			(i: IProductImage) => i.url === this.localeTranslate(images)
		).orientation;
	}

	showLeft() {
		if (this.currentIndex > 0) {
			this.direction = 'left';
			this.currentIndex--;
		}
	}

	showNext() {
		if (this.currentIndex < this.products.length - 1) {
			this.direction = 'right';
			this.currentIndex++;
		}

		this.showRight();
	}

	async showRight() {
		const productsLength = this.products.length;

		if (this.currentIndex + 1 >= productsLength - 3) {
			this.loadProducts.emit(this.productsCount);
		}
	}
}
