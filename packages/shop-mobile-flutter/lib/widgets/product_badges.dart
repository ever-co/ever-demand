import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:material_ui/material_ui.dart';

import '../core/l10n.dart';
import '../core/theme.dart';
import '../data/models/product.dart';

/// `e-cu-discount`: `-N%` when the price is below the initial price.
class DiscountBadge extends StatelessWidget {
  const DiscountBadge(this.product, {super.key});

  final WarehouseProduct product;

  @override
  Widget build(BuildContext context) {
    final int discount = product.discountPercent;
    if (discount == 0) return const SizedBox.shrink();
    return Container(
      key: const Key('discount-badge'),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: EverColors.secondary,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        '-$discount%',
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
    );
  }
}

/// Text of the delivery info badge (`e-cu-delivery-info`): delivery
/// "min-max min" (product times, else the configured defaults); takeaway
/// "instant" (bolt only) when `deliveryTimeMax` is null or ≤ 15, otherwise
/// "Ready for N min".
String deliveryInfoText(
  AppLocalizations l10n,
  WarehouseProduct product, {
  required bool isDelivery,
  required int defaultMin,
  required int defaultMax,
}) {
  if (isDelivery) {
    final int min = product.deliveryTimeMin ?? defaultMin;
    final int max = product.deliveryTimeMax ?? defaultMax;
    return '$min-$max ${l10n.productsViewMinutes}';
  }
  final int? max = product.deliveryTimeMax;
  if (max == null || max <= 15) return '';
  return '${l10n.productsViewReadyfor} $max ${l10n.productsViewMinutes}';
}

class DeliveryInfoBadge extends StatelessWidget {
  const DeliveryInfoBadge(
    this.product, {
    super.key,
    required this.isDelivery,
    required this.defaultMin,
    required this.defaultMax,
    this.light = true,
  });

  final WarehouseProduct product;
  final bool isDelivery;
  final int defaultMin;
  final int defaultMax;
  final bool light;

  @override
  Widget build(BuildContext context) {
    final Color color = light ? Colors.white : EverColors.primary;
    final String text = deliveryInfoText(
      context.l10n,
      product,
      isDelivery: isDelivery,
      defaultMin: defaultMin,
      defaultMax: defaultMax,
    );
    return Container(
      key: const Key('delivery-info-badge'),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: light ? Colors.black54 : Colors.transparent,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          FaIcon(
            isDelivery ? FontAwesomeIcons.motorcycle : FontAwesomeIcons.bolt,
            size: 14,
            color: color,
          ),
          if (text.isNotEmpty) ...<Widget>[
            const SizedBox(width: 6),
            Text(text, style: TextStyle(color: color, fontSize: 12)),
          ],
        ],
      ),
    );
  }
}
