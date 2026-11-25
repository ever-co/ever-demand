import { NbMenuService } from '@nebular/theme';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	standalone: false,
	selector: 'ngx-not-found',
	styleUrls: ['./not-found.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
	constructor(private menuService: NbMenuService) {}

	goToHome() {
		this.menuService.navigateHome();
	}
}
