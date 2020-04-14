import { Component, OnDestroy } from '@angular/core';
import { environment } from '../../environments/environment';
import { Store } from '../../services/store.service';
import { Location } from '@angular/common';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';

@Component({
	styleUrls: ['./server-down.page.scss'],
	templateUrl: 'server-down.page.html',
})
export class ServerDownPage implements OnDestroy {
	noInternetLogo: string;
	interval;

	constructor(
		private store: Store,
		private location: Location,
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

			if (Number(this.store.serverConnection) !== 0) {
				clearInterval(this.interval);
				this.location.back();
			}
		}, 5000);
	}

	ngOnDestroy(): void {
		clearInterval(this.interval);
	}
}
