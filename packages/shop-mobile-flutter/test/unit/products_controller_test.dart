import 'dart:async';

import 'package:fake_async/fake_async.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shop_flutter_mobile/config/app_config.dart';
import 'package:shop_flutter_mobile/data/models/enums.dart';
import 'package:shop_flutter_mobile/data/models/product.dart';
import 'package:shop_flutter_mobile/features/products/products_controller.dart';
import 'package:shop_flutter_mobile/providers.dart';

import '../helpers/fake_graphql.dart';
import '../helpers/fixtures.dart';
import '../helpers/test_env.dart';

void main() {
  late TestEnv env;
  late ProviderContainer c;
  late List<FeedNavigation> navigations;

  ProductsController feed() => ProductsController(
        config: env.config,
        store: env.store,
        api: env.api,
        products: c.read(productsRepositoryProvider),
        merchants: c.read(merchantsRepositoryProvider),
        location: c.read(locationRepositoryProvider),
        orderFlow: c.read(orderFlowServiceProvider),
      )..onNavigate = navigations.add;

  /// [total] products in the feed, served 10 at a time.
  void serveProducts(int total, {int Function(int index)? count}) {
    env.gql
      ..on('GetCountOfGeoLocationProducts', (_) => <String, dynamic>{
            'getCountOfGeoLocationProducts': total,
          })
      ..on('GeoLocationProductsByPaging', (Map<String, dynamic> v) {
        final Map<String, dynamic> paging = v['pagingOptions'] as Map<String, dynamic>;
        final int skip = paging['skip'] as int;
        final int limit = paging['limit'] as int;
        return <String, dynamic>{
          'geoLocationProductsByPaging': <Map<String, dynamic>>[
            for (int i = skip; i < (skip + limit).clamp(0, total); i++)
              productInfoJson(id: 'wp$i', productId: 'p$i', count: count?.call(i) ?? 5),
          ],
        };
      });
  }

  setUp(() {
    env = TestEnv();
    env.loggedIn();
    env.pyro.onValue('user-products.getPlaceholder', '<p>Nothing here yet</p>');
    navigations = <FeedNavigation>[];
    c = env.container();
    addTearDown(() => c.dispose());
  });

  test('first page: count, then 10 from skip 0 with the Ionic options', () async {
    serveProducts(25);
    final ProductsController f = feed();
    await f.init();
    expect(f.productsCount, 25);
    expect(f.allProducts, hasLength(10));
    expect(f.placeholder, '<p>Nothing here yet</p>');
    final GqlRequest page = env.gql.requests('GeoLocationProductsByPaging').single;
    expect(page.variables['geoLocation'], <String, dynamic>{
      'loc': <String, dynamic>{
        'type': 'Point',
        'coordinates': <double>[23.3332736, 42.6459136],
      },
    });
    expect(page.variables['pagingOptions'], <String, int>{'skip': 0, 'limit': 10});
    expect(page.variables['options'], <String, dynamic>{
      'isDeliveryRequired': true,
      'isTakeaway': false,
      'merchantIds': <String>[],
      'imageOrientation': 1,
      'locale': 'en-US',
      'withoutCount': true,
    });
    await f.loadProducts();
    expect(f.allProducts, hasLength(20));
    expect(env.gql.requests('GeoLocationProductsByPaging').last.variables['pagingOptions'], <String, int>{
      'skip': 10,
      'limit': 10,
    });
    f.dispose();
  });

  test('rows not available are dropped; count 0 rows are hidden', () async {
    env.gql
      ..on('GetCountOfGeoLocationProducts', (_) => <String, dynamic>{'getCountOfGeoLocationProducts': 3})
      ..on('GeoLocationProductsByPaging', (_) => <String, dynamic>{
            'geoLocationProductsByPaging': <Map<String, dynamic>?>[
              productInfoJson(id: 'a'),
              productInfoJson(id: 'b', available: false),
              productInfoJson(id: 'c', count: 0),
            ],
          });
    final ProductsController f = feed();
    await f.init();
    expect(f.allProducts.map((ProductInfo p) => p.warehouseProduct.id), <String>['a', 'c']);
    expect(f.visibleProducts.map((ProductInfo p) => p.warehouseProduct.id), <String>['a']);
    f.dispose();
  });

  test('the 2 s poll only updates sold-out flags of shown rows', () {
    fakeAsync((FakeAsync async) {
      int polls = 0;
      env.gql
        ..on('GetCountOfGeoLocationProducts', (_) => <String, dynamic>{'getCountOfGeoLocationProducts': 2})
        ..on('GeoLocationProductsByPaging', (_) {
          polls++;
          return <String, dynamic>{
            'geoLocationProductsByPaging': <Map<String, dynamic>>[
              productInfoJson(id: 'a', count: polls > 1 ? 0 : 3),
              productInfoJson(id: 'b'),
              if (polls > 1) productInfoJson(id: 'new'),
            ],
          };
        });
      final ProductsController f = feed();
      unawaited(f.init());
      async.flushMicrotasks();
      expect(f.allProducts.first.soldOut, isFalse);
      async.elapse(const Duration(seconds: 2));
      expect(f.allProducts, hasLength(2));
      expect(f.allProducts.first.soldOut, isTrue);
      expect(f.allProducts[1].soldOut, isFalse);
      f.dispose();
      async.elapse(const Duration(seconds: 4));
      expect(polls, 2);
    });
  });

  test('delivery toggle reloads from scratch as takeaway', () async {
    serveProducts(12);
    final ProductsController f = feed();
    await f.init();
    await f.loadProducts();
    expect(f.allProducts, hasLength(12));
    await f.setDeliveryRequired(false);
    expect(env.store.deliveryType, DeliveryType.takeaway);
    expect(f.allProducts, hasLength(10));
    final Map<String, dynamic> options =
        env.gql.requests('GeoLocationProductsByPaging').last.variables['options'] as Map<String, dynamic>;
    expect(options['isTakeaway'], isTrue);
    expect(options['isDeliveryRequired'], isFalse);
    f.dispose();
  });

  test('in store: takeaway, feed limited to the merchant, merchant loaded', () async {
    env.store.inStore = 'w7';
    env.pyro.onValue('warehouse.get', warehouseJson(id: 'w7', name: 'Corner Shop'));
    serveProducts(1);
    final ProductsController f = feed();
    await f.init();
    await pumpEventQueue();
    expect(env.store.deliveryType, DeliveryType.takeaway);
    expect(f.merchant?.name, 'Corner Shop');
    final Map<String, dynamic> options =
        env.gql.requests('GeoLocationProductsByPaging').single.variables['options'] as Map<String, dynamic>;
    expect(options['merchantIds'], <String>['w7']);
    expect(f.navigateToMerchants, isFalse);
    await f.changeStoreMode();
    expect(env.store.inStore, isNull);
    f.dispose();
  });

  test('MERCHANT_IDS: the store sign toggles the first merchant', () async {
    env.config = const AppConfig(merchantIds: <String>['m1', 'm2'], mapsEnabled: false);
    c.dispose();
    c = env.container();
    env.pyro.onValue('warehouse.get', warehouseJson(id: 'm1'));
    serveProducts(1);
    final ProductsController f = feed();
    await f.init();
    expect(f.navigateToMerchants, isFalse);
    await f.changeStoreMode();
    expect(env.store.inStore, 'm1');
    final Map<String, dynamic> options =
        env.gql.requests('GeoLocationProductsByPaging').last.variables['options'] as Map<String, dynamic>;
    expect(options['merchantIds'], <String>['m1', 'm2']);
    f.dispose();
  });

  test('buy creates the order and asks for the order info; failure marks sold out', () async {
    serveProducts(1);
    env.pyro.onCall('warehouse-orders.create', (_) => orderJson(id: 'o5'));
    final ProductsController f = feed();
    await f.init();
    await f.buy(f.visibleProducts.single);
    expect(navigations.single, isA<FeedShowOrderInfo>());
    expect(env.store.orderId, 'o5');

    env.store.orderId = null;
    env.pyro.onCall('warehouse-orders.create', (_) => throw StateError('sold out'));
    await f.buy(f.visibleProducts.single);
    expect(f.allProducts.single.soldOut, isTrue);
    f.dispose();
  });

  test('details: product gone → sold out; found → product details URL', () async {
    serveProducts(1);
    env.gql.on('GetWarehouseProduct', (_) => <String, dynamic>{'getWarehouseProduct': null});
    final ProductsController f = feed();
    await f.init();
    await f.openDetails(f.visibleProducts.single);
    expect(f.allProducts.single.soldOut, isTrue);
    env.gql.on('GetWarehouseProduct', (_) => <String, dynamic>{'getWarehouseProduct': warehouseProductJson()});
    await f.openDetails(f.allProducts.single);
    expect(
      (navigations.last as FeedGoTo).location,
      '/products/product-details/p0?backUrl=%2Fproducts&warehouseId=w1',
    );
    f.dispose();
  });

  test('resumes a buy started before registration', () async {
    env.store
      ..buyProduct = 'wp1'
      ..warehouseId = 'w1';
    serveProducts(0);
    env.gql.on('GetWarehouseProduct', (_) => <String, dynamic>{'getWarehouseProduct': warehouseProductJson()});
    env.pyro.onCall('warehouse-orders.create', (_) => orderJson(id: 'o8'));
    final ProductsController f = feed();
    await f.init();
    expect(env.store.orderId, 'o8');
    expect(env.store.buyProduct, isNull);
    expect(env.store.warehouseId, isNull);
    expect(navigations.single, isA<FeedShowOrderInfo>());
    f.dispose();
  });

  test('no location: registration "once" and back to the invite', () async {
    env.config = const AppConfig(defaultLatitude: null, defaultLongitude: null, mapsEnabled: false);
    env.locator.position = null;
    env.httpClient = MockClient((_) async => http.Response('', 204));
    c.dispose();
    c = env.container();
    final ProductsController f = feed();
    await f.init();
    expect(env.store.registrationSystem, RegistrationSystem.once);
    expect((navigations.single as FeedGoTo).location, '/invite');
    f.dispose();
  });
}
