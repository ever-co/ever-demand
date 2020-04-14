import { Component, OnInit, EventEmitter, Output } from '@angular/core';

type SegmentSection = 'options' | 'select/add' | 'order';

@Component({
	selector: 'order',
	styleUrls: ['./order.component.scss'],
	templateUrl: './order.component.html',
})
export class OrderComponent implements OnInit {
	readonly availSegmentOptions = {
		options: 'options' as SegmentSection,
		selectAdd: 'select/add' as SegmentSection,
		order: 'order' as SegmentSection,
	};

	@Output()
	orderFinishedEmitter = new EventEmitter<void>();

	segmentSection: SegmentSection = this.availSegmentOptions.options;
	selectAddCustomerOption: number;
	customerIdToOrder: string;

	ngOnInit() {}

	onOptionSelected(optionBit: number) {
		this.segmentSection = this.availSegmentOptions.selectAdd;
		this.selectAddCustomerOption = optionBit;
	}

	onCustomerSelected(customerId: string) {
		this.segmentSection = this.availSegmentOptions.order;
		this.customerIdToOrder = customerId;
	}
}
