import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../config/app_config.dart';
import '../../core/l10n.dart';
import '../../core/theme.dart';
import '../../data/models/enums.dart';
import '../../data/models/order.dart';
import '../../providers.dart';
import '../../widgets/app_drawer.dart';
import '../../widgets/common.dart';
import 'order_tracking.dart';
import 'order_widgets.dart';
import 'payment_buttons.dart';

/// Delivery order tracking page (`/order-info`).
class DeliveryOrderScreen extends StatelessWidget {
  const DeliveryOrderScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        key: const Key('delivery-order-screen'),
        backgroundColor: EverColors.brandDark,
        drawer: const AppDrawer(),
        appBar: AppBar(
          title: Text(context.l10n.orderInfo),
          actions: <Widget>[
            // Back keeps the order open (the feed shows the order sign).
            BackTextButton(onPressed: () => context.go('/products')),
          ],
        ),
        body: DeliveryOrderView(onLeave: () => context.go('/products')),
      );
}

/// The tracking content, shared by the page and the popup (`OrderPage`).
class DeliveryOrderView extends ConsumerStatefulWidget {
  const DeliveryOrderView({super.key, required this.onLeave});

  final VoidCallback onLeave;

  @override
  ConsumerState<DeliveryOrderView> createState() => _DeliveryOrderViewState();
}

class _DeliveryOrderViewState extends ConsumerState<DeliveryOrderView>
    with OrderTrackingMixin<DeliveryOrderView> {
  @override
  void initState() {
    super.initState();
    initTracking();
  }

  @override
  void leaveTracking() => widget.onLeave();

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    final AppConfig config = ref.watch(appConfigProvider);
    final AsyncValue<Order?> live = watchOrder();
    final bool paymentsEnabled = watchPaymentsEnabled();
    final Order? order = live.value;
    if (order == null) {
      return const LoadingView(color: Colors.white);
    }
    final DeliveryStep step = order.deliveryStep;
    final ({String title, String details, String notPaidNote}) texts =
        orderStatusTexts(
      l10n,
      step: step,
      cancelled: order.isCancelled,
      timeRange: order.deliveryTimeRange(
        defaultMin: config.deliveryTimeMin,
        defaultMax: config.deliveryTimeMax,
      ),
      amount: '${order.totalPrice.toStringAsFixed(2)}\$',
    );
    const TextStyle white = TextStyle(color: Colors.white);

    return ListView(
      key: const Key('delivery-order-view'),
      children: <Widget>[
        Container(
          color: EverColors.secondary,
          padding: const EdgeInsets.all(16),
          child: Column(
            children: <Widget>[
              Text(
                texts.title,
                key: const Key('order-status-title'),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(texts.details, textAlign: TextAlign.center, style: white),
              if (!order.isPaid && texts.notPaidNote.isNotEmpty)
                Text(
                  texts.notPaidNote,
                  key: const Key('order-not-paid-note'),
                  textAlign: TextAlign.center,
                  style: white,
                ),
              TextButton.icon(
                key: const Key('view-order-products'),
                style: TextButton.styleFrom(foregroundColor: Colors.white),
                onPressed: () => viewProducts(order),
                icon: const FaIcon(FontAwesomeIcons.basketShopping, size: 14),
                label: Text(
                  l10n.buyPopupViewOrderProducts,
                  style: const TextStyle(decoration: TextDecoration.underline),
                ),
              ),
            ],
          ),
        ),
        OrderMap(
          user: order.user?.geoLocation?.loc,
          warehouse: order.warehouse?.geoLocation?.loc,
          carrier: step == DeliveryStep.carrier
              ? order.carrier?.geoLocation?.loc
              : null,
        ),
        Container(
          color: EverColors.brandLight,
          padding: const EdgeInsets.all(16),
          child: Column(
            children: <Widget>[
              ElapsedTime(frozen: order.hasIssues),
              const SizedBox(height: 16),
              DeliverySteps(step: step, cancelled: order.isCancelled),
              const SizedBox(height: 16),
              if (!order.isCompleted)
                Row(
                  children: <Widget>[
                    Expanded(
                      child: OutlinedButton(
                        key: const Key('order-undo'),
                        style: OutlinedButton.styleFrom(foregroundColor: Colors.white),
                        onPressed: undo,
                        child: Text(l10n.buyPopupButtonsUndo),
                      ),
                    ),
                    if (paymentsEnabled) ...<Widget>[
                      const SizedBox(width: 8),
                      Expanded(flex: 3, child: PaymentButtons(order: order)),
                    ],
                  ],
                ),
              if (order.isCompleted && !order.hasIssues)
                FilledButton(
                  key: const Key('order-end'),
                  onPressed: end,
                  child: Text(order.isCancelled ? l10n.ok : l10n.buyPopupButtonsEnd),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
