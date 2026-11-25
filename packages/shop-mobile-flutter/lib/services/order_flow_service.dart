import 'dart:async';

import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../data/models/enums.dart';
import '../data/models/order.dart';
import '../data/repositories/orders_repository.dart';
import '../data/repositories/shop_api.dart';
import '../data/store/app_store.dart';

/// Result of a Buy tap (docs/latest-stack/shop-mobile-features.md §4.5).
enum BuyOutcome {
  /// "Browse first" mode: registration needed first, go to `/invite`.
  needsRegistration,

  /// Shopping cart: the order waits for completion, show the cart modal.
  showCart,

  /// Show the order info (page or popup, delivery or takeaway).
  showOrderInfo,

  /// The order could not be created (sold out, merchant closed).
  soldOut,
}

/// Order life cycle: buy, add more, complete, cancel, issue close.
class OrderFlowService {
  OrderFlowService({
    required this.config,
    required this.store,
    required this.api,
    required this.orders,
  });

  final AppConfig config;
  final AppStore store;
  final ShopApi api;
  final OrdersRepository orders;

  /// Order tracking route for the current delivery type.
  String get orderInfoLocation =>
      store.isDelivery ? '/order-info' : '/order-info-takeaway';

  /// Buy one of a product.
  ///
  /// [warehouseProductId] is what the feed keeps in `_buyProduct`, the
  /// details page keeps the product id there and sets `_backToDetails`
  /// ([fromDetails]). Only the feed adds to an open order and sends
  /// `waitForCompletion`.
  Future<BuyOutcome> buy({
    required String warehouseId,
    required String productId,
    required String warehouseProductId,
    bool fromDetails = false,
  }) async {
    final String? userId = store.userId;
    if (userId == null &&
        store.registrationSystem == RegistrationSystem.disabled) {
      store
        ..registrationSystem = RegistrationSystem.once
        ..buyProduct = fromDetails ? productId : warehouseProductId
        ..warehouseId = warehouseId;
      if (fromDetails) store.backToDetails = productId;
      return BuyOutcome.needsRegistration;
    }
    if (userId == null) return BuyOutcome.needsRegistration;

    final List<OrderCreateProduct> products = <OrderCreateProduct>[
      (count: 1, productId: productId),
    ];
    try {
      final String? openOrderId = store.orderId;
      if (fromDetails || openOrderId == null) {
        final Order order = await api.warehouseOrders.create(
          warehouseId: warehouseId,
          products: products,
          userId: userId,
          orderType: store.deliveryType,
          waitForCompletion: fromDetails ? null : config.shoppingCart,
        );
        store
          ..orderId = order.id
          ..orderWarehouseId =
              order.warehouseId.isEmpty ? warehouseId : order.warehouseId;
      } else {
        await api.warehouseOrders.addMore(
          warehouseId: warehouseId,
          userId: userId,
          orderId: openOrderId,
          products: products,
        );
      }
    } on Object catch (e) {
      debugPrint('Buy failed: $e');
      return BuyOutcome.soldOut;
    }
    return await shouldShowCart() ? BuyOutcome.showCart : BuyOutcome.showOrderInfo;
  }

  /// `SHOPPING_CART` and `GetOrder {waitForCompletion}` is true.
  Future<bool> shouldShowCart() async {
    final String? orderId = store.orderId;
    if (!config.shoppingCart || orderId == null) return false;
    try {
      return await orders.orderWaitsForCompletion(orderId);
    } on Object {
      return false;
    }
  }

  /// Cart modal "Confirm" / "Add more": `warehouse-orders.userComplete`.
  Future<void> completeCart() async {
    final String? orderId = store.orderId;
    if (orderId == null) return;
    await api.warehouseOrders.userComplete(orderId);
  }

  /// The feed's merchant filter for an open order: only that order's
  /// merchant while it is not delivered; a finished order is cleared.
  Future<List<String>?> openOrderMerchantFilter() async {
    final String? orderId = store.orderId;
    final String? warehouseId = store.orderWarehouseId;
    if (orderId == null || warehouseId == null) return null;
    try {
      final int? status = await orders.orderStatus(orderId);
      if (status != null && status < OrderStatus.delivered) {
        return <String>[warehouseId];
      }
      store.clearOrder();
    } on Object catch (e) {
      debugPrint('Could not read the open order status: $e');
    }
    return null;
  }

  /// Undo / Cancel (`CancelPage` Yes): cancel, refund when paid, forget the
  /// order.
  Future<void> cancelOpenOrder() async {
    final String? orderId = store.orderId;
    if (orderId == null) return;
    final Order order = await api.warehouseOrders.cancel(orderId);
    store.clearOrderTimes();
    if (order.isPaid) await api.order.refundWithStripe(order.id);
    store.orderId = null;
  }

  /// Issue modal OK: cancel [order], refund when paid, forget the order.
  Future<void> closeWithIssue(Order order) async {
    await api.warehouseOrders.cancel(order.id);
    if (order.isPaid) await api.order.refundWithStripe(order.id);
    store.clearOrder();
  }

  /// End ("Bon appetit!") / takeaway "Got it!".
  void completeOrder() => store.clearOrder();
}
