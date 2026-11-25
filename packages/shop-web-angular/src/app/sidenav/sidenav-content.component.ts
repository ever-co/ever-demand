import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
	selector: 'sidenav-content',
	styles: [``],
	template: `
		<mat-list>
			<mat-list-item>
				<mat-icon matListItemIcon>shopping_basket</mat-icon>
				<h4 matListItemTitle>Products</h4>
			</mat-list-item>
			<mat-list-item>
				<mat-icon matListItemIcon>history</mat-icon>
				<h4 matListItemTitle>Orders</h4>
			</mat-list-item>
			<mat-divider></mat-divider>
			<div style="position: absolute; bottom: 0; width: 100%">
				<mat-list-item>
					<mat-icon matListItemIcon>settings</mat-icon>
					<h4 matListItemTitle>Options</h4>
				</mat-list-item>
			</div>
		</mat-list>
	`,
})
export class SidenavContentComponent {}
