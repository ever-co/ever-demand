import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:shop_flutter_mobile/config/app_config.dart';

import '../helpers/fake_graphql.dart';
import '../helpers/fixtures.dart';
import '../helpers/test_env.dart';

void main() {
  late TestEnv env;

  void feed(List<Map<String, dynamic>> rows) {
    env.gql
      ..on('GetCountOfGeoLocationProducts', (_) => <String, dynamic>{
            'getCountOfGeoLocationProducts': rows.length,
          })
      ..on('GeoLocationProductsByPaging', (_) => <String, dynamic>{
            'geoLocationProductsByPaging': rows,
          });
  }

  setUp(() {
    env = TestEnv();
    env.loggedIn();
    env.pyro
      ..onValue('user-products.getPlaceholder', '<p>We are coming to your area soon</p>')
      ..onValue('warehouse.get', warehouseJson())
      ..onCall('user.getCards', (_) => <Object?>[])
      ..onCall('order.getStripeCurrency', (_) => 'usd');
  });

  testWidgets('slides view: product card, discount, buy label, details', (WidgetTester tester) async {
    feed(<Map<String, dynamic>>[productInfoJson()]);
    await env.pumpApp(tester);
    expect(find.byKey(const Key('products-slides')), findsOneWidget);
    expect(find.text('Spiced pasta'), findsOneWidget);
    expect(find.text('Hot and fresh'), findsOneWidget);
    expect(find.text('Buy for 10\$'), findsOneWidget);
    expect(find.text('-16%'), findsOneWidget);
    expect(find.text('Details'), findsOneWidget);
    expect(find.text('30-60 min'), findsOneWidget);
  });

  testWidgets('list view (PRODUCTS_VIEW_TYPE=list) uses image orientation 0', (WidgetTester tester) async {
    env.config = const AppConfig(productsViewType: 'list', mapsEnabled: false);
    feed(<Map<String, dynamic>>[productInfoJson(), productInfoJson(id: 'wp2', productId: 'p2', title: 'Soup')]);
    await env.pumpApp(tester);
    expect(find.byKey(const Key('products-list')), findsOneWidget);
    expect(find.text('Soup'), findsOneWidget);
    final GqlRequest page = env.gql.requests('GeoLocationProductsByPaging').first;
    expect((page.variables['options'] as Map<String, dynamic>)['imageOrientation'], 0);
  });

  testWidgets('empty feed shows the placeholder HTML', (WidgetTester tester) async {
    feed(<Map<String, dynamic>>[]);
    await env.pumpApp(tester);
    expect(find.byKey(const Key('products-empty')), findsOneWidget);
    expect(find.textContaining('We are coming to your area soon', findRichText: true), findsOneWidget);
  });

  testWidgets('buy → delivery order page; the header then shows the order sign', (WidgetTester tester) async {
    feed(<Map<String, dynamic>>[productInfoJson()]);
    env.pyro
      ..onCall('warehouse-orders.create', (_) => orderJson(id: 'o1'))
      ..onValue('order.get', orderJson(id: 'o1'));
    env.gql.on('GetOrder', (_) => <String, dynamic>{
          'getOrder': <String, dynamic>{'totalPrice': 10, 'status': 0},
        });
    await env.pumpApp(tester);
    await tapKey(tester, 'buy-wp1');
    expect(find.byKey(const Key('delivery-order-screen')), findsOneWidget);
    await tester.tap(find.text('Back'));
    await settle(tester);
    expect(find.byKey(const Key('products-screen')), findsOneWidget);
    expect(find.byKey(const Key('order-sign')), findsOneWidget);
    expect(find.text('10\$'), findsOneWidget);
    expect(find.byKey(const Key('delivery-toggle')), findsNothing);
  });

  testWidgets('a failed buy marks the product not available', (WidgetTester tester) async {
    feed(<Map<String, dynamic>>[productInfoJson()]);
    env.pyro.onCall('warehouse-orders.create', (_) => throw StateError('sold out'));
    await env.pumpApp(tester);
    await tapKey(tester, 'buy-wp1');
    expect(find.text('Product not available'), findsOneWidget);
  });

  testWidgets('takeaway toggle reloads with takeaway options', (WidgetTester tester) async {
    feed(<Map<String, dynamic>>[productInfoJson()]);
    await env.pumpApp(tester);
    await tapKey(tester, 'delivery-toggle');
    final Map<String, dynamic> options =
        env.gql.requests('GeoLocationProductsByPaging').last.variables['options'] as Map<String, dynamic>;
    expect(options['isTakeaway'], isTrue);
    expect(find.text('Takeout'), findsOneWidget);
  });

  testWidgets('store sign opens the merchants page', (WidgetTester tester) async {
    feed(<Map<String, dynamic>>[productInfoJson()]);
    env.gql.on('getCloseMerchants', (_) => <String, dynamic>{'getCloseMerchants': <Object?>[]});
    await env.pumpApp(tester);
    await tapKey(tester, 'store-sign');
    expect(find.byKey(const Key('merchants-screen')), findsOneWidget);
  });

  testWidgets('search: merchants and products by name, open/closed, details', (WidgetTester tester) async {
    feed(<Map<String, dynamic>>[productInfoJson()]);
    env.gql
      ..on('GetMerchantsBuyName', (Map<String, dynamic> v) => <String, dynamic>{
            'getMerchantsBuyName': <Object?>[
              <String, dynamic>{'id': 'w1', 'name': 'Ever Pizza', 'logo': '', 'isActive': true},
              <String, dynamic>{'id': 'w2', 'name': 'Night Sushi', 'logo': '', 'isActive': false},
            ],
          })
      ..on('GetWarehouseProduct', (_) => <String, dynamic>{'getWarehouseProduct': warehouseProductJson()});
    env.pyro.onValue('warehouse-products.get', <Object?>[warehouseProductJson()]);
    await env.pumpApp(tester);
    await tapKey(tester, 'products-search');
    expect(find.byKey(const Key('search-products')), findsOneWidget);
    await tester.enterText(find.byKey(const Key('search-input')), 'pi');
    await settle(tester);
    expect(find.text('Open'), findsOneWidget);
    expect(find.text('Closed'), findsOneWidget);
    expect(env.gql.requests('GetMerchantsBuyName').last.variables['searchName'], 'pi');
    expect(env.gql.requests('GeoLocationProductsByPaging').last.variables['searchText'], 'pi');
    await tapKey(tester, 'search-product-wp1');
    expect(find.byKey(const Key('product-details-screen')), findsOneWidget);
  });

  testWidgets('product details: title, includes, live sold out, buy', (WidgetTester tester) async {
    env.pyro
      ..onValue('warehouse-products.get', <Object?>[warehouseProductJson(count: 3)])
      ..onCall('warehouse-orders.create', (_) => orderJson(id: 'o2'))
      ..onValue('order.get', orderJson(id: 'o2'));
    await env.pumpApp(tester, location: '/products/product-details/p1?backUrl=%2Fproducts&warehouseId=w1');
    expect(find.byKey(const Key('product-details-screen')), findsOneWidget);
    expect(find.byKey(const Key('product-details-title')), findsOneWidget);
    expect(find.text('Includes'), findsOneWidget);
    expect(find.text('Pasta, chili'), findsOneWidget);
    await tapKey(tester, 'product-details-buy');
    final Map<Object?, Object?> input =
        env.pyro.callsTo('warehouse-orders.create').single.single! as Map<Object?, Object?>;
    expect(input['warehouseId'], 'w1');
    expect(input.containsKey('waitForCompletion'), isFalse);
    expect(find.byKey(const Key('delivery-order-screen')), findsOneWidget);
  });

  testWidgets('product details: sold out disables buy', (WidgetTester tester) async {
    env.pyro.onValue('warehouse-products.get', <Object?>[warehouseProductJson(count: 0)]);
    await env.pumpApp(tester, location: '/products/product-details/p1?warehouseId=w1');
    expect(find.text('Product not available'), findsOneWidget);
    final FilledButton buy = tester.widget(find.byKey(const Key('product-details-buy')));
    expect(buy.onPressed, isNull);
  });

  testWidgets('browse first: buy before registering goes to the invite', (WidgetTester tester) async {
    env.store
      ..userId = null
      ..registrationSystem = 'disabled'
      ..inviteSystem = true;
    feed(<Map<String, dynamic>>[productInfoJson()]);
    await env.pumpApp(tester);
    await tapKey(tester, 'buy-wp1');
    expect(find.byKey(const Key('invite-by-code-screen')), findsOneWidget);
    expect(env.store.buyProduct, 'wp1');
  });
}
