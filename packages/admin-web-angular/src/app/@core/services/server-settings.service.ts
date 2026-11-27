import { Injectable } from '@angular/core';
import { Store } from '../data/store.service';
import { Apollo, gql } from 'apollo-angular';
import { IAdminAppSettings } from '@modules/server.common/interfaces/IAppsSettings';
import { take, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class ServerSettingsService {
	constructor(
		private readonly _apollo: Apollo,
		private readonly store: Store
	) {}

	/**
	 * Loads the settings into the Store. They are for logged-in admins only, so
	 * before a login the API refuses them: the app starts anyway, and the
	 * session loads them again after the login (AdminSessionService.start).
	 */
	async load() {
		try {
			const res = await this.getAdminAppSettings();

			if (res) {
				this.store.adminPasswordReset = res.adminPasswordReset;
				this.store.fakeDataGenerator = res.fakeDataGenerator;
			}
		} catch {
			// not logged in, or the API is down (ServerConnectionService shows that)
		}

		return true;
	}

	getAdminAppSettings() {
		return this._apollo
			.query<{ settings: IAdminAppSettings }>({
				query: gql`
					query adminAppSettings {
						adminAppSettings {
							adminPasswordReset
							fakeDataGenerator
						}
					}
				`,
			})
			.pipe(
				take(1),
				map((res) => res.data?.['adminAppSettings']),
			)
			.toPromise();
	}
}
