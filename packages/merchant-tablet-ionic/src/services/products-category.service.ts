import { Injectable } from '@angular/core';
import { Apollo, gql, onlyCompleteData } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import ProductsCategory from '@modules/server.common/entities/ProductsCategory';

@Injectable()
export class ProductsCategoryService {
	constructor(private readonly apollo: Apollo) {}

	getCategories(): Observable<ProductsCategory[]> {
		return this.apollo
			.watchQuery<{ productsCategories: ProductsCategory[] }>({
				query: gql`
					query allCategories {
						productsCategories {
							id
							name {
								locale
								value
							}
						}
					}
				`,
				pollInterval: 1000,
			})
			.valueChanges.pipe(
				// Apollo Client 4 also emits loading/partial results
				onlyCompleteData(),
				map((res) => res.data.productsCategories),
				share()
			);
	}
}
