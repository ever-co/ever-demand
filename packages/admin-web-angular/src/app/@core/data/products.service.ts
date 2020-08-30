import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import Product from '@modules/server.common/entities/Product';
import { IProductCreateObject } from '@modules/server.common/interfaces/IProduct';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import gql from 'graphql-tag';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';

interface RemovedObject {
	n: number;
	ok: number;
}

@Injectable()
export class ProductsService {
	constructor(private readonly apollo: Apollo) {}

	getProducts(
		pagingOptions?: IPagingOptions,
		existedProductsIds: string[] = []
	): Observable<Product[]> {
		return this.apollo
			.watchQuery<{ products: Product[] }>({
				query: gql`
					query AllProducts(
						$pagingOptions: PagingOptionsInput
						$existedProductsIds: [String]
					) {
						products(
							pagingOptions: $pagingOptions
							existedProductsIds: $existedProductsIds
						) {
							id
							title {
								locale
								value
							}
							description {
								locale
								value
							}
							details {
								locale
								value
							}
							images {
								locale
								url
								width
								height
								orientation
							}
							categories
						}
					}
				`,
				variables: { pagingOptions, existedProductsIds },
				pollInterval: 2000,
			})
			.valueChanges.pipe(
				map((res) => res.data.products),
				share()
			);
	}

	create(product: IProductCreateObject): Observable<Product> {
		return this.apollo
			.mutate<{ product: IProductCreateObject }>({
				mutation: gql`
					mutation SaveProduct($product: ProductCreateInput!) {
						createProduct(product: $product) {
							id
							title {
								locale
								value
							}
							description {
								locale
								value
							}
							details {
								locale
								value
							}
							images {
								locale
								url
								width
								height
								orientation
							}
						}
					}
				`,
				variables: {
					product,
				},
			})
			.pipe(
				map((result: any) => result.data.createProduct),
				share()
			);
	}

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
				map((result: any) => result.data.saveProduct),
				share()
			);
	}

	removeByIds(ids: string[]): Observable<RemovedObject> {
		return this.apollo
			.mutate({
				mutation: gql`
					mutation RemoveProductsByIds($ids: [String!]!) {
						removeProductsByIds(ids: $ids) {
							n
						}
					}
				`,
				variables: { ids },
			})
			.pipe(
				map((result: any) => result.data.removeProductsByIds),
				share()
			);
	}

	getProductById(id: string) {
		return this.apollo
			.query({
				query: gql`
					query GetProductById($id: String!) {
						product(id: $id) {
							id
							title {
								locale
								value
							}
							description {
								locale
								value
							}
							details {
								locale
								value
							}
							images {
								locale
								url
								width
								height
								orientation
							}
							categories
						}
					}
				`,
				variables: { id },
			})
			.pipe(
				map((res) => res.data['product']),
				share()
			);
	}

	async getCountOfProducts(existedProductsIds: string[] = []) {
		const res = await this.apollo
			.query({
				query: gql`
					query GetCountOfProducts($existedProductsIds: [String]) {
						getCountOfProducts(
							existedProductsIds: $existedProductsIds
						)
					}
				`,
				variables: { existedProductsIds },
			})
			.toPromise();

		return res.data['getCountOfProducts'];
	}
}
