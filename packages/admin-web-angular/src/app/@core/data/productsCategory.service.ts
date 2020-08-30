import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import gql from 'graphql-tag';
import { IProductsCategoryCreateObject } from '@modules/server.common/interfaces/IProductsCategory';
import ProductsCategory from '@modules/server.common/entities/ProductsCategory';
import { getDummyImage } from '@modules/server.common/utils';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Injectable()
export class ProductsCategoryService {
	constructor(
		private readonly apollo: Apollo,
		private readonly productLocalesService: ProductLocalesService
	) {}

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
				pollInterval: 1000,
			})
			.valueChanges.pipe(
				map((res) => res.data.productsCategories),
				share()
			);
	}

	create(
		productsCategory: IProductsCategoryCreateObject
	): Observable<ProductsCategory> {
		this.getDefaultImage(productsCategory);
		return this.apollo
			.mutate<{ productsCategory: IProductsCategoryCreateObject }>({
				mutation: gql`
					mutation SaveProductsCategory(
						$productsCategory: ProductsCategoriesCreateInput!
					) {
						createProductsCategory(createInput: $productsCategory) {
							id
							image
							name {
								locale
								value
							}
						}
					}
				`,
				variables: {
					productsCategory,
				},
			})
			.pipe(
				map((result: any) => result.data.createProductsCategory),
				share()
			);
	}

	update(
		id: string,
		productsCategory: IProductsCategoryCreateObject
	): Observable<ProductsCategory> {
		this.getDefaultImage(productsCategory);
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
							id
							image
							name {
								locale
								value
							}
						}
					}
				`,
				variables: {
					id,
					productsCategory,
				},
			})
			.pipe(
				map((result: any) => result.data.updateProductsCategory),
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
			variables: { ids },
		});
	}

	private getDefaultImage(data: IProductsCategoryCreateObject) {
		if (!data.image) {
			data.image = getDummyImage(
				300,
				300,
				this.productLocalesService
					.getTranslate(data.name)
					.charAt(0)
					.toUpperCase()
			);
		}
	}
}
