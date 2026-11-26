import 'package:flutter_test/flutter_test.dart';
import 'package:shop_flutter_mobile/data/models/geo.dart';
import 'package:shop_flutter_mobile/data/models/invite.dart';
import 'package:shop_flutter_mobile/data/models/order.dart';
import 'package:shop_flutter_mobile/data/models/user.dart';
import 'package:shop_flutter_mobile/data/repositories/shop_api.dart';

import '../helpers/fake_pyro.dart';
import '../helpers/fixtures.dart';

/// Every router call the shop app makes, with the exact event name and
/// arguments of docs/latest-stack/shop-mobile-features.md §1.3.
void main() {
  late FakePyroBackend backend;
  late ShopApi api;

  setUp(() {
    backend = FakePyroBackend();
    api = ShopApi(backend.client());
  });

  test('device.create', () async {
    backend.onCall('device.create', (_) => <String, Object?>{'_id': 'd1'});
    final Device d = await api.device.create(
      channelId: null,
      language: 'en-US',
      type: 'browser',
      uuid: 'uuid-1',
    );
    expect(d.id, 'd1');
    expect(backend.callsTo('device.create').single, <Object?>[
      <String, Object?>{'channelId': null, 'language': 'en-US', 'type': 'browser', 'uuid': 'uuid-1'},
    ]);
  });

  test('invite settings, by code, by location, create', () async {
    backend
      ..onCall('invite.getInvitesSettings', (_) => <String, Object?>{'isEnabled': true})
      ..onValue('invite.getByCode', inviteJson())
      ..onValue('invite.getByLocation', null)
      ..onCall('invite.create', (List<Object?> a) => inviteJson(id: 'i2'));
    expect(await api.invite.getInvitesSettings(), isTrue);
    final Invite? byCode = await api.invite.getByCode(
      inviteCode: '1234',
      location: const Loc(lng: 23, lat: 42),
    );
    expect(byCode?.id, 'i1');
    expect(backend.callsTo('invite.getByCode').single, <Object?>[
      <String, Object?>{
        'location': <String, Object?>{'type': 'Point', 'coordinates': <double>[23, 42]},
        'inviteCode': '1234',
      },
    ]);
    expect(
      await api.invite.getByLocation(
        apartment: '0',
        house: '5',
        streetAddress: 'Vitosha',
        city: 'Sofia',
        countryId: 21,
        notes: 'gate 2',
      ),
      isNull,
    );
    expect(backend.callsTo('invite.getByLocation').single, <Object?>[
      <String, Object?>{
        'apartment': '0',
        'house': '5',
        'streetAddress': 'Vitosha',
        'city': 'Sofia',
        'countryId': 21,
        'notes': 'gate 2',
      },
    ]);
    final Invite created = await api.invite.create(inviteRequestJson());
    expect(created.id, 'i2');
    expect(backend.callsTo('invite.create').single.single, inviteRequestJson());
  });

  test('invite-request.create', () async {
    backend.onCall('invite-request.create', (_) => inviteRequestJson());
    final InviteRequest r = await api.inviteRequest.create(
      geoLocation: const GeoLocation(
        loc: Loc(lng: 23, lat: 42),
        countryId: 21,
        city: 'Sofia',
        streetAddress: 'Vitosha',
        house: '1',
      ),
      apartment: '5',
      deviceId: 'd1',
    );
    expect(r.id, 'ir1');
    expect(backend.callsTo('invite-request.create').single.single, <String, Object?>{
      'geoLocation': <String, Object?>{
        'loc': <String, Object?>{'type': 'Point', 'coordinates': <double>[23, 42]},
        'countryId': 21,
        'city': 'Sofia',
        'streetAddress': 'Vitosha',
        'house': '1',
        'notes': null,
      },
      'apartment': '5',
      'deviceId': 'd1',
    });
  });

  test('user-auth register and registration settings', () async {
    backend
      ..onCall('user-auth.getRegistrationsSettings', (_) => <String, Object?>{'registrationRequiredOnStart': true})
      ..onCall('user-auth.register', (_) => userJson(id: 'u9'));
    expect(await api.userAuth.getRegistrationRequiredOnStart(), isTrue);
    final User u = await api.userAuth.register(apartment: '3', geoLocation: geoJson());
    expect(u.id, 'u9');
    expect(backend.callsTo('user-auth.register').single.single, <String, Object?>{
      'user': <String, Object?>{'apartment': '3', 'geoLocation': geoJson()},
    });
  });

  test('user router: get, cards, email, payment method, info pages', () async {
    backend
      ..onValue('user.get', userJson())
      ..onCall('user.getCards', (_) => <Object?>[
            <String, Object?>{'id': 'card_1', 'last4': '4242'},
          ])
      ..onCall('user.updateEmail', (_) => userJson(email: 'a@b.co'))
      ..onCall('user.addPaymentMethod', (_) => 'card_2')
      ..onValue('user.getAboutUs', '<h1>About</h1>')
      ..onValue('user.getHelp', '<h1>Help</h1>')
      ..onValue('user.getPrivacy', '<h1>Privacy</h1>')
      ..onValue('user.getTermsOfUse', '<h1>Terms</h1>');
    expect((await api.user.get('u1').first)?.id, 'u1');
    expect((await api.user.getCards('u1')).single.last4, '4242');
    expect((await api.user.updateEmail('u1', 'a@b.co')).email, 'a@b.co');
    expect(await api.user.addPaymentMethod('u1', 'tok_1'), 'card_2');
    expect(await api.user.getAboutUs('u1', 'd1', 'en-US').first, '<h1>About</h1>');
    expect(await api.user.getHelp('u1', 'd1', 'en-US').first, '<h1>Help</h1>');
    expect(await api.user.getPrivacy('u1', 'd1', 'en-US').first, '<h1>Privacy</h1>');
    expect(await api.user.getTermsOfUse('u1', 'd1', 'bg-BG').first, '<h1>Terms</h1>');
    expect(backend.callsTo('user.updateEmail').single, <Object?>['u1', 'a@b.co']);
    expect(backend.callsTo('user.addPaymentMethod').single, <Object?>['u1', 'tok_1']);
    expect(backend.callsTo('user.getTermsOfUse').single, <Object?>['u1', 'd1', 'bg-BG']);
  });

  test('geo-location ArcGIS reverse geocode', () async {
    backend.onCall(
      'geo-location.getAddressByCoordinatesUsingArcGIS',
      (_) => <String, Object?>{'locality': 'Sofia', 'thoroughfare': 'Vitosha'},
    );
    final ReverseGeocodedAddress? a =
        await api.geoLocation.getAddressByCoordinatesUsingArcGIS(42.6, 23.3);
    expect(a?.locality, 'Sofia');
    expect(a?.country, isNull);
    expect(backend.callsTo('geo-location.getAddressByCoordinatesUsingArcGIS').single, <Object?>[42.6, 23.3]);
  });

  test('warehouse-orders create / addMore / userComplete / cancel', () async {
    backend
      ..onCall('warehouse-orders.create', (_) => orderJson())
      ..onCall('warehouse-orders.addMore', (_) => orderJson())
      ..onCall('warehouse-orders.userComplete', (_) => orderJson())
      ..onCall('warehouse-orders.cancel', (_) => orderJson(isCancelled: true));
    await api.warehouseOrders.create(
      warehouseId: 'w1',
      products: <OrderCreateProduct>[(count: 1, productId: 'p1')],
      userId: 'u1',
      orderType: 0,
      waitForCompletion: false,
    );
    expect(backend.callsTo('warehouse-orders.create').single.single, <String, Object?>{
      'warehouseId': 'w1',
      'products': <Map<String, Object?>>[
        <String, Object?>{'count': 1, 'productId': 'p1'},
      ],
      'userId': 'u1',
      'orderType': 0,
      'waitForCompletion': false,
      'options': <String, Object?>{'autoConfirm': true},
    });
    await api.warehouseOrders.create(
      warehouseId: 'w1',
      products: <OrderCreateProduct>[(count: 1, productId: 'p1')],
      userId: 'u1',
      orderType: 1,
    );
    final Map<Object?, Object?> second =
        backend.callsTo('warehouse-orders.create').last.single! as Map<Object?, Object?>;
    expect(second.containsKey('waitForCompletion'), isFalse);
    await api.warehouseOrders.addMore(
      warehouseId: 'w1',
      userId: 'u1',
      orderId: 'o1',
      products: <OrderCreateProduct>[(count: 1, productId: 'p2')],
    );
    expect(backend.callsTo('warehouse-orders.addMore').single, <Object?>[
      'w1',
      'u1',
      'o1',
      <Map<String, Object?>>[
        <String, Object?>{'count': 1, 'productId': 'p2'},
      ],
    ]);
    await api.warehouseOrders.userComplete('o1');
    final Order cancelled = await api.warehouseOrders.cancel('o1');
    expect(cancelled.isCancelled, isTrue);
    expect(backend.callsTo('warehouse-orders.cancel').single, <Object?>['o1']);
  });

  test('order: get, confirm, payWithStripe (2 / 3 args), currency, refund, products', () async {
    backend
      ..onValue('order.get', orderJson())
      ..onCall('order.confirm', (_) => orderJson())
      ..onCall('order.payWithStripe', (_) => orderJson(isPaid: true))
      ..onCall('order.getStripeCurrency', (_) => 'usd')
      ..onCall('order.refundWithStripe', (_) => orderJson())
      ..onCall('order.removeProducts', (_) => orderJson())
      ..onCall('order.addProductComment', (_) => orderJson());
    expect((await api.order.get('o1').first)?.id, 'o1');
    expect(backend.callsTo('order.get').single, <Object?>[
      'o1',
      <String, Object?>{'populateWarehouse': true, 'populateCarrier': true},
    ]);
    await api.order.payWithStripe('o1', 'card_1');
    await api.order.payWithStripe('o1', 'card_2', shownCurrency: 'USD');
    expect(backend.callsTo('order.payWithStripe'), <List<Object?>>[
      <Object?>['o1', 'card_1'],
      <Object?>['o1', 'card_2', 'USD'],
    ]);
    expect(await api.order.getStripeCurrency(), 'usd');
    expect(backend.callsTo('order.getStripeCurrency').single, isEmpty);
    await api.order.confirm('o1');
    await api.order.refundWithStripe('o1');
    await api.order.removeProducts('o1', <String>['p1']);
    await api.order.addProductComment('o1', 'op1', 'no onions');
    expect(backend.callsTo('order.removeProducts').single, <Object?>[
      'o1',
      <String>['p1'],
    ]);
    expect(backend.callsTo('order.addProductComment').single, <Object?>['o1', 'op1', 'no onions']);
  });

  test('warehouse, warehouse-products and user-products observables', () async {
    backend
      ..onValue('warehouse.get', warehouseJson())
      ..onValue('warehouse-products.get', <Object?>[warehouseProductJson()])
      ..onValue('user-products.getPlaceholder', '<p>Soon</p>');
    expect((await api.warehouse.get('w1', fullProducts: false).first)?.name, 'Ever Pizza');
    expect(backend.callsTo('warehouse.get').single, <Object?>['w1', false]);
    expect((await api.warehouseProducts.get('w1', fullProducts: false).first).single.id, 'wp1');
    expect(await api.userProducts.getPlaceholder('u1', 'd1').first, '<p>Soon</p>');
    expect(backend.callsTo('user-products.getPlaceholder').single, <Object?>['u1', 'd1']);
  });
}
