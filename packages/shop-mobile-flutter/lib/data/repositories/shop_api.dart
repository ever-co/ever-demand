import 'dart:async';

import '../models/geo.dart';
import '../models/invite.dart';
import '../models/json.dart';
import '../models/order.dart';
import '../models/product.dart';
import '../models/user.dart';
import '../models/warehouse.dart';
import '../network/pyro/pyro_router.dart';

/// Typed wrappers over the pyro routers the shop app uses, one class per
/// router of packages/common-angular/src/routers. Method names and argument
/// lists match those routers exactly (docs/latest-stack/shop-mobile-features.md
/// §1.3), so the server sees the same calls as from the Ionic app.
class ShopApi {
  ShopApi(this.client);

  final PyroClient client;

  late final DeviceRouterApi device = DeviceRouterApi(client.router('device'));
  late final InviteRouterApi invite = InviteRouterApi(client.router('invite'));
  late final InviteRequestRouterApi inviteRequest =
      InviteRequestRouterApi(client.router('invite-request'));
  late final UserAuthRouterApi userAuth =
      UserAuthRouterApi(client.router('user-auth'));
  late final UserRouterApi user = UserRouterApi(client.router('user'));
  late final UserProductsRouterApi userProducts =
      UserProductsRouterApi(client.router('user-products'));
  late final GeoLocationRouterApi geoLocation =
      GeoLocationRouterApi(client.router('geo-location'));
  late final WarehouseRouterApi warehouse =
      WarehouseRouterApi(client.router('warehouse'));
  late final WarehouseProductsRouterApi warehouseProducts =
      WarehouseProductsRouterApi(client.router('warehouse-products'));
  late final WarehouseOrdersRouterApi warehouseOrders =
      WarehouseOrdersRouterApi(client.router('warehouse-orders'));
  late final OrderRouterApi order = OrderRouterApi(client.router('order'));
}

T? _orNull<T>(Object? raw, T Function(Json) build) =>
    raw is Map ? build(asJson(raw)) : null;

T _required<T>(Object? raw, T Function(Json) build, String what) {
  if (raw is Map) return build(asJson(raw));
  throw PyroError('EmptyResult', '$what returned no value');
}

class DeviceRouterApi {
  DeviceRouterApi(this.router);
  final PyroRouter router;

  Future<Device> create({
    required String? channelId,
    required String language,
    required String type,
    required String uuid,
  }) async =>
      _required(
        await router.run('create', <Object?>[
          <String, Object?>{
            'channelId': channelId,
            'language': language,
            'type': type,
            'uuid': uuid,
          },
        ]),
        Device.fromJson,
        'device.create',
      );

  Future<Device?> updateLanguage(String deviceId, String language) async =>
      _orNull(
        await router.run('updateLanguage', <Object?>[deviceId, language]),
        Device.fromJson,
      );
}

class InviteRouterApi {
  InviteRouterApi(this.router);
  final PyroRouter router;

  Future<bool> getInvitesSettings() async {
    final Object? res = await router.run('getInvitesSettings');
    return res is Map && res['isEnabled'] == true;
  }

  /// First value of the observable `getByCode({ location, inviteCode })`.
  Future<Invite?> getByCode({required String inviteCode, Loc? location}) async {
    final Object? res = await router.observe('getByCode', <Object?>[
      <String, Object?>{
        if (location != null) 'location': location.toJson(),
        'inviteCode': inviteCode,
      },
    ]).first;
    return _orNull(res, Invite.fromJson);
  }

  /// First value of `getByLocation({ apartment, house, streetAddress, city,
  /// countryId, notes })`.
  Future<Invite?> getByLocation({
    required String apartment,
    required String house,
    required String streetAddress,
    required String city,
    required int countryId,
    String? notes,
  }) async {
    final Object? res = await router.observe('getByLocation', <Object?>[
      <String, Object?>{
        'apartment': apartment,
        'house': house,
        'streetAddress': streetAddress,
        'city': city,
        'countryId': countryId,
        'notes': notes,
      },
    ]).first;
    return _orNull(res, Invite.fromJson);
  }

  /// `invite.create(inviteRequest)`: the Ionic app passes the invite request
  /// object as the create object.
  Future<Invite> create(Json inviteCreateObject) async => _required(
        await router.run('create', <Object?>[inviteCreateObject]),
        Invite.fromJson,
        'invite.create',
      );
}

class InviteRequestRouterApi {
  InviteRequestRouterApi(this.router);
  final PyroRouter router;

