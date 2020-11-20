import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Inject,
	Output,
	EventEmitter,
} from '@angular/core';
import { ProductLocalesService } from '../../../services/product-locales.service';
import OrderProduct from '@modules/server.common/entities/OrderProduct';
import { Store } from '../../../services/store.service';
import { DOCUMENT } from '@angular/common';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';

@Component({
	selector: 'e-cu-order-product',
	styleUrls: ['./product.component.scss'],
	templateUrl: './product.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent {
	isRemove: boolean;
	showAddComment = false;

	@Output()
	onAddComment = new EventEmitter<{ comment: string; productId: string }>();

	private static MAX_DESCRIPTION_LENGTH: number = 53;

	@Input()
	orderProduct: OrderProduct;
	@Input()
	orderId: string;
	@Input()
	showDetailsButton: boolean = false;

	@Input()
	inProcessing: boolean = false;

	@Output()
	remove = new EventEmitter<OrderProduct>();

	constructor(
		@Inject(DOCUMENT) public document: Document,
		private readonly translateProductLocales: ProductLocalesService,
		private orderRouter: OrderRouter,
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

	get hasComment() {
		return !!this.orderProduct.comment;
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

	onRemove() {
		this.isRemove = true;
		this.remove.emit(this.orderProduct);
	}

	async addComment(e) {
		const comment = e.target.value;
		const productId = this.orderProduct.id;
		const order = await this.orderRouter.addProductComment(
			this.orderId,
			productId,
			comment
		);
		this.orderProduct = order.products.find(
			(p) => p.id == this.orderProduct.id
		);

		this.showAddComment = false;
	}

	showCommentBox() {
		this.showAddComment = true;
	}
}
