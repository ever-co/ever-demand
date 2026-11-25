import {
	Component,
	OnInit,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
} from '@angular/core';
import DeliveryType from '@modules/server.common/enums/DeliveryType';

@Component({
	standalone: false,
	selector: 'order-type',
	templateUrl: './order-type.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['./order-type.component.scss'],
})
export class OrderTypeComponent implements OnInit {
	@Output()
	orderTypeEmitter = new EventEmitter<DeliveryType>();

	ngOnInit() {}

	chooseOption(type: DeliveryType) {
		this.orderTypeEmitter.emit(type);
	}
}
