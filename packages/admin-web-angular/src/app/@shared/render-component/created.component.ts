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
import { getDifferenceFromTimes } from '../../@core/utils/getDifferenceFromTimes ';
import OrderStatus from '@modules/server.common/enums/OrderStatus';

@Component({
	template: `
		<span class="d-block mb-2"
			><strong>Created:</strong>
			{{
				rowData?.createdAt | amLocal | amDateFormat: 'DD.MM.YYYY HH:mm'
			}}
		</span>
		<strong *ngIf="this.rowData.startDeliveryTime">Elapsed: </strong>
		<span #createdTimer></span>
	`,
})
export class CreatedComponent implements ViewCell, OnInit, OnDestroy {
	@ViewChild('createdTimer', { static: true })
	createdTimer: ElementRef;

	private ngDestroy$ = new Subject<void>();

	@Input()
	value: string | number;
	@Input()
	rowData: any;

	createdAt: string;

	get notProcessing() {
		return this.rowData && this.rowData.status >= OrderStatus.Delivered;
	}

	ngOnInit() {
		this.createdAt = new Date(
			<any>this.rowData.createdAt
		).toLocaleDateString();
		if (!this.notProcessing) {
			if (this.rowData.startDeliveryTime) {
				this.updateTimer();
			}
		} else {
			if (
				this.rowData &&
				this.rowData.startDeliveryTime &&
				(this.rowData.deliveryTime ||
					this.rowData.finishedProcessingTime)
			) {
				const start = new Date(
					this.rowData.deliveryTime ||
						this.rowData.finishedProcessingTime
				);
				const end = new Date(this.rowData.startDeliveryTime);

				this.showTime(start, end);
			}
		}
	}

	updateTimer() {
		timer(1, 1000)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(() => {
				const start = new Date();
				const end = new Date(this.rowData.startDeliveryTime);

				this.showTime(start, end);
			});
	}
	private showTime(start, end) {
		const time = getDifferenceFromTimes(start, end);

		this.createdTimer.nativeElement.innerText = time;
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
