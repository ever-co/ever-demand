import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';

@Component({
	standalone: false,
	selector: 'order-warehouse-preparation-problem',
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: 'order-warehouse-preparation-problem.html',
})
export class OrderWarehousePreparationProblemComponent {
	@Input()
	getWarehouseStatus: (status: any) => void;

	@Input()
	order: Order;

	constructor(private _translateProductLocales: ProductLocalesService) {}

	protected localeTranslate(member: ILocaleMember[]): string {
		return this._translateProductLocales.getTranslate(member);
	}
}
