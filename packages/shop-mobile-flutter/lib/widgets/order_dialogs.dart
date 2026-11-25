import 'package:material_ui/material_ui.dart';

import '../core/l10n.dart';
import '../core/theme.dart';
import '../data/models/order.dart';
import 'order_card.dart';

/// `CallPage`: "We Apologise! Call Was Unsuccessful!".
Future<void> showCallFailedDialog(BuildContext context) => showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        final AppLocalizations l10n = context.l10n;
        return AlertDialog(
          key: const Key('call-failed-dialog'),
          title: Text(l10n.sideMenuGroupsInfoCallWeAppologise),
          content: Text(l10n.sideMenuGroupsInfoCallCallUnsuccessfull),
          actions: <Widget>[
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(l10n.ok),
            ),
          ],
        );
      },
    );

/// `CancelPage` ("Undo"): true when the customer confirmed (Yes).
Future<bool> showCancelOrderDialog(BuildContext context) async {
  final bool? yes = await showDialog<bool>(
    context: context,
    builder: (BuildContext context) {
      final AppLocalizations l10n = context.l10n;
      return AlertDialog(
        key: const Key('cancel-order-dialog'),
        title: Text(l10n.buyPopupUndoPopupTitle),
        content: Text.rich(
          TextSpan(
            children: <InlineSpan>[
              TextSpan(text: '${l10n.buyPopupUndoPopupDetails0} '),
              TextSpan(
                text: l10n.buyPopupUndoPopupDetails1,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: EverColors.secondary,
                ),
              ),
              TextSpan(text: ' ${l10n.buyPopupUndoPopupDetails2}'),
            ],
          ),
        ),
        actions: <Widget>[
          TextButton(
            key: const Key('cancel-order-no'),
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l10n.no),
          ),
          FilledButton(
            key: const Key('cancel-order-yes'),
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(l10n.yes),
          ),
        ],
      );
    },
  );
  return yes ?? false;
}

/// `IssuePage`: the delivery / processing went wrong. Resolves when the
/// customer taps OK (the caller then cancels and refunds).
Future<void> showOrderIssueDialog(
  BuildContext context, {
  required bool duringDelivery,
  required bool duringProcessing,
}) =>
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        final AppLocalizations l10n = context.l10n;
        return AlertDialog(
          key: const Key('order-issue-dialog'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              if (duringDelivery) ...<Widget>[
                Text(
                  l10n.buyPopupDeliveryWrongDeliveryWrong,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                Text(l10n.buyPopupDeliveryWrongTryAgain),
                // "Call for details" has no action in the Ionic app either.
                Text(
                  l10n.buyPopupDeliveryWrongCallForDetails,
                  style: const TextStyle(decoration: TextDecoration.underline),
                ),
              ],
              if (duringProcessing) ...<Widget>[
                Text(
                  l10n.buyPopupDeliveryWrongProcessingWrong,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                Text(l10n.buyPopupDeliveryWrongTryAgain),
              ],
            ],
          ),
          actions: <Widget>[
            FilledButton(
              key: const Key('order-issue-ok'),
              onPressed: () => Navigator.of(context).pop(),
              child: Text(l10n.ok),
            ),
          ],
        );
      },
    );

/// What the order info modal returns.
enum OrderInfoModalResult { closed, confirm, addMore }

/// `OrderInfoModalComponent`: the full order card; with [cart] it shows the
/// shopping cart "Confirm" and "Add More" buttons.
Future<OrderInfoModalResult> showOrderInfoModal(
  BuildContext context,
  Order order, {
  bool cart = false,
}) async {
  final OrderInfoModalResult? result =
      await showModalBottomSheet<OrderInfoModalResult>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (BuildContext context) {
      final AppLocalizations l10n = context.l10n;
      return DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.8,
        builder: (BuildContext context, ScrollController controller) => Column(
          key: const Key('order-info-modal'),
          children: <Widget>[
            AppBar(
              automaticallyImplyLeading: false,
              title: Text(l10n.orderInfoModalTitle),
              actions: <Widget>[
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () =>
                      Navigator.of(context).pop(OrderInfoModalResult.closed),
                ),
              ],
            ),
            Expanded(
              child: ListView(
                controller: controller,
                children: <Widget>[OrderCard(order: order, showAll: true)],
              ),
            ),
            if (cart)
              Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: <Widget>[
                    Expanded(
                      child: OutlinedButton(
                        key: const Key('cart-add-more'),
                        onPressed: () => Navigator.of(context)
                            .pop(OrderInfoModalResult.addMore),
                        child: Text(l10n.orderInfoModalAddMore),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(
                        key: const Key('cart-confirm'),
                        onPressed: () => Navigator.of(context)
                            .pop(OrderInfoModalResult.confirm),
                        child: Text(l10n.orderInfoModalConfirm),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      );
    },
  );
  return result ?? OrderInfoModalResult.closed;
}
