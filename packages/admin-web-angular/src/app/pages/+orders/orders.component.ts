import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	standalone: false,
	selector: 'ea-orders',
	templateUrl: './orders.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent {}
