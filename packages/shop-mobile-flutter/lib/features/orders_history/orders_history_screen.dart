import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../core/l10n.dart';
import '../../core/theme.dart';
import '../../data/models/order.dart';
import '../../providers.dart';
import '../../widgets/app_drawer.dart';
import '../../widgets/common.dart';
import '../../widgets/order_card.dart';

/// `OrdersHistoryPageQuery` for the current customer.
final ordersHistoryProvider = FutureProvider.autoDispose<List<Order>>((Ref ref) {
  final String? userId = ref.watch(appStoreProvider).userId;
  if (userId == null) return Future<List<Order>>.value(const <Order>[]);
  return ref.watch(ordersRepositoryProvider).ordersHistory(userId);
});

/// Orders history (`/orders-history`).
class OrdersHistoryScreen extends ConsumerWidget {
  const OrdersHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AppLocalizations l10n = context.l10n;
    final AsyncValue<List<Order>> orders = ref.watch(ordersHistoryProvider);
    return Scaffold(
      key: const Key('orders-history-screen'),
      drawer: const AppDrawer(),
      appBar: AppBar(title: Text(l10n.orderHistoryViewTitle)),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(ordersHistoryProvider.future),
        child: orders.when(
          loading: () => const LoadingView(),
          error: (Object e, _) => _Empty(error: '$e'),
          data: (List<Order> list) => list.isEmpty
              ? const _Empty()
              : ListView.builder(
                  key: const Key('orders-history-list'),
                  itemCount: list.length,
                  itemBuilder: (_, int i) => OrderCard(order: list[i]),
                ),
        ),
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty({this.error});

  final String? error;

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    return ListView(
      key: const Key('orders-history-empty'),
      padding: const EdgeInsets.all(32),
      children: <Widget>[
        const Center(
          child: FaIcon(FontAwesomeIcons.bagShopping, size: 64, color: EverColors.medium),
        ),
        const SizedBox(height: 16),
        Text(
          l10n.lastPurchasesViewNothingOrdered,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.titleLarge,
        ),
        if (error != null)
          Text(error!, textAlign: TextAlign.center, style: const TextStyle(color: EverColors.danger)),
        const SizedBox(height: 16),
        Center(
          child: FilledButton(
            key: const Key('orders-history-to-products'),
            onPressed: () => context.go('/products'),
            child: Text(l10n.lastPurchasesViewToProducts),
          ),
        ),
      ],
    );
  }
}
