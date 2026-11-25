import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
} from '@angular/core';

@Component({
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
	selector: 'e-cu-order-popup',
	template: ``,
})
export class OrderPopupComponent implements OnInit {
	constructor() {}

	async ngOnInit() {}
}
