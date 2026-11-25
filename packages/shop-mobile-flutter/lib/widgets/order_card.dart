import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/formatting.dart';
import '../core/l10n.dart';
import '../core/product_locale.dart';
import '../core/theme.dart';
import '../data/models/enums.dart';
import '../data/models/geo.dart';
import '../data/models/order.dart';
import '../data/models/product.dart';
import '../providers.dart';
import 'common.dart';

/// Order card of the history (`e-cu-order-card` + `e-cu-order`): at most 3
/// products unless [showAll], with "N more" linking to the details page.
class OrderCard extends ConsumerStatefulWidget {
  const OrderCard({super.key, required this.order, this.showAll = false});

  static const int notExpandedMaxProducts = 3;

  final Order order;
  final bool showAll;

  @override
  ConsumerState<OrderCard> createState() => _OrderCardState();
}

class _OrderCardState extends ConsumerState<OrderCard> {
  late Order _order = widget.order;
  final Set<String> _removed = <String>{};

  @override
  void didUpdateWidget(OrderCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.order != widget.order) _order = widget.order;
  }

  Future<void> _addComment(OrderProduct p, String comment) async {
    try {
      final Order updated = await ref
          .read(shopApiProvider)
          .order
          .addProductComment(_order.id, p.id, comment);
      if (mounted) setState(() => _order = updated);
    } on Object catch (e) {
      debugPrint('Could not save the comment: $e');
    }
  }

  Future<void> _remove(OrderProduct p) async {
    try {
      await ref
          .read(shopApiProvider)
          .order
          .removeProducts(_order.id, <String>[p.product.id]);
      if (mounted) setState(() => _removed.add(p.id.isEmpty ? p.product.id : p.id));
    } on Object catch (e) {
      debugPrint('Could not remove the product: $e');
    }
  }

  /// Tapping an order in progress opens its tracking page (page mode).
  void _openTracking() {
    if (!_order.inProcessing || ref.read(appConfigProvider).isPopupOrderInfo) {
      return;
    }
    final bool delivery = ref.read(appStoreProvider).isDelivery;
    context.go(delivery ? '/order-info' : '/order-info-takeaway');
  }

  String? _stateText(AppLocalizations l10n) {
    if (_order.inProcessing) return l10n.pending;
    if (_order.isTakeaway) return l10n.completed;
    final String? time = formatDeliveryTime(_order.createdAt, _order.deliveryTime);
    if (time != null) return time;
    if (_order.isCanceledStatus) return l10n.canceled;
    if (_order.isFailedStatus) return l10n.failed;
    return l10n.inDelivery;
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    final String language = ref.watch(languageProvider);
    final List<OrderProduct> all = _order.products;
    final List<OrderProduct> shown = widget.showAll
        ? all
        : all.take(OrderCard.notExpandedMaxProducts).toList();
    final int hidden = all.length - shown.length;
    final GeoLocation? geo = _order.user?.geoLocation;
    final String address =
        '${geo?.resolvedCountryName ?? ''} ${geo?.postcode ?? ''}, ${geo?.city ?? ''}';
    final DateTime? created = _order.createdAt?.toLocal();
    final double total = all.fold<double>(
      0,
      (double s, OrderProduct p) => _isRemoved(p) ? s : s + p.count * p.price,
    );
    final bool issue = _order.isCanceledStatus || _order.isFailedStatus;

    return Card(
      key: Key('order-card-${_order.id}'),
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Row(
              children: <Widget>[
                WarehouseLogo(_order.warehouse?.logo ?? ''),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text('${l10n.to}: $address'),
                      if (created != null)
                        Text(
                          _shortDate(context, created),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      Text(
                        _stateText(l10n) ?? '',
                        key: const Key('order-state'),
                        style: TextStyle(
                          color: issue ? EverColors.danger : EverColors.success,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  '\$${formatPrice(total)}',
                  key: const Key('order-total'),
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
            const Divider(),
            InkWell(
              onTap: _openTracking,
              child: Column(
                children: <Widget>[
                  for (final OrderProduct p in shown)
                    _OrderProductRow(
                      product: p,
                      language: language,
                      inProcessing: _order.inProcessing,
                      removed: _isRemoved(p),
                      onComment: p.id.isEmpty ? null : (String c) => _addComment(p, c),
                      onRemove: p.product.id.isEmpty ? null : () => _remove(p),
                    ),
                ],
              ),
            ),
            if (hidden > 0)
              TextButton.icon(
                key: const Key('order-more'),
                onPressed: () => context.go('/orders-history/${_order.id}'),
                icon: const Icon(Icons.keyboard_arrow_down),
                label: Text('$hidden ${l10n.more}'),
              ),
          ],
        ),
      ),
    );
  }

  /// Angular `date: 'short'`: date and time in the app language.
  static String _shortDate(BuildContext context, DateTime d) {
    final MaterialLocalizations m = MaterialLocalizations.of(context);
    return '${m.formatShortDate(d)} ${m.formatTimeOfDay(TimeOfDay.fromDateTime(d))}';
  }

  bool _isRemoved(OrderProduct p) =>
      _removed.contains(p.id.isEmpty ? p.product.id : p.id);
}

class _OrderProductRow extends StatefulWidget {
  const _OrderProductRow({
    required this.product,
    required this.language,
    required this.inProcessing,
    required this.removed,
    required this.onComment,
    required this.onRemove,
  });

  final OrderProduct product;
  final String language;
  final bool inProcessing;
  final bool removed;
  final ValueChanged<String>? onComment;
  final VoidCallback? onRemove;

  @override
  State<_OrderProductRow> createState() => _OrderProductRowState();
}

class _OrderProductRowState extends State<_OrderProductRow> {
  bool _editing = false;
  late final TextEditingController _comment =
      TextEditingController(text: widget.product.comment ?? '');

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    final OrderProduct p = widget.product;
    final ProductImage? image = _image(p.product, widget.language);
    final double price = widget.removed ? 0 : p.count * p.price;
    final double size = switch (image?.orientation) {
      ImageOrientation.vertical => 90,
      ImageOrientation.horizontal => 60,
      _ => 70,
    };
    return Opacity(
      opacity: widget.removed ? 0.4 : 1,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: AppImage(image?.url ?? '', width: 70, height: size),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      Flexible(
                        child: Text(
                          localeValue(p.product.title, widget.language),
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 8),
                      CircleAvatar(
                        radius: 10,
                        child: Text('${p.count}', style: const TextStyle(fontSize: 11)),
                      ),
                    ],
                  ),
                  Text(
                    shorten(localeValue(p.product.description, widget.language), 53),
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  if (widget.inProcessing && widget.onComment != null)
                    _editing
                        ? TextField(
                            key: const Key('order-product-comment-field'),
                            controller: _comment,
                            decoration: InputDecoration(hintText: l10n.comment),
                            onSubmitted: (String v) {
                              setState(() => _editing = false);
                              widget.onComment!(v);
                            },
                          )
                        : TextButton(
                            key: const Key('order-product-comment'),
                            onPressed: () => setState(() => _editing = true),
                            child: Text(
                              (p.comment?.isNotEmpty ?? false) ? p.comment! : l10n.comment,
                            ),
                          ),
                ],
              ),
            ),
            Column(
              children: <Widget>[
                Text('\$${formatPrice(price)}'),
                if (widget.inProcessing && widget.onRemove != null && !widget.removed)
                  IconButton(
                    key: const Key('order-product-remove'),
                    tooltip: l10n.remove,
                    icon: const Icon(Icons.delete_outline),
                    onPressed: widget.onRemove,
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  static ProductImage? _image(Product product, String language) {
    if (product.images.isEmpty) return null;
    for (final ProductImage i in product.images) {
      if (i.locale.startsWith(language)) return i;
    }
    for (final ProductImage i in product.images) {
      if (i.locale.startsWith('en-US')) return i;
    }
    return product.images.first;
  }
}
