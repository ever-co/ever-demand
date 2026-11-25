/** GraphQL services of the Ionic app (`services/*`), as functions over an Apollo client. */
import type { ApolloClient } from '@apollo/client';
import { Observable, filter, map } from 'rxjs';
import type { Location, Merchant, Order, ProductInfo, WarehouseProduct } from '../domain/types';
import {
	GENERATE_ORDERS_BY_CUSTOMER_ID,
	GEO_LOCATION_PRODUCTS_BY_PAGING,
	GET_CLOSE_MERCHANTS,
	GET_COUNT_OF_GEO_LOCATION_PRODUCTS,
	GET_MERCHANTS_BY_NAME,
	GET_ORDER_STATUS,
	GET_ORDER_TOTAL_PRICE,
	GET_ORDER_WAIT_FOR_COMPLETION,
	GET_WAREHOUSE_PRODUCT,
} from './documents';

export interface GeoLocationFind {
	loc: Location;
}

export interface GeoLocationProductsOptions {
	isDeliveryRequired?: boolean;
	isTakeaway?: boolean;
	merchantIds?: string[];
	imageOrientation?: number;
	locale?: string;
	withoutCount?: boolean;
}

export interface PagingOptions {
	skip: number;
	limit: number;
}

/** How often the product feed polls (the Ionic `pollInterval`). */
export const PRODUCTS_POLL_INTERVAL = 2000;

/** Keeps the rows the Ionic feed keeps: non-null and `isProductAvailable === true`. */
export function availableProducts(rows: Array<ProductInfo | null> | null | undefined): ProductInfo[] {
	return (rows || [])
		.filter((row): row is ProductInfo => !!row)
		.filter((row) => row.warehouseProduct?.isProductAvailable === true);
}

/** `client.query` returning only `data` (errorPolicy `all`: rows that resolved still come back). */
async function queryData<T>(client: ApolloClient, options: ApolloClient.QueryOptions): Promise<T | undefined> {
	const result = await client.query(options);
	return result.data as T | undefined;
}

export function createGraphQLApi(client: ApolloClient) {
	return {
		/** Product feed rows, polled every 2 s (watchQuery). */
		watchGeoLocationProducts(
			geoLocation: GeoLocationFind,
			pagingOptions: PagingOptions,
			options?: GeoLocationProductsOptions,
			searchText?: string,
			pollInterval = PRODUCTS_POLL_INTERVAL,
		): Observable<ProductInfo[]> {
			const query = client.watchQuery<{ geoLocationProductsByPaging: Array<ProductInfo | null> }>({
				query: GEO_LOCATION_PRODUCTS_BY_PAGING,
				variables: { geoLocation, options, pagingOptions, searchText },
				pollInterval,
			});
			return query.pipe(
				// Apollo 4 first emits a loading result without data; the feed only wants answers.
				filter((result) => !result.loading),
				map((result) =>
					availableProducts(
						(result.data as { geoLocationProductsByPaging?: Array<ProductInfo | null> } | undefined)
							?.geoLocationProductsByPaging,
					),
				),
			);
		},

		async geoLocationProducts(
			geoLocation: GeoLocationFind,
			pagingOptions: PagingOptions,
			options?: GeoLocationProductsOptions,
			searchText?: string,
		): Promise<ProductInfo[]> {
			const data = await queryData<{ geoLocationProductsByPaging: Array<ProductInfo | null> }>(client, {
				query: GEO_LOCATION_PRODUCTS_BY_PAGING,
				variables: { geoLocation, options, pagingOptions, searchText },
			});
			return availableProducts(data?.geoLocationProductsByPaging);
		},

		async countGeoLocationProducts(
			geoLocation: GeoLocationFind,
			options?: GeoLocationProductsOptions,
			searchText?: string,
		): Promise<number> {
			const data = await queryData<{ getCountOfGeoLocationProducts: number }>(client, {
				query: GET_COUNT_OF_GEO_LOCATION_PRODUCTS,
				variables: { geoLocation, options, searchText },
			});
			return data?.getCountOfGeoLocationProducts ?? 0;
		},

		async getWarehouseProduct(
			warehouseId: string,
			warehouseProductId: string,
		): Promise<WarehouseProduct | null> {
			const data = await queryData<{ getWarehouseProduct: WarehouseProduct | null }>(client, {
				query: GET_WAREHOUSE_PRODUCT,
				variables: { warehouseId, warehouseProductId },
			});
			return data?.getWarehouseProduct ?? null;
		},

		async getCloseMerchants(geoLocation: GeoLocationFind): Promise<Merchant[]> {
			const data = await queryData<{ getCloseMerchants: Merchant[] }>(client, {
				query: GET_CLOSE_MERCHANTS,
				variables: { geoLocation },
			});
			return data?.getCloseMerchants ?? [];
		},

		async getMerchantsByName(searchName: string, geoLocation?: GeoLocationFind): Promise<Merchant[]> {
			const data = await queryData<{ getMerchantsBuyName: Merchant[] }>(client, {
				query: GET_MERCHANTS_BY_NAME,
				variables: { searchName, geoLocation },
			});
			return data?.getMerchantsBuyName ?? [];
		},

		async getOrderStatus(id: string): Promise<number | null> {
			const data = await queryData<{ getOrder: Pick<Order, 'status'> | null }>(client, {
				query: GET_ORDER_STATUS,
				variables: { id },
			});
			return data?.getOrder?.status ?? null;
		},

		async getOrderWaitForCompletion(id: string): Promise<boolean> {
			const data = await queryData<{ getOrder: Pick<Order, 'waitForCompletion'> | null }>(client, {
				query: GET_ORDER_WAIT_FOR_COMPLETION,
				variables: { id },
			});
			return !!data?.getOrder?.waitForCompletion;
		},

		async getOrderTotalPrice(id: string): Promise<number> {
			const data = await queryData<{ getOrder: Pick<Order, 'totalPrice'> | null }>(client, {
				query: GET_ORDER_TOTAL_PRICE,
				variables: { id },
			});
			return data?.getOrder?.totalPrice ?? 0;
		},

		/** Seeds demo orders for the fake invite code. */
		async generateOrdersByCustomerId(numberOfOrders: number, customerId: string): Promise<void> {
			await queryData(client, {
				query: GENERATE_ORDERS_BY_CUSTOMER_ID,
				variables: { numberOfOrders, customerId },
			});
		},
	};
}

export type GraphQLApi = ReturnType<typeof createGraphQLApi>;
