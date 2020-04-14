import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProductLocalesService } from '../../../services/product-locales.service';
import OrderProduct from '@modules/server.common/entities/OrderProduct';
import { Store } from '../../../services/store.service';

@Component({
	selector: 'e-cu-order-product',
	styleUrls: ['./product.component.scss'],
	templateUrl: './product.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent {
	private static MAX_DESCRIPTION_LENGTH: number = 53;

	@Input()
	orderProduct: OrderProduct;
	@Input()
	showDetailsButton: boolean = false;

	constructor(
		private readonly translateProductLocales: ProductLocalesService,
		private readonly store: Store
	) {}

	get title() {
		return this.translateProductLocales.getTranslate(
			this.orderProduct.product.title
		);
	}

	get description() {
		const description = this.translateProductLocales.getTranslate(
			this.orderProduct.product.description
		);

		return description.length < ProductComponent.MAX_DESCRIPTION_LENGTH
			? description
			: description.substring(
					0,
					ProductComponent.MAX_DESCRIPTION_LENGTH - 3
			  ) + '...';
	}

	get image() {
		return (
			this.orderProduct.product.images.find(
				(product) => product.locale === this.store.language
			) ||
			this.orderProduct.product.images.find(
				(product) => product.locale === 'en-US'
			)
		);
	}

	get imageClass() {
		switch (this.image.orientation) {
			case 1:
				return 'vertical';
			case 2:
				return 'horizontal';
			default:
				return 'square';
		}
	}

	get count() {
		return this.orderProduct.count;
	}

	get price(): number {
		return this.orderProduct.count * this.orderProduct.price;
	}

	get showInsideDetailsButton() {
		const description = this.translateProductLocales.getTranslate(
			this.orderProduct.product.description
		);
		const isTwoRowsDesc =
			description.length > ProductComponent.MAX_DESCRIPTION_LENGTH / 2;

		return (
			this.showDetailsButton &&
			!isTwoRowsDesc &&
			this.image.orientation === 1
		);
	}

	get showOutsideDetailsButton() {
		const description = this.translateProductLocales.getTranslate(
			this.orderProduct.product.description
		);
		const isTwoRowsDesc =
			description.length > ProductComponent.MAX_DESCRIPTION_LENGTH / 2;

		return (
			this.showDetailsButton &&
			(this.image.orientation !== 1 || isTwoRowsDesc)
		);
	}
}
