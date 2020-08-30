import {
	Component,
	Input,
	OnInit,
	OnDestroy,
	ElementRef,
	ViewChild,
} from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { timer, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getDifferenceFromTimes } from '../../../../@core/utils/getDifferenceFromTimes ';
import OrderStatus from '@modules/server.common/enums/OrderStatus';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';

@Component({
	template: ` <span #elapsedTime></span> `,
})
export class ElapsedComponent implements ViewCell, OnInit, OnDestroy {
	@ViewChild('elapsedTime', { static: true })
	elapsedTime: ElementRef;

	private ngDestroy$ = new Subject<void>();

	@Input()
	value: string | number;

	@Input()
	rowData: any;

	get notProcessing() {
		return (
			this.rowData &&
			this.rowData.order &&
			(this.rowData.order.status >= OrderStatus.Delivered ||
				this.rowData.carrierStatus >=
					OrderCarrierStatus.DeliveryCompleted ||
				this.rowData.warehouseStatus ===
					OrderWarehouseStatus.GivenToCustomer)
		);
	}

	ngOnInit() {
		if (!this.notProcessing) {
			this.updateTimer();
		} else {
			if (
				this.rowData &&
				this.rowData.order &&
				(this.rowData.order.deliveryTime ||
					this.rowData.order.finishedProcessingTime)
			) {
				const start = new Date(
					this.rowData.order.deliveryTime ||
						this.rowData.order.finishedProcessingTime
				);
				const end = new Date(this.rowData.createdAt);

				this.showTime(start, end);
			}
		}
	}

	updateTimer() {
		timer(1, 1000)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(() => {
				const start = new Date();
				const end = new Date(this.rowData.createdAt);
				this.showTime(start, end);
			});
	}

	private showTime(start, end) {
		const time = getDifferenceFromTimes(start, end);
		this.elapsedTime.nativeElement.innerText = time;
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
