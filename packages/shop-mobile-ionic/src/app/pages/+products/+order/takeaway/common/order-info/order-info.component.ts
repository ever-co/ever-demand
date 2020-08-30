import { OnDestroy, Component, Input, OnInit } from '@angular/core';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { Subject } from 'rxjs';
import { getIdFromTheDate } from '@modules/server.common/utils';
import Order from '@modules/server.common/entities/Order';
import QRCode from 'qrcode';
import OrderBarcodeTypes, {
	orderBarcodeTypesToString,
} from '@modules/server.common/enums/OrderBarcodeTypes';

@Component({
	selector: 'e-cu-order-takeaway-info-order-info',
	templateUrl: './order-info.component.html',
	styleUrls: ['./order-info.component.scss'],
})
export class TakeawayOrderInfoComponent implements OnInit, OnDestroy {
	@Input()
	order: Order;

	@Input()
	lessInfo: boolean;

	barcodetDataUrl: string;
	bcFormat: OrderBarcodeTypes;
	bcWidth: number = 0.7;

	private readonly ngDestroy$ = new Subject<void>();

	constructor(private _translateProductLocales: ProductLocalesService) {}

	get orderId() {
		if (this.order) {
			return getIdFromTheDate(this.order);
		}
		return null;
	}
	ngOnInit(): void {
		this.loadQRCode();
	}

	orderBarcodeTypesToString(type) {
		return orderBarcodeTypesToString(type);
	}

	localeTranslate(member: ILocaleMember[]): string {
		return this._translateProductLocales.getTranslate(member);
	}
	ngOnDestroy(): void {
		console.warn('TakeawayOrderInfoComponent did leave');

		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}

	private async loadQRCode() {
		const generateQRCode = async () => {
			this.barcodetDataUrl = await QRCode.toDataURL(this.order.id);
		};
		if (this.order) {
			if (
				this.order.warehouse &&
				this.order.warehouse['orderBarcodeType']
			) {
				const orderBarcodeType = this.order.warehouse[
					'orderBarcodeType'
				];
				if (orderBarcodeType === OrderBarcodeTypes.QR) {
					await generateQRCode();
				} else {
					if (orderBarcodeType === OrderBarcodeTypes.CODE39) {
						this.bcWidth = 0.5;
					}
					this.bcFormat = orderBarcodeType;
				}
			} else {
				// If orderBarcodeType setting don't exist in merchant, use QR by default
				await generateQRCode();
			}
		}
	}
}
