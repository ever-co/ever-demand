/**
 * GraphQL documents of the Ionic shop app, copied verbatim (feature inventory §1.4), so the Expo
 * app needs no schema change.
 */
import { gql, type TypedDocumentNode } from '@apollo/client';
import type { Order } from '../domain/types';

export const GEO_LOCATION_PRODUCTS_BY_PAGING = gql`
	query GeoLocationProductsByPaging(
		$geoLocation: GeoLocationFindInput!
		$options: GetGeoLocationProductsOptions
		$pagingOptions: PagingOptionsInput
		$searchText: String
	) {
		geoLocationProductsByPaging(
			geoLocation: $geoLocation
			options: $options
			pagingOptions: $pagingOptions
			searchText: $searchText
		) {
			distance
			warehouseId
			warehouseLogo
			warehouseProduct {
				id
				price
				initialPrice
				count
				soldCount

				product {
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
				isManufacturing
				isCarrierRequired
				isDeliveryRequired
				isProductAvailable
				isTakeaway
				deliveryTimeMin
				deliveryTimeMax
			}
		}
	}
`;

export const GET_COUNT_OF_GEO_LOCATION_PRODUCTS = gql`
	query GetCountOfGeoLocationProducts(
		$geoLocation: GeoLocationFindInput!
		$options: GetGeoLocationProductsOptions
		$searchText: String
	) {
		getCountOfGeoLocationProducts(
			geoLocation: $geoLocation
			options: $options
			searchText: $searchText
		)
	}
`;

export const GET_WAREHOUSE_PRODUCT = gql`
	query GetWarehouseProduct($warehouseId: String!, $warehouseProductId: String!) {
		getWarehouseProduct(warehouseId: $warehouseId, warehouseProductId: $warehouseProductId) {
			id
			price
			initialPrice
			count
			soldCount

			product {
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
			isManufacturing
			isCarrierRequired
			isDeliveryRequired
			isProductAvailable
			isTakeaway
			deliveryTimeMin
			deliveryTimeMax
		}
	}
`;

export const GET_CLOSE_MERCHANTS = gql`
	query getCloseMerchants($geoLocation: GeoLocationFindInput!) {
		getCloseMerchants(geoLocation: $geoLocation) {
			id
			username
			name
			logo
		}
	}
`;

export const GET_MERCHANTS_BY_NAME = gql`
	query GetMerchantsBuyName($searchName: String!, $geoLocation: GeoLocationFindInput) {
		getMerchantsBuyName(searchName: $searchName, geoLocation: $geoLocation) {
			id
			username
			name
			logo
			isActive
		}
	}
`;

/** `getOrder` with only the fields the feed needs (`{status}` or `{waitForCompletion}`). */
export const GET_ORDER_STATUS = gql`
	query GetOrder($id: String!) {
		getOrder(id: $id) {
			status
		}
	}
`;

export const GET_ORDER_WAIT_FOR_COMPLETION = gql`
	query GetOrder($id: String!) {
		getOrder(id: $id) {
			waitForCompletion
		}
	}
`;

export const GET_ORDER_TOTAL_PRICE = gql`
	query GetOrder($id: String!) {
		getOrder(id: $id) {
			totalPrice
		}
	}
`;

export const GENERATE_ORDERS_BY_CUSTOMER_ID = gql`
	query GenerateOrdersByCustomerId($numberOfOrders: Int!, $customerId: String!) {
		generateOrdersByCustomerId(numberOfOrders: $numberOfOrders, customerId: $customerId)
	}
`;

const ORDER_PRODUCT_FRAGMENT = gql`
	fragment OrderProductFragment on OrderProduct {
		count
		price
		isTakeaway
		product {
			images {
				locale
				orientation
				url
			}
			title {
				locale
				value
			}
			description {
				locale
				value
			}
		}
	}
`;

const ORDER_FRAGMENT = gql`
	fragment OrderFragment on Order {
		id
		deliveryTime
		warehouseId
		deliveryTime
		createdAt
		status
		user {
			id
			geoLocation {
				countryName
				countryId
				streetAddress
				house
				postcode
				house
				city
			}
		}
		warehouse {
			id
			logo
		}
		products {
			...OrderProductFragment
		}
	}
	${ORDER_PRODUCT_FRAGMENT}
`;

export const ORDERS_HISTORY: TypedDocumentNode<{ getOrders: Order[] }, { userId: string }> = gql`
	query OrdersHistoryPageQuery($userId: String!) {
		getOrders(userId: $userId) {
			...OrderFragment
		}
	}
	${ORDER_FRAGMENT}
`;

export const ORDER_DETAILS: TypedDocumentNode<{ getOrder: Order | null }, { id: string }> = gql`
	query OrderDetailsPageQuery($id: String!) {
		getOrder(id: $id) {
			...OrderFragment
		}
	}
	${ORDER_FRAGMENT}
`;
