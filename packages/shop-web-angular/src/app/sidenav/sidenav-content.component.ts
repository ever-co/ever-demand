import { Component } from '@angular/core';

@Component({
	selector: 'sidenav-content',
	styles: [``],
	template: `
		<mat-list>
			<mat-list-item>
				<mat-icon mat-list-icon>shopping_basket</mat-icon>
				<h4 mat-line>Products</h4>
			</mat-list-item>
			<mat-list-item>
				<mat-icon mat-list-icon>history</mat-icon>
				<h4 mat-line>Orders</h4>
			</mat-list-item>
			<mat-divider></mat-divider>
			<div style="position: absolute; bottom: 0; width: 100%">
				<mat-list-item>
					<mat-icon mat-list-icon>settings</mat-icon>
					<h4 mat-line>Options</h4>
				</mat-list-item>
			</div>
		</mat-list>
	`,
})
export class SidenavContentComponent {}
