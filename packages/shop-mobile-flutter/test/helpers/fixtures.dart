// JSON payloads shaped like the API's (pyro raw objects use `_id`, GraphQL
// uses `id`).

Map<String, dynamic> member(String value, [String locale = 'en-US']) =>
    <String, dynamic>{'locale': locale, 'value': value};

Map<String, dynamic> imageJson({
  String url = '',
  String locale = 'en-US',
  int orientation = 1,
}) =>
    <String, dynamic>{
      'locale': locale,
      'url': url,
      'width': 100,
      'height': 100,
      'orientation': orientation,
    };

Map<String, dynamic> productJson({
  String id = 'p1',
  String title = 'Spiced pasta',
  String description = 'Hot and fresh',
  String details = 'Pasta, chili',
  List<Map<String, dynamic>>? images,
}) =>
    <String, dynamic>{
      'id': id,
      'title': <Map<String, dynamic>>[member(title), member('Паста', 'bg-BG')],
      'description': <Map<String, dynamic>>[member(description)],
      'details': <Map<String, dynamic>>[member(details)],
      'images': images ?? <Map<String, dynamic>>[imageJson()],
    };

Map<String, dynamic> warehouseProductJson({
  String id = 'wp1',
  String productId = 'p1',
  String title = 'Spiced pasta',
  double price = 10,
  double? initialPrice = 12,
  int count = 5,
  bool available = true,
  int? deliveryTimeMin,
  int? deliveryTimeMax,
}) =>
    <String, dynamic>{
      'id': id,
      'price': price,
      'initialPrice': initialPrice,
      'count': count,
      'soldCount': 0,
      'product': productJson(id: productId, title: title),
      'isManufacturing': true,
      'isCarrierRequired': true,
      'isDeliveryRequired': true,
      'isProductAvailable': available,
      'isTakeaway': true,
      'deliveryTimeMin': deliveryTimeMin,
      'deliveryTimeMax': deliveryTimeMax,
    };

Map<String, dynamic> productInfoJson({
  String warehouseId = 'w1',
  String id = 'wp1',
  String productId = 'p1',
  String title = 'Spiced pasta',
  double price = 10,
  int count = 5,
  bool available = true,
}) =>
    <String, dynamic>{
      'distance': 1.5,
      'warehouseId': warehouseId,
      'warehouseLogo': '',
      'warehouseProduct': warehouseProductJson(
        id: id,
        productId: productId,
        title: title,
        price: price,
        count: count,
        available: available,
      ),
    };

Map<String, dynamic> geoJson({
  double lng = 23.33,
  double lat = 42.64,
  String city = 'Sofia',
  String street = 'Simeonovsko shose',
  String house = '104',
  int countryId = 21,
  String? postcode = '1700',
}) =>
    <String, dynamic>{
      '_id': 'g1',
      'countryId': countryId,
      'city': city,
      'streetAddress': street,
      'house': house,
      'postcode': postcode,
      'loc': <String, dynamic>{
        'type': 'Point',
        'coordinates': <double>[lng, lat],
      },
    };

Map<String, dynamic> warehouseJson({
  String id = 'w1',
  String name = 'Ever Pizza',
  bool isPaymentEnabled = true,
  bool isActive = true,
  String? contactPhone = '0888123456',
  int orderBarcodeType = 0,
  List<Map<String, dynamic>>? products,
}) =>
    <String, dynamic>{
      '_id': id,
      'name': name,
      'username': name.toLowerCase(),
      'logo': '',
      'isActive': isActive,
      'isPaymentEnabled': isPaymentEnabled,
      'contactPhone': contactPhone,
      'orderBarcodeType': orderBarcodeType,
      'geoLocation': geoJson(lng: 23.32, lat: 42.69),
      'products': products ?? <Map<String, dynamic>>[warehouseProductJson()],
    };

Map<String, dynamic> orderProductJson({
  String id = 'op1',
  String productId = 'p1',
  String title = 'Spiced pasta',
  int count = 1,
  double price = 10,
  bool isTakeaway = false,
  int? deliveryTimeMin,
  int? deliveryTimeMax,
  String? comment,
}) =>
    <String, dynamic>{
      '_id': id,
      'count': count,
      'price': price,
      'initialPrice': price,
      'isTakeaway': isTakeaway,
      'isDeliveryRequired': !isTakeaway,
      'deliveryTimeMin': deliveryTimeMin,
      'deliveryTimeMax': deliveryTimeMax,
      'comment': comment,
      'product': productJson(id: productId, title: title),
    };

Map<String, dynamic> orderJson({
  String id = 'o1',
  String warehouseId = 'w1',
  int warehouseStatus = 1,
  int carrierStatus = 0,
  bool isPaid = false,
  bool isCompleted = false,
  bool isCancelled = false,
  bool withCarrier = false,
  bool waitForCompletion = false,
  int orderNumber = 7,
  String createdAt = '2026-11-25T10:00:00.000Z',
  List<Map<String, dynamic>>? products,
  Map<String, dynamic>? warehouse,
  int? status,
}) =>
    <String, dynamic>{
      '_id': id,
      'warehouseId': warehouseId,
      'warehouse': warehouse ?? warehouseJson(id: warehouseId),
      'user': <String, dynamic>{'_id': 'u1', 'geoLocation': geoJson()},
      'carrier': withCarrier
          ? <String, dynamic>{'_id': 'c1', 'geoLocation': geoJson(lng: 23.34, lat: 42.65)}
          : null,
      'products': products ?? <Map<String, dynamic>>[orderProductJson()],
      'isConfirmed': true,
      'isCancelled': isCancelled,
      'isPaid': isPaid,
      'isCompleted': isCompleted,
      'waitForCompletion': waitForCompletion,
      'warehouseStatus': warehouseStatus,
      'carrierStatus': carrierStatus,
      'orderNumber': orderNumber,
      'createdAt': createdAt,
      'status': ?status,
    };

Map<String, dynamic> userJson({String id = 'u1', String? email}) =>
    <String, dynamic>{
      '_id': id,
      'email': email,
      'apartment': '3',
      'geoLocation': geoJson(),
    };

Map<String, dynamic> inviteJson({String id = 'i1', String apartment = '3'}) =>
    <String, dynamic>{
      '_id': id,
      'code': '1234',
      'apartment': apartment,
      'geoLocation': geoJson(),
    };

Map<String, dynamic> inviteRequestJson({String id = 'ir1'}) =>
    <String, dynamic>{
      '_id': id,
      'apartment': '5',
      'geoLocation': geoJson(street: 'Vitosha', house: '1', city: 'Sofia'),
    };
