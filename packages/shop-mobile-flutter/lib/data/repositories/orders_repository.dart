import '../models/json.dart';
import '../models/order.dart';
import '../network/graphql/documents.dart';
import '../network/graphql/graphql_service.dart';
import 'shop_api.dart';

/// Order reads over GraphQL plus the order RPCs of [ShopApi].
class OrdersRepository {
  OrdersRepository(this._gql, this.api);

  final GraphQLService _gql;
  final ShopApi api;

  /// `OrdersHistoryPageQuery`.
  Future<List<Order>> ordersHistory(String userId) async {
    final Json data = await _gql.query(
      ordersHistoryQuery,
      variables: <String, dynamic>{'userId': userId},
    );
    return asJsonList(data['getOrders']).map(Order.fromJson).toList();
  }

  /// `OrderDetailsPageQuery`.
  Future<Order?> orderDetails(String id) async {
    final Json data = await _gql.query(
      orderDetailsQuery,
      variables: <String, dynamic>{'id': id},
    );
    final Json? raw = asJsonOrNull(data['getOrder']);
    return raw == null ? null : Order.fromJson(raw);
  }

  /// `GetOrder { status }`.
  Future<int?> orderStatus(String id) async {
    final Json data = await _gql.query(
      getOrderQuery('{status}'),
      variables: <String, dynamic>{'id': id},
    );
    final Object? status = asJson(data['getOrder'])['status'];
    return status is num ? status.toInt() : null;
  }

  /// `GetOrder { waitForCompletion }`.
  Future<bool> orderWaitsForCompletion(String id) async {
    final Json data = await _gql.query(
      getOrderQuery('{waitForCompletion}'),
      variables: <String, dynamic>{'id': id},
    );
    return asJson(data['getOrder'])['waitForCompletion'] == true;
  }

  /// `GenerateOrdersByCustomerId` (seeds demo orders for the fake invite).
  Future<void> generateOrdersByCustomerId(
    int numberOfOrders,
    String customerId,
  ) async {
    await _gql.query(
      generateOrdersByCustomerIdQuery,
      variables: <String, dynamic>{
        'numberOfOrders': numberOfOrders,
        'customerId': customerId,
      },
    );
  }

  /// Live order with warehouse and carrier populated.
  Stream<Order?> watchOrder(String orderId) => api.order.get(orderId);
}
