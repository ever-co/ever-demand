import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
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
				map((res) => res.data.productsCategories),
				share()
			);
	}
}
