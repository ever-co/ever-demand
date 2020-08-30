import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { Store } from '../../../services/store.service';
import { Router } from '@angular/router';

@Component({
	selector: 'page-maintenance-info',
	templateUrl: 'maintenance-info.html',
})
export class MaintenanceInfoPage {
	public message: string;
	public interval;
	constructor(
		private maintenanceService: MaintenanceService,
		private store: Store,
		private router: Router
	) {
		this.getMessage();
		this.getStatus();
	}

	async getMessage() {
		this.message = await this.maintenanceService.getMessage(
			this.store.maintenanceMode,
			environment['SETTINGS_MAINTENANCE_API_URL']
		);
	}

	private async getStatus() {
		this.interval = setInterval(async () => {
			const status = await this.maintenanceService.getStatus(
				environment['SETTINGS_APP_TYPE'],
				environment['SETTINGS_MAINTENANCE_API_URL']
			);
			console.warn(
				`Maintenance on '${this.store.maintenanceMode}': ${status}`
			);

			if (!status) {
				clearInterval(this.interval);
				this.store.clearMaintenanceMode();
				this.router.navigateByUrl('');
			}
		}, 5000);
	}

	ionViewWillLeave() {
		clearInterval(this.interval);
	}
}
