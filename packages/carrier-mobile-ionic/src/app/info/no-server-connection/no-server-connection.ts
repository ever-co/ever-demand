import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Store } from '../../../services/store.service';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';
import { Router } from '@angular/router';

@Component({
	selector: 'no-server-connection',
	styleUrls: [`../information.scss`],
	templateUrl: 'no-server-connection.html',
})
export class NoServerConnectionComponent {
	noInternetLogo: string;
	interval;

	constructor(
		private store: Store,
		private router: Router,
		private serverConnectionService: ServerConnectionService
	) {
		this.noInternetLogo = environment.NO_INTERNET_LOGO;
		this.testConnection();
	}

	private async testConnection() {
		this.interval = setInterval(async () => {
			await this.serverConnectionService.checkServerConnection(
				environment.SERVICES_ENDPOINT,
				this.store
			);

			if (!this.store.showInformationPage) {
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
