import { Component } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
	selector: 'e-cu-submenu',
	templateUrl: './submenu.component.html',
})
export class SubMenuComponent {
	companyName: string;

	constructor() {
		this.companyName = environment.APP_NAME;
	}
}
