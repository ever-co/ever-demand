import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shop_flutter_mobile/config/app_config.dart';
import 'package:shop_flutter_mobile/data/models/enums.dart';
import 'package:shop_flutter_mobile/data/models/geo.dart';
import 'package:shop_flutter_mobile/data/models/order.dart';
import 'package:shop_flutter_mobile/data/network/http_services.dart';
import 'package:shop_flutter_mobile/data/network/pyro/pyro_router.dart';
import 'package:shop_flutter_mobile/data/repositories/location_repository.dart';
import 'package:shop_flutter_mobile/data/store/app_store.dart';
import 'package:shop_flutter_mobile/providers.dart';
import 'package:shop_flutter_mobile/services/invite_service.dart';
import 'package:shop_flutter_mobile/services/order_flow_service.dart';
import 'package:shop_flutter_mobile/services/session_service.dart';
import 'package:shop_flutter_mobile/services/startup_service.dart';

import '../helpers/fixtures.dart';
import '../helpers/test_env.dart';

void main() {
  late TestEnv env;
  late ProviderContainer c;
  AppStore store() => env.store;

  // Rebuilds the container after env.config / env.httpClient changed.
  void rebuild() {
    c.dispose();
    c = env.container();
  }

  setUp(() {
    env = TestEnv();
    c = env.container();
    addTearDown(() => c.dispose());
  });

  group('StartupService', () {
    test('server up: settings stored, device registered once', () async {
      env.serverDefaults(invites: true, registrationRequired: true);
      await c.read(startupServiceProvider).run();
      expect(store().serverConnection, isNull);
      expect(store().inviteSystem, isTrue);
      expect(store().registrationSystem, RegistrationSystem.enabled);
      expect(store().deviceId, 'd1');
      final Map<Object?, Object?> device =
          env.pyro.callsTo('device.create').single.single! as Map<Object?, Object?>;
      expect(device['type'], 'android');
      expect(device['language'], 'en-US');
      expect(device['channelId'], isNull);
      expect(device['uuid'], isNotEmpty);
      await c.read(startupServiceProvider).run();
      expect(env.pyro.callsTo('device.create'), hasLength(1));
    });

    test('server unreachable: serverConnection 0, no settings call', () async {
      env.httpClient = MockClient((_) async => throw http.ClientException('down'));
      rebuild();
      await c.read(startupServiceProvider).run();
      expect(store().serverConnection, 0);
      expect(store().isServerDown, isTrue);
      expect(env.pyro.callsTo('invite.getInvitesSettings'), isEmpty);
    });

    test('HTTP error status is stored', () async {
      env.httpClient = MockClient((_) async => http.Response('no', 503));
      rebuild();
      env.serverDefaults();
      await c.read(startupServiceProvider).checkServer();
      expect(store().serverConnection, 503);
      expect(store().isServerDown, isFalse);
    });

    test('maintenance: api or app type in maintenance', () async {
      env.config = const AppConfig(settingsMaintenanceApiUrl: 'http://m/status', mapsEnabled: false);
      env.httpClient = MockClient((http.Request r) async {
        if (r.url.host == 'm') {
          return http.Response(
            '{"maintenance":[{"type":"api","status":false,"message":""},'
            '{"type":"shop-mobile","status":true,"message":"<b>Back soon</b>"}]}',
            200,
          );
        }
        return http.Response('ok', 200);
      });
      rebuild();
      await c.read(startupServiceProvider).run();
      expect(store().maintenanceMode, 'shop-mobile');
      expect(env.pyro.callsTo('invite.getInvitesSettings'), isEmpty);
      final HttpServices h = c.read(httpServicesProvider);
      expect(await h.maintenanceMessage('shop-mobile', 'http://m/status'), '<b>Back soon</b>');
      expect(await h.maintenanceStatus('shop-mobile', 'http://m/status'), isFalse);
    });

    test('a server that never answers counts as down', () async {
      env.pyro.onCall('invite.getInvitesSettings', (_) => Completer<Object?>().future);
      final StartupService s = StartupService(
        config: env.config,
        store: store(),
        api: env.api,
        http: env.httpServices,
        language: () => 'en-US',
        rpcTimeout: const Duration(milliseconds: 20),
      );
      await s.loadServerSettings();
      expect(store().serverConnection, 0);
    });
  });

  group('SessionService', () {
    test('isLogged: no id → false; user → true; error → clears the id', () async {
      final SessionService s = c.read(sessionServiceProvider);
      expect(await s.isLogged(), isFalse);
      store().userId = 'u1';
      env.pyro.onValue('user.get', userJson());
      expect(await s.isLogged(), isTrue);
      env.pyro.onObserve('user.get', (_) => Stream<Object?>.error(const PyroError('NotFound', 'gone')));
      expect(await s.isLogged(), isFalse);
      expect(store().userId, isNull);
    });

    test('mustRegister only when registration is enabled', () async {
      final SessionService s = c.read(sessionServiceProvider);
      store().registrationSystem = RegistrationSystem.disabled;
      expect(await s.mustRegister(), isFalse);
      store().registrationSystem = RegistrationSystem.enabled;
      expect(await s.mustRegister(), isTrue);
    });
  });

  group('LocationRepository', () {
    test('default lat/lng wins and the device is not asked', () async {
      expect(await c.read(locationRepositoryProvider).currentLoc(), const Loc(lng: 23.3332736, lat: 42.6459136));
      expect(env.locator.calls, 0);
    });

    test('device, then IP lookup, else unavailable', () async {
      env.config = const AppConfig(defaultLatitude: null, defaultLongitude: null, mapsEnabled: false);
      env.httpClient = MockClient((http.Request r) async => r.url.path == '/getLocationByIP'
          ? http.Response('{"latitude": 1.5, "longitude": 2.5}', 200)
          : http.Response('ok', 200));
      rebuild();
      final LocationRepository repo = c.read(locationRepositoryProvider);
      expect(await repo.currentLoc(), const Loc(lng: 23.3, lat: 42.6));
      env.locator.position = null;
      expect(await repo.currentLoc(), const Loc(lng: 2.5, lat: 1.5));
      env.httpClient = MockClient((_) async => http.Response('', 204));
      rebuild();
      await expectLater(
        c.read(locationRepositoryProvider).currentLoc(),
        throwsA(isA<LocationUnavailableException>()),
      );
    });

    test('production uses the saved address of the customer', () async {
      env.config = const AppConfig(production: true, mapsEnabled: false);
      rebuild();
      store().userId = 'u1';
      env.pyro.onValue('user.get', userJson());
      expect(await c.read(locationRepositoryProvider).customerLoc(), const Loc(lng: 23.33, lat: 42.64));
    });
  });

  group('InviteService', () {
    setUp(() {
      env.pyro.onCall('user-auth.register', (_) => userJson(id: 'u7'));
    });

    test('fake invite code registers and seeds 40 demo orders', () async {
      env.gql.on('GenerateOrdersByCustomerId', (_) => <String, dynamic>{'generateOrdersByCustomerId': null});
      final InviteOutcome o = await c.read(inviteServiceProvider).submitCode(8321);
      expect(o, isA<InviteRegistered>().having((InviteRegistered r) => r.location, 'location', '/products'));
      expect(store().userId, 'u7');
      final Map<Object?, Object?> input =
          env.pyro.callsTo('user-auth.register').single.single! as Map<Object?, Object?>;
      final Map<Object?, Object?> user = input['user']! as Map<Object?, Object?>;
      expect(user['apartment'], '3');
      final Map<Object?, Object?> geo = user['geoLocation']! as Map<Object?, Object?>;
      expect(geo['city'], 'Sofia');
      expect(geo['countryId'], 21);
      expect((geo['loc']! as Map<Object?, Object?>)['coordinates'], <double>[23.3332736, 42.6459136]);
      await pumpEventQueue();
      expect(env.gql.requests('GenerateOrdersByCustomerId').single.variables, <String, dynamic>{
        'numberOfOrders': 40,
        'customerId': 'u7',
      });
      expect(env.pyro.callsTo('invite.getByCode'), isEmpty);
    });

    test('a code: getByCode with the location; null → wrong code', () async {
      env.pyro.onValue('invite.getByCode', null);
      expect(await c.read(inviteServiceProvider).submitCode(1234), isA<InviteWrongCode>());
      final Map<Object?, Object?> info =
          env.pyro.callsTo('invite.getByCode').single.single! as Map<Object?, Object?>;
      expect(info['inviteCode'], '1234');
      expect(info['location'], isNotNull);
      env.pyro.onValue('invite.getByCode', inviteJson());
      expect(await c.read(inviteServiceProvider).submitCode(1234), isA<InviteRegistered>());
    });

    test('back to product details after registering', () async {
      store()
        ..backToDetails = 'p1'
        ..warehouseId = 'w1';
      env.pyro.onValue('invite.getByCode', inviteJson());
      final InviteOutcome o = await c.read(inviteServiceProvider).submitCode(1234);
      expect(
        (o as InviteRegistered).location,
        '/products/product-details/p1?backUrl=%2Fproducts&warehouseId=w1',
      );
      expect(store().backToDetails, isNull);
    });

    test('address form validation', () {
      expect(const AddressForm().isValid, isFalse);
      expect(
        const AddressForm(city: 'Sofia', streetAddress: 'Vitosha', house: 1, countryId: 21, apartment: 2).isValid,
        isTrue,
      );
      expect(
        const AddressForm(city: 'Sofia', streetAddress: 'Vitosha', house: 1, countryId: 21).isValid,
        isFalse,
      );
      const AddressForm noApt = AddressForm(
        city: 'Sofia',
        streetAddress: 'Vitosha',
        house: 1,
        countryId: 21,
        isApartment: false,
      );
      expect(noApt.isValid, isTrue);
      expect(noApt.apartmentValue, '0');
    });

    test('address: invalid → info missing; invite found → registered', () async {
      expect(await c.read(inviteServiceProvider).submitAddress(const AddressForm()), isA<InviteInfoMissing>());
      env.pyro.onValue('invite.getByLocation', inviteJson());
      final InviteOutcome o = await c.read(inviteServiceProvider).submitAddress(
            const AddressForm(city: 'Sofia', streetAddress: 'Vitosha', house: 1, countryId: 21, apartment: 2),
          );
      expect(o, isA<InviteRegistered>());
      expect(env.pyro.callsTo('invite-request.create'), isEmpty);
    });

    test('address without invite, invite system on: request saved, wait for a code', () async {
      store()
        ..inviteSystem = true
        ..deviceId = 'd1';
      env.pyro
        ..onValue('invite.getByLocation', null)
        ..onCall('invite-request.create', (_) => inviteRequestJson());
      final InviteOutcome o = await c.read(inviteServiceProvider).submitAddress(
            const AddressForm(city: 'Sofia', streetAddress: 'Vitosha', house: 1, countryId: 21, apartment: 5),
          );
      expect(o, isA<InviteRequested>());
      expect(store().inviteRequestId, 'ir1');
      expect(store().inviteAddress, 'Vitosha 1/5, Sofia');
      expect(env.pyro.callsTo('user-auth.register'), isEmpty);
    });

    test('address without invite, invite system off: invite created and registered', () async {
      store().inviteSystem = false;
      env.pyro
        ..onValue('invite.getByLocation', null)
        ..onCall('invite-request.create', (_) => inviteRequestJson())
        ..onCall('invite.create', (_) => inviteJson(id: 'i5'));
      final InviteOutcome o = await c.read(inviteServiceProvider).submitAddress(
            const AddressForm(city: 'Sofia', streetAddress: 'Vitosha', house: 1, countryId: 21, apartment: 5),
          );
      expect(o, isA<InviteRegistered>());
      expect(env.pyro.callsTo('invite.create').single.single, inviteRequestJson());
      expect(store().userId, 'u7');
    });

    test('prefill from ArcGIS reverse geocoding', () async {
      env.pyro.onCall(
        'geo-location.getAddressByCoordinatesUsingArcGIS',
        (_) => <String, Object?>{'locality': 'Sofia', 'thoroughfare': 'Vitosha', 'country': 'BG'},
      );
      final AddressPrefill? p = await c.read(inviteServiceProvider).prefillAddress();
      expect(p?.city, 'Sofia');
      expect(p?.streetAddress, 'Vitosha');
      expect(p?.countryId, 21);
    });
  });

  group('OrderFlowService', () {
    setUp(() {
      env.loggedIn();
      env.pyro
        ..onCall('warehouse-orders.create', (_) => orderJson(id: 'o9', warehouseId: 'w1'))
        ..onCall('warehouse-orders.addMore', (_) => orderJson(id: 'o9'))
        ..onCall('warehouse-orders.cancel', (_) => orderJson(id: 'o9', isPaid: true, isCancelled: true))
        ..onCall('order.refundWithStripe', (_) => orderJson(id: 'o9'))
        ..onCall('warehouse-orders.userComplete', (_) => orderJson(id: 'o9'));
    });

    test('browse first: registration needed, product kept for later', () async {
      store()
        ..userId = null
        ..registrationSystem = RegistrationSystem.disabled;
      final OrderFlowService f = c.read(orderFlowServiceProvider);
      expect(
        await f.buy(warehouseId: 'w1', productId: 'p1', warehouseProductId: 'wp1'),
        BuyOutcome.needsRegistration,
      );
      expect(store().registrationSystem, RegistrationSystem.once);
      expect(store().buyProduct, 'wp1');
      expect(store().warehouseId, 'w1');
      expect(store().backToDetails, isNull);
      store().registrationSystem = RegistrationSystem.disabled;
      await f.buy(warehouseId: 'w1', productId: 'p1', warehouseProductId: 'wp1', fromDetails: true);
      expect(store().buyProduct, 'p1');
      expect(store().backToDetails, 'p1');
    });

    test('creates the order, then adds to it while it is open', () async {
      final OrderFlowService f = c.read(orderFlowServiceProvider);
      expect(
        await f.buy(warehouseId: 'w1', productId: 'p1', warehouseProductId: 'wp1'),
        BuyOutcome.showOrderInfo,
      );
      expect(store().orderId, 'o9');
      expect(store().orderWarehouseId, 'w1');
      await f.buy(warehouseId: 'w1', productId: 'p2', warehouseProductId: 'wp2');
      expect(env.pyro.callsTo('warehouse-orders.create'), hasLength(1));
      expect(env.pyro.callsTo('warehouse-orders.addMore').single, <Object?>[
        'w1',
        'u1',
        'o9',
        <Map<String, Object?>>[
          <String, Object?>{'count': 1, 'productId': 'p2'},
        ],
      ]);
      expect(f.orderInfoLocation, '/order-info');
      store().deliveryType = DeliveryType.takeaway;
      expect(f.orderInfoLocation, '/order-info-takeaway');
    });

    test('a failed create is "sold out"', () async {
      env.pyro.onCall('warehouse-orders.create', (_) => throw const PyroError('Error', 'sold out'));
      expect(
        await c.read(orderFlowServiceProvider).buy(warehouseId: 'w1', productId: 'p1', warehouseProductId: 'wp1'),
        BuyOutcome.soldOut,
      );
      expect(store().orderId, isNull);
    });

    test('shopping cart: waitForCompletion sent, cart shown, userComplete', () async {
      env.config = const AppConfig(shoppingCart: true, mapsEnabled: false);
      rebuild();
      env.gql.on('GetOrder', (_) => <String, dynamic>{
            'getOrder': <String, dynamic>{'waitForCompletion': true},
          });
      final OrderFlowService f = c.read(orderFlowServiceProvider);
      expect(await f.buy(warehouseId: 'w1', productId: 'p1', warehouseProductId: 'wp1'), BuyOutcome.showCart);
      final Map<Object?, Object?> input =
          env.pyro.callsTo('warehouse-orders.create').single.single! as Map<Object?, Object?>;
      expect(input['waitForCompletion'], isTrue);
      await f.completeCart();
      expect(env.pyro.callsTo('warehouse-orders.userComplete').single, <Object?>['o9']);
    });

    test('cancel refunds a paid order and forgets it', () async {
      store()
        ..orderId = 'o9'
        ..startOrderDate = DateTime.now();
      await c.read(orderFlowServiceProvider).cancelOpenOrder();
      expect(env.pyro.callsTo('warehouse-orders.cancel').single, <Object?>['o9']);
      expect(env.pyro.callsTo('order.refundWithStripe').single, <Object?>['o9']);
      expect(store().orderId, isNull);
      expect(store().startOrderDate, isNull);
    });

    test('issue close: cancel, refund only when paid', () async {
      store().orderId = 'o9';
      final OrderFlowService f = c.read(orderFlowServiceProvider);
      await f.closeWithIssue(Order.fromJson(orderJson(id: 'o9')));
      expect(env.pyro.callsTo('order.refundWithStripe'), isEmpty);
      expect(store().orderId, isNull);
    });

    test('feed filter: open order merchant while not delivered; finished order cleared', () async {
      store()
        ..orderId = 'o9'
        ..orderWarehouseId = 'w1';
      env.gql.on('GetOrder', (_) => <String, dynamic>{'getOrder': <String, dynamic>{'status': 1}});
      final OrderFlowService f = c.read(orderFlowServiceProvider);
      expect(await f.openOrderMerchantFilter(), <String>['w1']);
      env.gql.on('GetOrder', (_) => <String, dynamic>{'getOrder': <String, dynamic>{'status': 2}});
      expect(await f.openOrderMerchantFilter(), isNull);
      expect(store().orderId, isNull);
    });
  });
}
