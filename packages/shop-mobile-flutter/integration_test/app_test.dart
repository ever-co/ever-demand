// End-to-end flows of the shop app on a device (or the flutter tester), with
// the in-memory backend of test/helpers: first run with the fake invite code,
// product feed, buy, delivery tracking, card payment, cancel, history.
//
//   flutter test integration_test/app_test.dart              (device / emulator)
//   flutter test integration_test/app_test.dart -d flutter-tester   (headless)
import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:material_ui/material_ui.dart';

import '../test/helpers/fixtures.dart';
import '../test/helpers/test_env.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('first run → buy → pay with a new card → cancel → history', (WidgetTester tester) async {
    final StreamController<Object?> order = StreamController<Object?>.broadcast();
    addTearDown(order.close);
    final TestEnv env = TestEnv(startupDone: false);
    env.serverDefaults(invites: true, registrationRequired: true);
    env.pyro
      ..onCall('user-auth.register', (_) => userJson(id: 'u1'))
      ..onValue('user.get', userJson())
      ..onCall('warehouse-orders.create', (_) => orderJson(id: 'o1'))
      ..onObserve('order.get', (_) => order.stream)
      ..onValue('warehouse.get', warehouseJson())
      ..onCall('user.getCards', (_) => <Object?>[])
      ..onCall('order.getStripeCurrency', (_) => 'usd')
      ..onCall('user.updateEmail', (_) => userJson(email: 'e2e@ever.co'))
      ..onCall('user.addPaymentMethod', (_) => 'card_1')
      ..onCall('order.payWithStripe', (_) => orderJson(id: 'o1', isPaid: true))
      ..onCall('order.confirm', (_) => orderJson(id: 'o1', isPaid: true))
      ..onCall('warehouse-orders.cancel', (_) => orderJson(id: 'o1', isPaid: true, isCancelled: true))
      ..onCall('order.refundWithStripe', (_) => orderJson(id: 'o1'));
    env.gql
      ..on('GenerateOrdersByCustomerId', (_) => <String, dynamic>{'generateOrdersByCustomerId': null})
      ..on('GetCountOfGeoLocationProducts', (_) => <String, dynamic>{'getCountOfGeoLocationProducts': 2})
      ..on('GeoLocationProductsByPaging', (_) => <String, dynamic>{
            'geoLocationProductsByPaging': <Map<String, dynamic>>[
              productInfoJson(),
              productInfoJson(id: 'wp2', productId: 'p2', title: 'Tomato soup', price: 6),
            ],
          })
      ..on('GetOrder', (_) => <String, dynamic>{'getOrder': <String, dynamic>{'status': 0, 'totalPrice': 10}})
      ..on('OrdersHistoryPageQuery', (_) => <String, dynamic>{
            'getOrders': <Object?>[orderJson(id: 'o1', isCancelled: true, status: 200)],
          });

    await env.pumpApp(tester, location: '/startup');
    expect(find.byKey(const Key('invite-by-code-screen')), findsOneWidget);

    await tester.enterText(find.byKey(const Key('invite-code-input')), '8321');
    await settle(tester);
    expect(find.byKey(const Key('products-screen')), findsOneWidget);
    expect(find.text('Spiced pasta'), findsOneWidget);

    await tapKey(tester, 'buy-wp1');
    order.add(orderJson(id: 'o1'));
    await settle(tester);
    expect(find.byKey(const Key('delivery-order-screen')), findsOneWidget);

    await tapKey(tester, 'pay-new-card');
    await tester.enterText(find.byKey(const Key('card-email')), 'e2e@ever.co');
    await tester.tap(find.byKey(const Key('fake-card-field')));
    await tester.pump();
    await tapKey(tester, 'card-pay');
    expect(env.pyro.callsTo('order.payWithStripe').single, <Object?>['o1', 'card_1', 'USD']);
    order.add(orderJson(id: 'o1', isPaid: true));
    await settle(tester);
    expect(find.text('Paid'), findsOneWidget);

    await tapKey(tester, 'order-undo');
    await tapKey(tester, 'cancel-order-yes');
    expect(env.pyro.callsTo('order.refundWithStripe').single, <Object?>['o1']);
    expect(find.byKey(const Key('products-screen')), findsOneWidget);

    await tester.tap(find.byTooltip('Open navigation menu'));
    await settle(tester);
    await tapKey(tester, 'menu-orders-history');
    expect(find.byKey(const Key('order-card-o1')), findsOneWidget);
  });
}
