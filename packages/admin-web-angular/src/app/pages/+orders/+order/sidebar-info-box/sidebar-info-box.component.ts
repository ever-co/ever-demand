import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'ea-order-sidebar-info-box',
	templateUrl: './sidebar-info-box.component.html',
	styleUrls: ['./sidebar-info-box.component.scss'],
})
export class SidebarInfoBoxComponent {
	@Input()
	public title: string;
	@Input()
	public imageUrl: string;
	@Input()
	public contactDetails: string[];
	@Input()
	public redirectUrl: string;
	constructor(private readonly router: Router) {}

	redirect() {
		if (this.redirectUrl) {
			this.router.navigate([this.redirectUrl]);
		}
	}
}
