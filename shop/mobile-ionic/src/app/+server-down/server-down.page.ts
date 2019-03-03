import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

import { first } from 'rxjs/operators';
import { Store } from 'app/services/store.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
	styleUrls: ['./server-down.page.scss'],
	templateUrl: 'server-down.page.html'
})
export class ServerDownPage {
	noInternetLogo: string;
	interval;

	constructor(
		private store: Store,
		private readonly http: HttpClient,
		private location: Location
	) {
		this.noInternetLogo = environment.NO_INTERNET_LOGO;
		this.testConnection();
	}

	private async testConnection() {
		this.interval = setInterval(async () => {
			await this.checkServerConnection();

			if (Number(this.store.serverConnection) !== 0) {
				clearInterval(this.interval);
				this.location.back();
			}
		}, 5000);
	}

	private async checkServerConnection() {
		try {
			await this.http
				.get(environment.SERVICES_ENDPOINT)
				.pipe(first())
				.toPromise();
		} catch (error) {
			this.store.serverConnection = error.status;
		}
	}

	ionViewWillLeave() {
		clearInterval(this.interval);
	}

	ionViewCanEnter() {
		return this.store.maintenanceMode !== null;
	}
}
