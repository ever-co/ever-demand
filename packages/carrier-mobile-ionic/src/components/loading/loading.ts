import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	standalone: false,
	selector: 'loading',
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: 'loading.html',
})
export class LoadingComponent {
	text: string;

	constructor() {
		console.log('Hello LoadingComponent Component');
		this.text = 'Hello World';
	}
}
