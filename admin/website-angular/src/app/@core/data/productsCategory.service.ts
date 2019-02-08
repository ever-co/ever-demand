import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import gql from 'graphql-tag';
import { IProductsCategoryCreateObject } from '@modules/server.common/interfaces/IProductsCategory';
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
							image
							name {
								locale
								value
							}
						}
					}
				`,
				pollInterval: 1000
			})
			.valueChanges.pipe(
				map((res) => res.data.productsCategories),
				share()
			);
	}

	create(
		productsCategory: IProductsCategoryCreateObject
	): Observable<ProductsCategory> {
		return this.apollo
			.mutate<{ productsCategory: IProductsCategoryCreateObject }>({
				mutation: gql`
					mutation SaveProductsCategory(
						$productsCategory: ProductsCategoriesCreateInput!
					) {
						createProductsCategory(createInput: $productsCategory) {
							id
							name {
								locale
								value
							}
						}
					}
				`,
				variables: {
					productsCategory
				}
			})
			.pipe(
				map((result) => result.data.createProductsCategory),
				share()
			);
	}

	update(
		id: string,
		productsCategory: IProductsCategoryCreateObject
	): Observable<ProductsCategory> {
		return this.apollo
			.mutate<{
				id: string;
				productsCategory: IProductsCategoryCreateObject;
			}>({
				mutation: gql`
					mutation UpdateProductsCategory(
						$id: String!
						$productsCategory: ProductsCategoriesCreateInput!
					) {
						updateProductsCategory(
							id: $id
							updateInput: $productsCategory
						) {
							name {
								locale
								value
							}
						}
					}
				`,
				variables: {
					id,
					productsCategory
				}
			})
			.pipe(
				map((result) => result.data.updateProductsCategory),
				share()
			);
	}

	removeByIds(ids: string[]) {
		return this.apollo.mutate({
			mutation: gql`
				mutation removeProductsCategoriesByIds($ids: [String!]!) {
					removeProductsCategoriesByIds(ids: $ids) {
						ok
						n
					}
				}
			`,
			variables: { ids }
		});
	}
}
