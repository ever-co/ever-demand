import { gql, TypedDocumentNode } from '@apollo/client';

/**
 * Query to retrieve products
 */
export const PRODUCTS_QUERY: TypedDocumentNode = gql`
	query ProductsQuery(
		$existedProductsIds: [String]
		$findInput: ProductsFindInput
		$pagingOptions: PagingOptionsInput
	) {
		products(
			existedProductsIds: $existedProductsIds
			findInput: $findInput
			pagingOptions: $pagingOptions
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
				url
				locale
			}
			categories
			_createdAt
			_updatedAt
		}
	}
`;

export const PRODUCT_QUERY: TypedDocumentNode = gql`
	query ProductQuery($productId: String!) {
		product(id: $productId) {
			_id
			id
			title {
				value
				locale
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
			_createdAt
			_updatedAt
		}
	}
`;

export const WAREHOUSE_PRODUCT_QUERY: TypedDocumentNode = gql`
	query GetWarehouseProduct(
		$warehouseId: String!
		$warehouseProductId: String!
	) {
		getWarehouseProduct(
			warehouseId: $warehouseId
			warehouseProductId: $warehouseProductId
		) {
			_id
			price
			initialPrice
			count
			soldCount
			product {
				_id
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
				_createdAt
				_updatedAt
			}
			isManufacturing
			isCarrierRequired
			isDeliveryRequired
			isProductAvailable
			isTakeaway
			deliveryTimeMin
			deliveryTimeMax
			id
		}

		warehouse(id: $warehouseId) {
			name
			logo
			id
		}
	}
`;

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
				isTakeaway
				deliveryTimeMin
				deliveryTimeMax
			}
		}
	}
`;
