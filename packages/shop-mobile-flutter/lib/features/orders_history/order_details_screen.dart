import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../core/l10n.dart';
import '../../data/models/order.dart';
import '../../providers.dart';
import '../../widgets/common.dart';
import '../../widgets/order_card.dart';

/// `OrderDetailsPageQuery`.
final orderDetailsProvider =
    FutureProvider.autoDispose.family<Order?, String>((Ref ref, String id) =>
        ref.watch(ordersRepositoryProvider).orderDetails(id));

/// Order details (`/orders-history/:id`): the order card with all products.
class OrderDetailsScreen extends ConsumerWidget {
  const OrderDetailsScreen({super.key, required this.orderId});

  final String orderId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AppLocalizations l10n = context.l10n;
    final AsyncValue<Order?> order = ref.watch(orderDetailsProvider(orderId));
    return Scaffold(
      key: const Key('order-details-screen'),
      appBar: AppBar(
        title: Text(l10n.orderHistoryViewTitle),
        actions: <Widget>[
          BackTextButton(onPressed: () => context.go('/orders-history')),
        ],
      ),
      body: order.when(
        loading: () => const LoadingView(),
        error: (Object e, _) => Center(child: Text('$e')),
        data: (Order? o) => o == null
            ? Center(child: Text(l10n.notFound))
            : ListView(children: <Widget>[OrderCard(order: o, showAll: true)]),
      ),
    );
  }
}