  Future<InviteRequest> create({
    required GeoLocation geoLocation,
    required String apartment,
    required String? deviceId,
  }) async =>
      _required(
        await router.run('create', <Object?>[
          <String, Object?>{
            'geoLocation': <String, Object?>{
              'loc': geoLocation.loc?.toJson(),
              'countryId': geoLocation.countryId,
              'city': geoLocation.city,
              'streetAddress': geoLocation.streetAddress,
              'house': geoLocation.house,
              'notes': geoLocation.notes,
            },
            'apartment': apartment,
            'deviceId': deviceId,
          },
        ]),
        InviteRequest.fromJson,
        'invite-request.create',
      );
}

class UserAuthRouterApi {
  UserAuthRouterApi(this.router);
  final PyroRouter router;

  Future<bool> getRegistrationRequiredOnStart() async {
    final Object? res = await router.run('getRegistrationsSettings');
    return res is Map && res['registrationRequiredOnStart'] == true;
  }

  /// `register({ user: { apartment, geoLocation } })`.
  Future<User> register({
    required String? apartment,
    required Json geoLocation,
  }) async =>
      _required(
        await router.run('register', <Object?>[
          <String, Object?>{
            'user': <String, Object?>{
              'apartment': apartment,
              'geoLocation': geoLocation,
            },
          },
        ]),
        User.fromJson,
        'user-auth.register',
      );
}

class UserRouterApi {
  UserRouterApi(this.router);
  final PyroRouter router;

  Stream<User?> get(String userId) => router
      .observe('get', <Object?>[userId])
      .map((Object? raw) => _orNull(raw, User.fromJson));

  Future<List<PaymentCard>> getCards(String userId) async {
    final Object? res = await router.run('getCards', <Object?>[userId]);
    return asJsonList(res).map(PaymentCard.fromJson).toList();
  }

  Future<User> updateEmail(String userId, String email) async => _required(
        await router.run('updateEmail', <Object?>[userId, email]),
        User.fromJson,
        'user.updateEmail',
      );

  /// Returns the new card id.
  Future<String> addPaymentMethod(String userId, String tokenId) async {
    final Object? res =
        await router.run('addPaymentMethod', <Object?>[userId, tokenId]);
    if (res == null) {
      throw const PyroError('EmptyResult', 'addPaymentMethod returned no card');
    }
    return '$res';
  }

  Stream<String> _html(String method, String? userId, String? deviceId, String language) =>
      router
          .observe(method, <Object?>[userId, deviceId, language])
          .map((Object? v) => v?.toString() ?? '');

  Stream<String> getAboutUs(String? userId, String? deviceId, String language) =>
      _html('getAboutUs', userId, deviceId, language);

  Stream<String> getHelp(String? userId, String? deviceId, String language) =>
      _html('getHelp', userId, deviceId, language);

  Stream<String> getPrivacy(String? userId, String? deviceId, String language) =>
      _html('getPrivacy', userId, deviceId, language);

  Stream<String> getTermsOfUse(
    String? userId,
    String? deviceId,
    String language,
  ) =>
      _html('getTermsOfUse', userId, deviceId, language);
}

class UserProductsRouterApi {
  UserProductsRouterApi(this.router);
  final PyroRouter router;

  Stream<String?> getPlaceholder(String userId, String? deviceId) => router
      .observe('getPlaceholder', <Object?>[userId, deviceId])
      .map((Object? v) => v?.toString());
}

/// `{ locality, thoroughfare, country }` from the ArcGIS reverse geocoder.
typedef ReverseGeocodedAddress = ({
  String? locality,
  String? thoroughfare,
  String? country,
});

class GeoLocationRouterApi {
  GeoLocationRouterApi(this.router);
  final PyroRouter router;

  Future<ReverseGeocodedAddress?> getAddressByCoordinatesUsingArcGIS(
    double lat,
    double lng,
  ) async {
    final Object? res = await router
        .run('getAddressByCoordinatesUsingArcGIS', <Object?>[lat, lng]);
    if (res is! Map) return null;
    return (
      locality: res['locality']?.toString(),
      thoroughfare: res['thoroughfare']?.toString(),
      country: res['country']?.toString(),
    );
  }
}

class WarehouseRouterApi {
  WarehouseRouterApi(this.router);
  final PyroRouter router;

  Stream<Warehouse?> get(String warehouseId, {bool fullProducts = true}) =>
      router
          .observe('get', <Object?>[warehouseId, fullProducts])
          .map((Object? raw) => _orNull(raw, Warehouse.fromJson));
}

