import { Component, OnDestroy } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

import { first } from 'rxjs/operators';
import { Store } from 'app/services/store.service';
import { Router } from '@angular/router';
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

			if (Number(this.store.serverConnection) !== 0) {
				clearInterval(this.interval);
				this.router.navigateByUrl('');
			}
		}, 5000);
	}

	ngOnDestroy(): void {
		clearInterval(this.interval);
	}
}
