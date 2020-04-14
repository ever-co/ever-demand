import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';
import { Store } from 'app/services/store';
import { environment } from 'environments/environment';

@Component({
	styleUrls: ['./server-down.page.scss'],
	templateUrl: 'server-down.page.html',
})
export class ServerDownPage implements OnDestroy {
	noInternetLogo: string;
	interval;

	constructor(
		private store: Store,
		private readonly http: HttpClient,
		private location: Location,
		private translate: TranslateService,
		private serverConnectionService: ServerConnectionService
	) {
		const browserLang = translate.getBrowserLang();

		translate.use(
			browserLang.match(/en-US|bg-BG|he-IL|ru-RU|es-ES/)
				? browserLang
				: 'en-US'
		);

		this.noInternetLogo = environment['NO_INTERNET_LOGO'];
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
