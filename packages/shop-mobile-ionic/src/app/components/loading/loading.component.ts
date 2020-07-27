import { Component, Input } from '@angular/core';

@Component({
	selector: 'e-cu-loading',
	styleUrls: ['./loading.component.scss'],
	templateUrl: 'loading.component.html',
})
export class LoadingComponent {
	@Input() color: string;
	text: string;

	constructor() {
		this.text = 'Hello World';
	}
}
