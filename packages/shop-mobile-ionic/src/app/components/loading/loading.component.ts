import { Component } from '@angular/core';

@Component({
	selector: 'e-cu-loading',
	styleUrls: ['./loading.component.scss'],
	templateUrl: 'loading.component.html',
})
export class LoadingComponent {
	text: string;

	constructor() {
		this.text = 'Hello World';
	}
}
