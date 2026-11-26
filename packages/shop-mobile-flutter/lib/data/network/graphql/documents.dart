// GraphQL documents of the shop app, copied from packages/shop-mobile-ionic
// (docs/latest-stack/shop-mobile-features.md §1.4). Every operation is a
// query of the existing schema in packages/core/src/graphql.

const String _warehouseProductFields = r'''
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
''';

const String geoLocationProductsByPagingQuery =
    '''
query GeoLocationProductsByPaging(
  \$geoLocation: GeoLocationFindInput!
  \$options: GetGeoLocationProductsOptions
  \$pagingOptions: PagingOptionsInput
  \$searchText: String
) {
  geoLocationProductsByPaging(
    geoLocation: \$geoLocation
    options: \$options
    pagingOptions: \$pagingOptions
    searchText: \$searchText
  ) {
    distance
    warehouseId
    warehouseLogo
    warehouseProduct {
$_warehouseProductFields
    }
  }
}
''';

const String getCountOfGeoLocationProductsQuery = r'''
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

const String getWarehouseProductQuery =
    '''
query GetWarehouseProduct(
  \$warehouseId: String!
  \$warehouseProductId: String!
) {
  getWarehouseProduct(
    warehouseId: \$warehouseId
    warehouseProductId: \$warehouseProductId
  ) {
$_warehouseProductFields
  }
}
''';

const String getCloseMerchantsQuery = r'''
query getCloseMerchants($geoLocation: GeoLocationFindInput!) {
  getCloseMerchants(geoLocation: $geoLocation) {
    id
    username
    name
    logo
  }
}
''';

const String getMerchantsBuyNameQuery = r'''
query GetMerchantsBuyName(
  $searchName: String!
  $geoLocation: GeoLocationFindInput
) {
  getMerchantsBuyName(searchName: $searchName, geoLocation: $geoLocation) {
    id
    username
    name
    logo
    isActive
  }
}
''';

/// `GetOrder` with a caller-given selection set (`{status}` or
/// `{waitForCompletion}` in the Ionic app).
String getOrderQuery(String selection) => '''
query GetOrder(\$id: String!) {
  getOrder(id: \$id) $selection
}
''';

const String generateOrdersByCustomerIdQuery = r'''
query GenerateOrdersByCustomerId($numberOfOrders: Int!, $customerId: String!) {
  generateOrdersByCustomerId(
    numberOfOrders: $numberOfOrders
    customerId: $customerId
  )
}
''';

const String getUserQuery = r'''
query GetUser($id: String!) {
  user(id: $id) {
    apartment
    geoLocation {
      countryId
      countryName
      postcode
      city
      streetAddress
    }
  }
}
''';

const String _orderFragments = r'''
fragment OrderFragment on Order {
  id
  deliveryTime
  warehouseId
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

const String ordersHistoryQuery =
    '''
query OrdersHistoryPageQuery(\$userId: String!) {
  getOrders(userId: \$userId) {
    ...OrderFragment
  }
}

$_orderFragments''';

const String orderDetailsQuery =
    '''
query OrderDetailsPageQuery(\$id: String!) {
  getOrder(id: \$id) {
    ...OrderFragment
  }
}

$_orderFragments''';
