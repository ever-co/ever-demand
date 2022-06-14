const String getCloseMerchants = r'''
	query getCloseMerchants(
		$geoLocation: GeoLocationFindInput!
	) {
		getCloseMerchants(geoLocation: $geoLocation) {
			id
			username
			name
			logo
		}
	}
''';

const String getMerchantsBuyName = r'''
	query GetMerchantsBuyName(
		$searchName: String!
		$geoLocation: GeoLocationFindInput
	) {
		getMerchantsBuyName(
			searchName: $searchName
			geoLocation: $geoLocation
		) {
			id
			username
			name
			logo
			isActive
		}
	}
''';

const String getStorePorducts = r'''
	query GetStoreProducts($storeId: String!, $fullProducts: Boolean!) {
		getStoreProducts(storeId: $storeId, fullProducts: $fullProducts) {
			id
			price
			count
			isTakeaway
			isProductAvailable
			isDeliveryRequired
			isCarrierRequired
			isManufacturing
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
				images {
					url
					locale
					width
					height
					orientation
				}
				_id
				descriptionHTML {
					locale
					value
				}
				_createdAt
				_updatedAt
				detailsHTML {
					value
					locale
				}
				categories
				details {
					value
					locale
				}
			}
			_id
			initialPrice
			deliveryTimeMin
			deliveryTimeMax
		}
		warehouse(id: $storeId) {
			name
			logo
			id
		}
	}
''';
