import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	styleUrls: ['./setup.component.scss'],
	templateUrl: './setup.component.html',
})
export class SetupComponent {
	public loading: boolean;

	constructor(private readonly _router: Router) {}

	navigateToFakeDataPage() {
		this.loading = true;
		this._router.navigate(['/generate-initial-data']);
		this.loading = false;
	}

	navigateToSetupMerchantsPage() {
		this.loading = true;
		this._router.navigate(['/setup/merchants']);
		this.loading = false;
	}
}
