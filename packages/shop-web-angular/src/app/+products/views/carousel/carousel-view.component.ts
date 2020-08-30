import { Component, Input, Output, EventEmitter } from '@angular/core';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { IProductImage } from '@modules/server.common/interfaces/IProduct';

@Component({
	selector: 'carousel-view',
	styleUrls: ['./carousel-view.component.scss'],
	templateUrl: './carousel-view.component.html',
})
export class CarouselViewComponent {
	@Input()
	products: ProductInfo[];
	currentIndex = 0;
	direction = 'right';

	productsCount: number = 5;

	@Output()
	loadProducts = new EventEmitter<number>();

	constructor(
		private readonly productLocalesService: ProductLocalesService
	) {}

	localeTranslate(member: ILocaleMember[]): string {
		return this.productLocalesService.getTranslate(member);
	}

	getImageOrientation(images: IProductImage[]) {
		return images.find(
			(i: IProductImage) => i.url === this.localeTranslate(images)
		).orientation;
	}

	async showRight() {
		const productsLength = this.products.length;

		if (this.currentIndex + 1 >= productsLength - 3) {
			this.loadProducts.emit(this.productsCount);
		}
	}
}
