import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

import '../../core/l10n.dart';
import '../../core/theme.dart';
import '../../providers.dart';
import 'delivery_order_screen.dart';
import 'takeaway_order_screen.dart';

/// `ORDER_INFO_TYPE=popup`: the tracking view as a modal over the feed
/// (`OrderPage` for delivery, `OrderTakeawayInfoPopup` for takeaway). The ×
/// closes it and keeps the order; End / cancel / issue close it too.
Future<void> showOrderPopup(BuildContext context) => showDialog<void>(
      context: context,
      useSafeArea: false,
      builder: (BuildContext context) => const _OrderPopup(),
    );

class _OrderPopup extends ConsumerWidget {
  const _OrderPopup();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bool delivery = ref.read(appStoreProvider).isDelivery;
    void close() => Navigator.of(context).pop();
    return Dialog.fullscreen(
      key: const Key('order-popup'),
      backgroundColor: EverColors.brandDark,
      child: Scaffold(
        backgroundColor: EverColors.brandDark,
        appBar: AppBar(
          automaticallyImplyLeading: false,
          title: Text(context.l10n.orderInfo),
          actions: <Widget>[
            IconButton(
              key: const Key('order-popup-close'),
              icon: const Icon(Icons.close),
              onPressed: close,
            ),
          ],
        ),
        body: delivery
            ? DeliveryOrderView(onLeave: close)
            : TakeawayOrderView(onLeave: close),
      ),
    );
  }
}
