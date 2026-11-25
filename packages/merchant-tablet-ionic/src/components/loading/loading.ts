import { Component } from '@angular/core';

@Component({
	standalone: false,
	selector: 'loading',
	templateUrl: 'loading.html',
})
export class LoadingComponent {
	text: string;

	constructor() {}
}
