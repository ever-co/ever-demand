const String getOrder = r'''
	query GetOrder($id: String!) {
		getOrder(id: $id) ${getObject}
	}
''';

const String generateOrdersByCustomerId = r'''
	query GenerateOrdersByCustomerId(
		$numberOfOrders: Int!
		$customerId: String!
	) {
		generateOrdersByCustomerId(
			numberOfOrders: $numberOfOrders
			customerId: $customerId
		)
	}
''';

const String orderProductFragment = r'''
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
''';

const String orderFragment = r'''
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
''';

const String ordersHistoryPageQuery = r'''
	query OrdersHistoryPageQuery($userId: String!) {
		getOrders(userId: $userId) {
			...OrderFragment
		}
	}
''';
