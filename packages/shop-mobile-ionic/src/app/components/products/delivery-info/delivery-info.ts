import { Component, Input, OnInit } from '@angular/core';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { Store } from 'app/services/store.service';
import DeliveryType from '@modules/server.common/enums/DeliveryType';

const defaultDeliveryTimeMin = environment.DELIVERY_TIME_MIN;
const defaultDeliveryTimeMax = environment.DELIVERY_TIME_MAX;

@Component({
	selector: 'e-cu-delivery-info',
	styleUrls: ['./delivery-info.scss'],
	template: `
		<div
			class="delivery-info"
			[ngClass]="{
				'over-image brand-light': overImage,
				'show-top': !hasDiscount
			}"
		>
			<div class="delivery-sign">
				<i class="fa {{ getProductDeliverySignIconName() }}"></i>
			</div>

			<div class=" delivery-lines">
				<small>{{ getProductDeliveryLine1() }}</small>
				<small>{{ getProductDeliveryLine2() }}</small>
			</div>
		</div>
	`,
})
export class DeliveryInfoComponent implements OnInit {
	@Input()
	currentProduct: WarehouseProduct;

	@Input()
	overImage: boolean;

	@Input()
	hasDiscount: boolean;

	private deliveryText: string;
	private takeawayText: string;
	private minutesText: string;
	private readyForText: string;

	private isTakeaway: boolean;

	constructor(
		private translateService: TranslateService,
		private store: Store
	) {
		this.isTakeaway = this.store.deliveryType === DeliveryType.Takeaway;
	}

	ngOnInit(): void {
		this.getDeliveryText();
		this.getTakeawayText();
		this.getMinutesText();
		this.getReadyForText();
	}
	async getDeliveryText() {
		this.deliveryText = await this.translateService
			.get('PRODUCTS_VIEW.DELIVERY')
			.pipe(first())
			.toPromise();
	}

	async getTakeawayText() {
		this.takeawayText = await this.translateService
			.get('PRODUCTS_VIEW.TAKEAWAY')
			.pipe(first())
			.toPromise();
	}

	async getMinutesText() {
		this.minutesText = await this.translateService
			.get('PRODUCTS_VIEW.MINUTES')
			.pipe(first())
			.toPromise();
	}

	async getReadyForText() {
		this.readyForText = await this.translateService
			.get('PRODUCTS_VIEW.READYFOR')
			.pipe(first())
			.toPromise();
	}

	getIsInstant(currentProduct: WarehouseProduct): boolean {
		if (currentProduct == null) {
			return false;
		}

		const productInfo = currentProduct;

		if (productInfo.isDeliveryRequired) {
			// For Delivery
			if (
				productInfo.deliveryTimeMax !=
					null /*should always be not null*/ &&
				productInfo.deliveryTimeMax <= 15
			) {
				// If it's instant delivery
				return true;
			} else {
				// not instant
				return false;
			}
		} else {
			// For Takeaway
			if (
				productInfo.deliveryTimeMax == null ||
				productInfo.deliveryTimeMax <= 15
			) {
				// If it's instant takeaway
				return true;
			} else {
				// not instant takeaway
				return false;
			}
		}
	}

	getProductDeliverySignIconName() {
		if (this.currentProduct == null) {
			return '';
		}

		return this.isTakeaway ? 'fa-bolt' : 'fa-motorcycle';
	}

	getProductDeliveryLine1() {
		if (this.currentProduct == null) {
			return '';
		}

		const productInfo = this.currentProduct;

		if (!this.isTakeaway) {
			// For Delivery
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
			// For Takeaway
			if (
				productInfo.deliveryTimeMax == null ||
				productInfo.deliveryTimeMax <= 15
			) {
				// If it's instant takeaway
				return this.readyForText;
			} else {
				// not instant takeaway
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

	getProductDeliveryLine2() {
		if (this.currentProduct == null) {
			return '';
		}

		if (!this.isTakeaway) {
			return this.deliveryText;
		} else {
			return this.takeawayText;
		}
	}
}
