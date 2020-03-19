import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
	selector: 'e-cu-help',
	templateUrl: './help.page.html',
	styleUrls: ['./help.page.scss']
})
export class HelpPage {
	constructor(
		private location: Location,
	) {}
	goBack() {
		this.location.back();
	}
}
