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

	async load() {
		return new Promise(async (resolve, reject) => {
			const res = await this.getAdminAppSettings();

			if (res) {
				this.store.adminPasswordReset = res.adminPasswordReset;
				this.store.fakeDataGenerator = res.fakeDataGenerator;
			}

			resolve(true);
		});
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
				map((res) => res.data['adminAppSettings'])
			)
			.toPromise();
	}
}
