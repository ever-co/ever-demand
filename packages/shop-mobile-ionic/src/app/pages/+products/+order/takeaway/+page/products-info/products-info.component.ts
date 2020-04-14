import {
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	OnDestroy,
} from '@angular/core';
import { Subject } from 'rxjs';
import Order from '@modules/server.common/entities/Order';
import { getIdFromTheDate } from '@modules/server.common/utils';
import { environment } from 'environments/environment';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Component({
	selector: 'e-cu-order-produts-info',
	templateUrl: './products-info.component.html',
	styleUrls: ['./products-info.component.scss'],
})
export class OrderProductsInfo implements OnInit, OnDestroy {
	@Input()
	order: Order;

	@Input()
	paymentsEnabled: boolean;

	@Output()
	undo = new EventEmitter<boolean>();

	@Output()
	complete = new EventEmitter<boolean>();
	listView = environment.PRODUCTS_VIEW_TYPE === 'list';

	private readonly ngDestroy$ = new Subject<void>();

	constructor(private _translateProductLocales: ProductLocalesService) {}

	ngOnInit(): void {
		console.warn('OrderProductsInfo Initialize.');
	}

	localeTranslate(member: ILocaleMember[]): string {
		return this._translateProductLocales.getTranslate(member);
	}

	ngOnDestroy() {
		console.warn('OrderProductsInfo did leave');

		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
