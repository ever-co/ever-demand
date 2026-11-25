import {
	Component,
	Input,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
} from '@angular/core';

@Component({
	standalone: false,
	selector: 'no-orders-info',
	templateUrl: 'no-orders-info.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['./no-orders-info.component.scss'],
})
export class NoOrdersInfoComponent {
	@Input()
	filterMode: string;

	@Output()
	toggleOrderContainer: EventEmitter<boolean> = new EventEmitter();
}
