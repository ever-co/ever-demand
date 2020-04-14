import { Component } from '@angular/core';

@Component({
	selector: 'loading',
	templateUrl: 'loading.html',
})
export class LoadingComponent {
	text: string;

	constructor() {
		console.log('Hello LoadingComponent Component');
		this.text = 'Hello World';
	}
}
