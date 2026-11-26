import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:shop_flutter_mobile/data/models/enums.dart';

import '../helpers/fixtures.dart';
import '../helpers/test_env.dart';

/// Start-up, guards and the first-run flow through the real app.
void main() {
  void feed(TestEnv env) {
    env.gql
      ..on('GetCountOfGeoLocationProducts', (_) => <String, dynamic>{'getCountOfGeoLocationProducts': 1})
      ..on('GeoLocationProductsByPaging', (_) => <String, dynamic>{
            'geoLocationProductsByPaging': <Map<String, dynamic>>[productInfoJson()],
          });
  }

  testWidgets('boot: invite system on → invite by code; fake code → products → buy → order info',
      (WidgetTester tester) async {
    final TestEnv env = TestEnv(startupDone: false);
    env.serverDefaults(invites: true, registrationRequired: true);
    env.pyro
      ..onCall('user-auth.register', (_) => userJson(id: 'u1'))
      ..onValue('user.get', userJson())
      ..onCall('warehouse-orders.create', (_) => orderJson(id: 'o1'))
      ..onValue('order.get', orderJson(id: 'o1'))
      ..onValue('warehouse.get', warehouseJson())
      ..onCall('user.getCards', (_) => <Object?>[])
      ..onCall('order.getStripeCurrency', (_) => 'usd');
    env.gql.on('GenerateOrdersByCustomerId', (_) => <String, dynamic>{'generateOrdersByCustomerId': null});
    feed(env);

    await env.pumpApp(tester, location: '/startup');
    expect(find.byKey(const Key('invite-by-code-screen')), findsOneWidget);
    expect(env.store.deviceId, 'd1');
    expect(env.store.registrationSystem, RegistrationSystem.enabled);
    expect(find.text('Sign up by Address'), findsOneWidget);

    await tester.enterText(find.byKey(const Key('invite-code-input')), '8321');
    await settle(tester);
    expect(env.store.userId, 'u1');
    expect(find.byKey(const Key('products-screen')), findsOneWidget);
    expect(find.text('Spiced pasta'), findsOneWidget);

    await tapKey(tester, 'buy-wp1');
    expect(find.byKey(const Key('delivery-order-screen')), findsOneWidget);
    expect(find.text("We're preparing the order!"), findsOneWidget);
    expect(env.store.orderId, 'o1');
  });

  testWidgets('boot: invite system off → invite by location', (WidgetTester tester) async {
    final TestEnv env = TestEnv(startupDone: false);
    env.serverDefaults(invites: false, registrationRequired: true);
    env.pyro.onCall('geo-location.getAddressByCoordinatesUsingArcGIS', (_) => null);
    await env.pumpApp(tester, location: '/startup');
    expect(find.byKey(const Key('invite-by-location-screen')), findsOneWidget);
  });

  testWidgets('boot: registration not required → products straight away', (WidgetTester tester) async {
    final TestEnv env = TestEnv(startupDone: false);
    env.serverDefaults(invites: true, registrationRequired: false);
    feed(env);
    await env.pumpApp(tester, location: '/startup');
    expect(find.byKey(const Key('products-screen')), findsOneWidget);
  });

  testWidgets('boot: server unreachable → server down page', (WidgetTester tester) async {
    final TestEnv env = TestEnv(startupDone: false);
    env.httpClient = failingClient();
    await env.pumpApp(tester, location: '/startup');
    expect(find.byKey(const Key('server-down-screen')), findsOneWidget);
    expect(find.text('Server connection is lost'), findsOneWidget);
  });

  testWidgets('guards: logged-in customer at /invite goes to products', (WidgetTester tester) async {
    final TestEnv env = TestEnv();
    env.loggedIn();
    feed(env);
    await env.pumpApp(tester, location: '/invite');
    expect(find.byKey(const Key('products-screen')), findsOneWidget);
  });

  testWidgets('guards: orders history needs a logged-in customer', (WidgetTester tester) async {
    final TestEnv env = TestEnv();
    env.store
      ..registrationSystem = RegistrationSystem.enabled
      ..inviteSystem = true;
    await env.pumpApp(tester, location: '/orders-history');
    expect(find.byKey(const Key('invite-by-code-screen')), findsOneWidget);
  });

  testWidgets('guards: order info without an order goes to products',
      (WidgetTester tester) async {
    final TestEnv env = TestEnv();
    env.loggedIn();
    feed(env);
    await env.pumpApp(tester, location: '/order-info');
    expect(find.byKey(const Key('products-screen')), findsOneWidget);
  });

  testWidgets('guards: an unknown path goes home', (WidgetTester tester) async {
    final TestEnv env = TestEnv();
    env.loggedIn();
    feed(env);
    await env.pumpApp(tester, location: '/nope/nothing');
    expect(find.byKey(const Key('products-screen')), findsOneWidget);
  });
}
