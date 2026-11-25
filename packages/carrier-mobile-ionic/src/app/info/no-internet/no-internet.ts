import { Component, ChangeDetectionStrategy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NetworkStatusService } from '../../../services/native/network-status.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store } from '../../../services/store.service';

@Component({
	standalone: false,
	selector: 'no-internet',
	styleUrls: [`../information.scss`],
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<div class="info-page" scroll="false">
			<div class="view-content">
				<div class="logo app-hide-on-keyboard-open">
					<img src="{{ noInternetLogo }}" />
				</div>

				<div class="info-massage">
					<h3>
						{{
							'NO_INTERNET_VIEW.NETWORK_WAS_DISCONNECTED'
								| translate
						}}
					</h3>
				</div>
			</div>
		</div>
	`,
})
export class NoInternetPage {
	public noInternetLogo: string;

	constructor(
		private network: NetworkStatusService,
		private router: Router,
		private store: Store,
	) {
		this.noInternetLogo = environment.NO_INTERNET_LOGO;

		this.networkWatch();
	}

	async networkWatch() {
		await this.network.onConnect().pipe(first()).toPromise();
		this.store.clearNoInternet();
		this.router.navigateByUrl('');
	}
}
