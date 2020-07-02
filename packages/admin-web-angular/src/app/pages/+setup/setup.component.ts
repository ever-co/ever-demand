import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { Store } from '@app/@core/data/store.service';

@Component({
	styleUrls: ['./setup.component.scss'],
	templateUrl: './setup.component.html',
})
export class SetupComponent implements OnInit {
	public loading: boolean;
	public fakeDataGenerator: boolean;

	constructor(
		private readonly _router: Router,
		private readonly _store: Store
	) {}
	ngOnInit(): void {
		this.fakeDataGenerator = !!+this._store.fakeDataGenerator;
	}

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