class WarehouseProductsRouterApi {
  WarehouseProductsRouterApi(this.router);
  final PyroRouter router;

  Stream<List<WarehouseProduct>> get(
    String warehouseId, {
    bool fullProducts = true,
  }) =>
      router
          .observe('get', <Object?>[warehouseId, fullProducts])
          .map((Object? raw) =>
              asJsonList(raw).map(WarehouseProduct.fromJson).toList());
}

/// `IOrderCreateInputProduct`.
typedef OrderCreateProduct = ({int count, String productId});

class WarehouseOrdersRouterApi {
  WarehouseOrdersRouterApi(this.router);
  final PyroRouter router;

  static List<Map<String, Object?>> _products(List<OrderCreateProduct> p) =>
      <Map<String, Object?>>[
        for (final OrderCreateProduct x in p)
          <String, Object?>{'count': x.count, 'productId': x.productId},
      ];

  /// `create({ warehouseId, products, userId, orderType, waitForCompletion?,
  /// options: { autoConfirm: true } })`.
  Future<Order> create({
    required String warehouseId,
    required List<OrderCreateProduct> products,
    required String userId,
    required int orderType,
    bool? waitForCompletion,
  }) async =>
      _required(
        await router.run('create', <Object?>[
          <String, Object?>{
            'warehouseId': warehouseId,
            'products': _products(products),
            'userId': userId,
            'orderType': orderType,
            'waitForCompletion': ?waitForCompletion,
            'options': const <String, Object?>{'autoConfirm': true},
          },
        ]),
        Order.fromJson,
        'warehouse-orders.create',
      );

  Future<Order> addMore({
    required String warehouseId,
    required String userId,
    required String orderId,
    required List<OrderCreateProduct> products,
  }) async =>
      _required(
        await router.run('addMore', <Object?>[
          warehouseId,
          userId,
          orderId,
          _products(products),
        ]),
        Order.fromJson,
        'warehouse-orders.addMore',
      );

  Future<Order> userComplete(String orderId) async => _required(
        await router.run('userComplete', <Object?>[orderId]),
        Order.fromJson,
        'warehouse-orders.userComplete',
      );

  Future<Order> cancel(String orderId) async => _required(
        await router.run('cancel', <Object?>[orderId]),
        Order.fromJson,
        'warehouse-orders.cancel',
      );
}

class OrderRouterApi {
  OrderRouterApi(this.router);
  final PyroRouter router;

  /// Live order: `get(orderId, { populateWarehouse, populateCarrier })`.
  Stream<Order?> get(
    String orderId, {
    bool populateWarehouse = true,
    bool populateCarrier = true,
  }) =>
      router.observe('get', <Object?>[
        orderId,
        <String, Object?>{
          'populateWarehouse': populateWarehouse,
          'populateCarrier': populateCarrier,
        },
      ]).map((Object? raw) => _orNull(raw, Order.fromJson));

  Future<Order> confirm(String orderId) async => _required(
        await router.run('confirm', <Object?>[orderId]),
        Order.fromJson,
        'order.confirm',
      );

  /// `payWithStripe(orderId, cardId)` (saved card) or with `shownCurrency` as
  /// a third argument (new card). The currency is sent only when given.
  Future<Order> payWithStripe(
    String orderId,
    String cardId, {
    String? shownCurrency,
  }) async =>
      _required(
        await router.run('payWithStripe', <Object?>[
          orderId,
          cardId,
          ?shownCurrency,
        ]),
        Order.fromJson,
        'order.payWithStripe',
      );

  Future<String> getStripeCurrency() async {
    final Object? res = await router.run('getStripeCurrency');
    if (res == null) {
      throw const PyroError('EmptyResult', 'getStripeCurrency returned null');
    }
    return '$res';
  }

  Future<Order?> refundWithStripe(String orderId) async => _orNull(
        await router.run('refundWithStripe', <Object?>[orderId]),
        Order.fromJson,
      );

  Future<Order> removeProducts(String orderId, List<String> productIds) async =>
      _required(
        await router.run('removeProducts', <Object?>[orderId, productIds]),
        Order.fromJson,
        'order.removeProducts',
      );

  Future<Order> addProductComment(
    String orderId,
    String productId,
    String comment,
  ) async =>
      _required(
        await router.run(
          'addProductComment',
          <Object?>[orderId, productId, comment],
        ),
        Order.fromJson,
        'order.addProductComment',
      );
}
