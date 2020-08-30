import { Component, OnDestroy } from '@angular/core';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';
import { Store } from '@app/@core/data/store.service';

@Component({
	templateUrl: './maintenance-info.component.html',
})
export class MaintenanceInfoComponent {
	public message: string;
	private maintenanceMode: string;

	constructor(
		private maintenanceService: MaintenanceService,
		private router: Router,
		private store: Store
	) {
		this.maintenanceMode = this.store.maintenanceMode;
		this.getMessage();
		this.getStatus();
	}

	async getMessage() {
		this.message = await this.maintenanceService.getMessage(
			this.maintenanceMode,
			environment['SETTINGS_MAINTENANCE_API_URL']
		);
	}

	private async getStatus() {
		const interval = setInterval(async () => {
			const status = await this.maintenanceService.getStatus(
				environment['SETTINGS_APP_TYPE'],
				environment['SETTINGS_MAINTENANCE_API_URL']
			);
			console.warn(`Maintenance on '${this.maintenanceMode}': ${status}`);

			if (!status) {
				clearInterval(interval);
				this.store.clearMaintenanceMode();
				this.router.navigate(['']);
			}
		}, 5000);
	}
}
