import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

import '../../core/formatting.dart';
import '../../data/models/enums.dart';
import '../../data/models/order.dart';
import '../../data/models/warehouse.dart';
import '../../data/store/app_store.dart';
import '../../providers.dart';
import '../../services/order_flow_service.dart';
import '../../widgets/order_dialogs.dart';

/// Shared behaviour of the delivery and takeaway tracking views: the live
/// order, `isPaymentEnabled`, the elapsed-time start, the issue modal (once),
/// Undo, End.
mixin OrderTrackingMixin<T extends ConsumerStatefulWidget> on ConsumerState<T> {
  bool _issueShown = false;
  DeliveryStep? _lastStep;

  /// Leaves the tracking view (page: go to the products; popup: close).
  void leaveTracking();

  AppStore get store => ref.read(appStoreProvider);
  OrderFlowService get flow => ref.read(orderFlowServiceProvider);

  void initTracking() {
    store.startOrderDate ??= DateTime.now();
  }

  /// The live order of `_orderId` (null while loading or without an order).
  AsyncValue<Order?> watchOrder() {
    final String? orderId = store.orderId;
    if (orderId == null) return const AsyncValue<Order?>.data(null);
    final AsyncValue<Order?> order = ref.watch(liveOrderProvider(orderId));
    final Order? value = order.value;
    if (value != null) _onOrder(value);
    return order;
  }

  /// `warehouse.get(_currOrderWarehouseId).isPaymentEnabled`.
  bool watchPaymentsEnabled() {
    final String? warehouseId = store.orderWarehouseId;
    if (warehouseId == null) return false;
    final Warehouse? w = ref.watch(liveWarehouseProvider(warehouseId)).value;
    return w?.isPaymentEnabled ?? false;
  }

  void _onOrder(Order order) {
    final DeliveryStep step = order.deliveryStep;
    // Freeze the elapsed time when the customer step ends.
    if (_lastStep == DeliveryStep.customer &&
        step != DeliveryStep.customer &&
        store.endOrderTime == null) {
      final DateTime start = store.startOrderDate ?? DateTime.now();
      final String frozen = formatElapsed(DateTime.now().difference(start));
      scheduleMicrotask(() => store.endOrderTime = frozen);
    }
    _lastStep = step;
    if (order.hasIssues && !_issueShown) {
      _issueShown = true;
      WidgetsBinding.instance.addPostFrameCallback((_) => _showIssue(order));
    }
  }

  Future<void> _showIssue(Order order) async {
    if (!mounted) return;
    await showOrderIssueDialog(
      context,
      duringDelivery: order.issuesDuringDelivery,
      duringProcessing: order.issuesDuringWarehouseProcessing,
    );
    try {
      await flow.closeWithIssue(order);
    } on Object catch (e) {
      debugPrint('Could not cancel the order with an issue: $e');
      store.clearOrder();
    }
    if (mounted) leaveTracking();
  }

  /// Undo / Cancel: confirm, then cancel (and refund when paid).
  Future<void> undo() async {
    if (!await showCancelOrderDialog(context)) return;
    try {
      await flow.cancelOpenOrder();
    } on Object catch (e) {
      debugPrint('Could not cancel the order: $e');
      return;
    }
    if (mounted) leaveTracking();
  }

  /// End ("Bon appetit!") / OK / Got it.
  void end() {
    flow.completeOrder();
    leaveTracking();
  }

  Future<void> viewProducts(Order order) =>
      showOrderInfoModal(context, order);
}
