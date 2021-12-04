import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';

@Injectable()
export class DataService {
	constructor(private readonly _apollo: Apollo) {}

	async clearAll(): Promise<any> {
		return this._apollo
			.query({
				query: gql`
					query ClearAll {
						clearAll
					}
				`,
			})
			.pipe(map((res) => res.data['clearAll']))
			.toPromise();
	}
}
