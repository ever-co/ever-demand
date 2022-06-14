const String productsQuery = r'''
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
''';

const String productQuery = r'''
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
''';

const String getWarehouseProduct = r'''
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
	}
''';

const String geoLocationProductsByPaging = r'''
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
''';

const String getCountOfGeoLocationProducts = r'''
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
''';
