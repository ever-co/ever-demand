import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:material_ui/material_ui.dart';
import 'package:shop_flutter_mobile/config/app_config.dart';

import '../helpers/fixtures.dart';
import '../helpers/test_env.dart';

void main() {
  late TestEnv env;

  void emptyFeed() {
    env.gql
      ..on('GetCountOfGeoLocationProducts', (_) => <String, dynamic>{'getCountOfGeoLocationProducts': 0})
      ..on('GeoLocationProductsByPaging', (_) => <String, dynamic>{'geoLocationProductsByPaging': <Object?>[]});
  }

  Map<String, dynamic> historyOrder(String id, {int products = 1, int status = 2, String? deliveryTime}) =>
      <String, dynamic>{
        'id': id,
        'createdAt': '2026-11-20T10:00:00.000Z',
        'deliveryTime': deliveryTime,
        'warehouseId': 'w1',
        'status': status,
        'user': <String, dynamic>{
          'id': 'u1',
          'geoLocation': <String, dynamic>{'countryName': 'Bulgaria', 'countryId': 21, 'postcode': '1700', 'city': 'Sofia'},
        },
        'warehouse': <String, dynamic>{'id': 'w1', 'logo': ''},
        'products': <Map<String, dynamic>>[
          for (int i = 0; i < products; i++)
            <String, dynamic>{
              'count': 2,
              'price': 5,
              'isTakeaway': false,
              'product': <String, dynamic>{
                'images': <Object?>[],
                'title': <Map<String, dynamic>>[member('Item $i')],
                'description': <Map<String, dynamic>>[member('Desc $i')],
              },
            },
        ],
      };

  setUp(() {
    env = TestEnv();
    env.loggedIn();
    env.pyro.onValue('user-products.getPlaceholder', '');
    emptyFeed();
  });

  group('orders history', () {
    testWidgets('cards with at most 3 products and "N more" → details', (WidgetTester tester) async {
      env.gql
        ..on('OrdersHistoryPageQuery', (Map<String, dynamic> v) => <String, dynamic>{
              'getOrders': <Object?>[
                historyOrder('o1', products: 5, deliveryTime: '2026-11-20T10:25:07.000Z'),
                historyOrder('o2', status: 200),
              ],
            })
        ..on('OrderDetailsPageQuery', (_) => <String, dynamic>{'getOrder': historyOrder('o1', products: 5)});
      await env.pumpApp(tester, location: '/orders-history');
      expect(find.byKey(const Key('orders-history-screen')), findsOneWidget);
      expect(env.gql.requests('OrdersHistoryPageQuery').single.variables, <String, dynamic>{'userId': 'u1'});
      expect(find.text('To: Bulgaria 1700, Sofia'), findsNWidgets(2));
      expect(find.text('Item 2'), findsOneWidget);
      expect(find.text('Item 3'), findsNothing);
      expect(find.text('2 more'), findsOneWidget);
      expect(find.text('25:07 min'), findsOneWidget);
      expect(find.text('Canceled'), findsOneWidget);
      expect(find.text(r'$50'), findsOneWidget);
      await tapKey(tester, 'order-more');
      expect(find.byKey(const Key('order-details-screen')), findsOneWidget);
      expect(find.text('Item 4'), findsOneWidget);
    });

    testWidgets('empty history → "No orders yet" and To Products', (WidgetTester tester) async {
      env.gql.on('OrdersHistoryPageQuery', (_) => <String, dynamic>{'getOrders': <Object?>[]});
      await env.pumpApp(tester, location: '/orders-history');
      expect(find.text('No orders yet'), findsOneWidget);
      await tapKey(tester, 'orders-history-to-products');
      expect(find.byKey(const Key('products-screen')), findsOneWidget);
    });

    testWidgets('an order in progress shows Pending and lets the customer comment / remove',
        (WidgetTester tester) async {
      final Map<String, dynamic> pending = orderJson(status: 0);
      env.gql.on('OrdersHistoryPageQuery', (_) => <String, dynamic>{'getOrders': <Object?>[pending]});
      env.pyro
        ..onCall('order.addProductComment', (_) => orderJson(
              status: 0,
              products: <Map<String, dynamic>>[orderProductJson(comment: 'no onions')],
            ))
        ..onCall('order.removeProducts', (_) => orderJson(status: 0));
      await env.pumpApp(tester, location: '/orders-history');
      expect(find.text('Pending'), findsOneWidget);
      await tapKey(tester, 'order-product-comment');
      await tester.enterText(find.byKey(const Key('order-product-comment-field')), 'no onions');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await settle(tester);
      expect(env.pyro.callsTo('order.addProductComment').single, <Object?>['o1', 'op1', 'no onions']);
      await tapKey(tester, 'order-product-remove');
      expect(env.pyro.callsTo('order.removeProducts').single, <Object?>[
        'o1',
        <String>['p1'],
      ]);
    });
  });

  group('merchants', () {
    setUp(() {
      env.gql
        ..on('getCloseMerchants', (_) => <String, dynamic>{
              'getCloseMerchants': <Object?>[
                <String, dynamic>{'id': 'w1', 'name': 'Ever Pizza', 'logo': '', 'username': 'p'},
              ],
            })
        ..on('GetMerchantsBuyName', (Map<String, dynamic> v) => <String, dynamic>{
              'getMerchantsBuyName': v['searchName'] == 'zzz'
                  ? <Object?>[]
                  : <Object?>[
                      <String, dynamic>{'id': 'w2', 'name': 'Sushi Bar', 'logo': '', 'isActive': true},
                    ],
            });
    });

    testWidgets('close to you, search by name, not found', (WidgetTester tester) async {
      await env.pumpApp(tester, location: '/merchants');
      expect(find.text('Merchants close to you'), findsOneWidget);
      expect(find.text('Ever Pizza'), findsOneWidget);
      await tester.enterText(find.byKey(const Key('merchants-search')), 'sus');
      await settle(tester);
      expect(find.text("Merchants with name 'sus'"), findsOneWidget);
      expect(find.text('Sushi Bar'), findsOneWidget);
      await tester.enterText(find.byKey(const Key('merchants-search')), 'zzz');
      await settle(tester);
      expect(find.byKey(const Key('merchants-not-found')), findsOneWidget);
    });

    testWidgets('selecting a merchant enters its store', (WidgetTester tester) async {
      env.pyro.onValue('warehouse.get', warehouseJson(name: 'Ever Pizza'));
      await env.pumpApp(tester, location: '/merchants');
      await tapKey(tester, 'merchant-w1');
      expect(env.store.inStore, 'w1');
      expect(find.byKey(const Key('products-screen')), findsOneWidget);
      expect(find.text('Ever Pizza Products'), findsOneWidget);
      expect(find.text('Exit Store'), findsOneWidget);
    });

    testWidgets('scan: the scanned merchant id fills the search', (WidgetTester tester) async {
      env.scannedCodes.add('w2');
      env.pyro.onValue('warehouse.get', warehouseJson(id: 'w2', name: 'Sushi Bar'));
      await env.pumpApp(tester, location: '/merchants');
      await tapKey(tester, 'merchants-scan');
      expect(env.pyro.callsTo('warehouse.get').last, <Object?>['w2', true]);
      expect(find.text("Merchants with name 'Sushi Bar'"), findsOneWidget);
    });
  });

  group('language', () {
    testWidgets('choosing Bulgarian switches the app language and goes back', (WidgetTester tester) async {
      await env.pumpApp(tester, location: '/language');
      expect(find.text('Select Language'), findsOneWidget);
      await tapKey(tester, 'language-bg-BG');
      expect(env.store.language, 'bg-BG');
      expect(find.byKey(const Key('products-screen')), findsOneWidget);
    });

    testWidgets('Hebrew is right to left', (WidgetTester tester) async {
      env.store.language = 'he-IL';
      await env.pumpApp(tester, location: '/language');
      final BuildContext context = tester.element(find.byKey(const Key('language-screen')));
      expect(Directionality.of(context), TextDirection.rtl);
    });
  });

  group('info pages', () {
    for (final (String path, String method, String title) page in <(String, String, String)>[
      ('about', 'getAboutUs', 'About Us'),
      ('help', 'getHelp', 'Help'),
      ('privacy', 'getPrivacy', 'Privacy'),
      ('terms-of-use', 'getTermsOfUse', 'Terms of Use'),
    ]) {
      testWidgets('/info/${page.$1} shows user.${page.$2} HTML', (WidgetTester tester) async {
        env.store.language = 'en-US';
        env.pyro.onValue('user.${page.$2}', '<h2>${page.$3} text</h2>');
        await env.pumpApp(tester, location: '/info/${page.$1}');
        expect(find.text(page.$3), findsOneWidget);
        expect(find.textContaining('${page.$3} text', findRichText: true), findsOneWidget);
        expect(env.pyro.callsTo('user.${page.$2}').single, <Object?>['u1', 'd1', 'en-US']);
      });
    }
  });

  group('connection and maintenance', () {
    testWidgets('network lost → connection lost page; back online → previous page', (WidgetTester tester) async {
      await env.pumpApp(tester);
      env.connectivity.controller.add(false);
      await settle(tester);
      expect(find.byKey(const Key('connection-lost-screen')), findsOneWidget);
      expect(find.text('No connection to Ever'), findsOneWidget);
      env.connectivity.controller.add(true);
      await settle(tester);
      expect(find.byKey(const Key('connection-lost-screen')), findsNothing);
      expect(find.byKey(const Key('products-screen')), findsOneWidget);
    });

    testWidgets('server down: re-checks every 5 s, then goes home', (WidgetTester tester) async {
      env.store.serverConnection = 0;
      env.serverDefaults(invites: true);
      await env.pumpApp(tester);
      expect(find.byKey(const Key('server-down-screen')), findsOneWidget);
      await tester.pump(const Duration(seconds: 5));
      await settle(tester);
      expect(env.store.serverConnection, isNull);
      expect(find.byKey(const Key('products-screen')), findsOneWidget);
    });

    testWidgets('maintenance page shows the message until the window ends', (WidgetTester tester) async {
      bool on = true;
      env.config = const AppConfig(settingsMaintenanceApiUrl: 'http://m/status', mapsEnabled: false);
      env.httpClient = MockClient((http.Request r) async => r.url.host == 'm'
          ? http.Response(
              '{"maintenance":[{"type":"api","status":$on,"message":"<p>Upgrading</p>"},'
              '{"type":"shop-mobile","status":$on,"message":"<p>Upgrading</p>"}]}',
              200,
            )
          : http.Response('ok', 200));
      env.store.maintenanceMode = 'api';
      env.serverDefaults();
      await env.pumpApp(tester);
      expect(find.byKey(const Key('maintenance-screen')), findsOneWidget);
      expect(find.textContaining('Upgrading', findRichText: true), findsOneWidget);
      on = false;
      await tester.pump(const Duration(seconds: 5));
      await settle(tester);
      expect(env.store.maintenanceMode, isNull);
      expect(find.byKey(const Key('products-screen')), findsOneWidget);
    });
  });

  group('side menu', () {
    Future<void> openMenu(WidgetTester tester) async {
      await tester.tap(find.byTooltip('Open navigation menu'));
      await settle(tester);
      expect(find.byKey(const Key('app-drawer')), findsOneWidget);
    }

    testWidgets('items navigate', (WidgetTester tester) async {
      env.gql.on('OrdersHistoryPageQuery', (_) => <String, dynamic>{'getOrders': <Object?>[]});
      await env.pumpApp(tester);
      await openMenu(tester);
      expect(find.text('Products'), findsOneWidget);
      expect(find.text('Settings'), findsOneWidget);
      expect(find.text('LEGAL'), findsOneWidget);
      await tapKey(tester, 'menu-orders-history');
      expect(find.byKey(const Key('orders-history-screen')), findsOneWidget);
      await openMenu(tester);
      await tapKey(tester, 'menu-language');
      expect(find.byKey(const Key('language-screen')), findsOneWidget);
    });

    testWidgets('Call us dials SUPPORT_NUMBER; a failed call shows the apology', (WidgetTester tester) async {
      await env.pumpApp(tester);
      await openMenu(tester);
      await tapKey(tester, 'menu-call-us');
      expect(env.dialer.calls, <String>['0888888888']);
      env.dialer.succeed = false;
      await tapKey(tester, 'menu-call-us');
      expect(find.byKey(const Key('call-failed-dialog')), findsOneWidget);
      expect(find.text('Call Was Unsuccessful!'), findsOneWidget);
    });

    testWidgets('no SUPPORT_NUMBER hides Call us', (WidgetTester tester) async {
      env.config = const AppConfig(supportNumber: '', mapsEnabled: false);
      await env.pumpApp(tester);
      await openMenu(tester);
      expect(find.byKey(const Key('menu-call-us')), findsNothing);
    });
  });
}
