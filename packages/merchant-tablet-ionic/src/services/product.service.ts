import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map, share } from 'rxjs/operators';
import Product from '@modules/server.common/entities/Product';

@Injectable()
export class ProductService {
	constructor(private readonly apollo: Apollo) {}

	save(product: Product) {
		return this.apollo
			.mutate<{ product: Product }>({
				mutation: gql`
					mutation SaveProduct($product: ProductSaveInput!) {
						saveProduct(product: $product) {
							id
						}
					}
				`,
				variables: {
					product,
				},
			})
			.pipe(
				map((result) => result.data.product),
				share()
			);
	}
}
