import { Component, Input } from '@angular/core';

@Component({
	selector: 'e-cu-store-sign',
	templateUrl: './store-sign.component.html',
	styleUrls: ['./store-sign.component.scss'],
})
export class StoreSignComponent {
	@Input()
	inStore: boolean;
}
