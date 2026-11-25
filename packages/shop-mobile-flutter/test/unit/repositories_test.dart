import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:shop_flutter_mobile/data/models/geo.dart';
import 'package:shop_flutter_mobile/data/models/order.dart';
import 'package:shop_flutter_mobile/data/models/product.dart';
import 'package:shop_flutter_mobile/data/models/warehouse.dart';
import 'package:shop_flutter_mobile/data/network/graphql/documents.dart';
import 'package:shop_flutter_mobile/data/network/graphql/graphql_service.dart';
import 'package:shop_flutter_mobile/data/network/pyro/pyro_router.dart';
import 'package:shop_flutter_mobile/data/repositories/merchants_repository.dart';
import 'package:shop_flutter_mobile/data/repositories/orders_repository.dart';
import 'package:shop_flutter_mobile/data/repositories/products_repository.dart';
import 'package:shop_flutter_mobile/data/repositories/shop_api.dart';

import '../helpers/fixtures.dart';

class MockGraphQL extends Mock implements GraphQLService {}

class MockPyroClient extends Mock implements PyroClient {}

class MockPyroRouter extends Mock implements PyroRouter {}

void main() {
  late MockGraphQL gql;
  late MockPyroClient client;
  late MockPyroRouter router;
  late ShopApi api;
  const Loc sofia = Loc(lng: 23.3, lat: 42.6);

  setUp(() {
    gql = MockGraphQL();
    client = MockPyroClient();
    router = MockPyroRouter();
    when(() => client.router(any())).thenReturn(router);
    api = ShopApi(client);
  });

  void answer(String document, Map<String, dynamic> data) {
    when(() => gql.query(document, variables: any(named: 'variables')))
        .thenAnswer((_) async => data);
  }

  Map<String, dynamic> lastVariables(String document) =>
      verify(() => gql.query(document, variables: captureAny(named: 'variables')))
          .captured
          .last as Map<String, dynamic>;

  group('ProductsRepository', () {
    test('paging sends the Ionic variables and drops unavailable / null rows', () async {
      answer(geoLocationProductsByPagingQuery, <String, dynamic>{
        'geoLocationProductsByPaging': <Object?>[
          productInfoJson(id: 'a'),
          null,
          productInfoJson(id: 'b', available: false),
        ],
      });
      final List<ProductInfo> rows = await ProductsRepository(gql, api).geoLocationProductsByPaging(
        sofia,
        skip: 10,
        limit: 10,
        options: const ProductsQueryOptions(isDeliveryRequired: true, isTakeaway: false, withoutCount: true),
        searchText: 'pizza',
      );
      expect(rows.map((ProductInfo p) => p.warehouseProduct.id), <String>['a']);
      expect(lastVariables(geoLocationProductsByPagingQuery), <String, dynamic>{
        'geoLocation': <String, dynamic>{
          'loc': <String, dynamic>{'type': 'Point', 'coordinates': <double>[23.3, 42.6]},
        },
        'options': <String, dynamic>{'isDeliveryRequired': true, 'isTakeaway': false, 'withoutCount': true},
        'pagingOptions': <String, int>{'skip': 10, 'limit': 10},
        'searchText': 'pizza',
      });
    });

    test('count and single warehouse product', () async {
      answer(getCountOfGeoLocationProductsQuery, <String, dynamic>{'getCountOfGeoLocationProducts': 42});
      answer(getWarehouseProductQuery, <String, dynamic>{'getWarehouseProduct': null});
      final ProductsRepository repo = ProductsRepository(gql, api);
      expect(await repo.getCountOfGeoLocationProducts(sofia), 42);
      expect(await repo.getWarehouseProduct('w1', 'wp1'), isNull);
      expect(lastVariables(getWarehouseProductQuery), <String, dynamic>{
        'warehouseId': 'w1',
        'warehouseProductId': 'wp1',
      });
    });

    test('live warehouse products come from warehouse-products.get', () async {
      when(() => router.observe('get', <Object?>['w1', false]))
          .thenAnswer((_) => Stream<Object?>.value(<Object?>[warehouseProductJson(count: 0)]));
      final List<WarehouseProduct> live =
          await ProductsRepository(gql, api).watchWarehouseProducts('w1').first;
      expect(live.single.count, 0);
      verify(() => client.router('warehouse-products')).called(greaterThan(0));
    });
  });

  group('MerchantsRepository', () {
    test('close merchants and search by name', () async {
      answer(getCloseMerchantsQuery, <String, dynamic>{
        'getCloseMerchants': <Object?>[
          <String, dynamic>{'id': 'w1', 'name': 'Ever Pizza', 'logo': '', 'username': 'p'},
        ],
      });
      answer(getMerchantsBuyNameQuery, <String, dynamic>{
        'getMerchantsBuyName': <Object?>[
          <String, dynamic>{'id': 'w2', 'name': 'Sushi', 'logo': '', 'isActive': false},
        ],
      });
      final MerchantsRepository repo = MerchantsRepository(gql, api);
      expect((await repo.getCloseMerchants(sofia)).single.name, 'Ever Pizza');
      final Warehouse found = (await repo.getMerchantsByName('sus', sofia)).single;
      expect(found.isActive, isFalse);
      expect(lastVariables(getMerchantsBuyNameQuery)['searchName'], 'sus');
    });

    test('getWarehouse is the first value of warehouse.get', () async {
      when(() => router.observe('get', <Object?>['w1', true]))
          .thenAnswer((_) => Stream<Object?>.value(warehouseJson()));
      expect((await MerchantsRepository(gql, api).getWarehouse('w1'))?.isPaymentEnabled, isTrue);
    });
  });

  group('OrdersRepository', () {
    test('history and details over GraphQL', () async {
      answer(ordersHistoryQuery, <String, dynamic>{
        'getOrders': <Object?>[
          <String, dynamic>{'id': 'o1', 'status': 0, 'products': <Object?>[]},
        ],
      });
      answer(orderDetailsQuery, <String, dynamic>{
        'getOrder': <String, dynamic>{'id': 'o1', 'status': 2, 'products': <Object?>[]},
      });
      final OrdersRepository repo = OrdersRepository(gql, api);
      expect((await repo.ordersHistory('u1')).single.id, 'o1');
      expect(lastVariables(ordersHistoryQuery), <String, dynamic>{'userId': 'u1'});
      final Order? details = await repo.orderDetails('o1');
      expect(details?.status, 2);
    });

    test('GetOrder selections: status, waitForCompletion, totalPrice', () async {
      answer(getOrderQuery('{status}'), <String, dynamic>{'getOrder': <String, dynamic>{'status': 1}});
      answer(getOrderQuery('{waitForCompletion}'), <String, dynamic>{
        'getOrder': <String, dynamic>{'waitForCompletion': true},
      });
      answer(getOrderQuery('{totalPrice}'), <String, dynamic>{'getOrder': <String, dynamic>{'totalPrice': 23.5}});
      final OrdersRepository repo = OrdersRepository(gql, api);
      expect(await repo.orderStatus('o1'), 1);
      expect(await repo.orderWaitsForCompletion('o1'), isTrue);
      expect(await repo.orderTotalPrice('o1'), 23.5);
    });

    test('errors without data surface as GraphQLRequestError', () async {
      when(() => gql.query(any(), variables: any(named: 'variables')))
          .thenThrow(const GraphQLRequestError('boom'));
      await expectLater(OrdersRepository(gql, api).ordersHistory('u1'), throwsA(isA<GraphQLRequestError>()));
    });
  });
}
