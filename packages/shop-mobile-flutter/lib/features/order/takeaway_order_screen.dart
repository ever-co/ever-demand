import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../config/app_config.dart';
import '../../core/formatting.dart';
import '../../core/l10n.dart';
import '../../core/product_locale.dart';
import '../../core/theme.dart';
import '../../data/models/enums.dart';
import '../../data/models/geo.dart';
import '../../data/models/order.dart';
import '../../data/models/warehouse.dart';
import '../../providers.dart';
import '../../widgets/app_drawer.dart';
import '../../widgets/common.dart';
import 'order_tracking.dart';
import 'order_widgets.dart';
import 'payment_buttons.dart';

/// Takeaway order tracking page (`/order-info-takeaway`).
class TakeawayOrderScreen extends StatelessWidget {
  const TakeawayOrderScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        key: const Key('takeaway-order-screen'),
        backgroundColor: EverColors.brandDark,
        drawer: const AppDrawer(),
        appBar: AppBar(
          title: Text(context.l10n.orderInfo),
          actions: <Widget>[
            BackTextButton(onPressed: () => context.go('/products')),
          ],
        ),
        body: TakeawayOrderView(onLeave: () => context.go('/products')),
      );
}

/// "street house, [postcode, ] country" of the merchant (store info).
String storeFullAddress(Warehouse w) {
  final GeoLocation? g = w.geoLocation;
  if (g == null) return '';
  final String postcode =
      (g.postcode?.isNotEmpty ?? false) ? '${g.postcode}, ' : '';
  return '${g.city}, ${g.streetAddress} ${g.house}, $postcode${g.resolvedCountryName ?? ''}';
}

/// Takeaway tracking content (page and `OrderTakeawayInfoPopup`): store
/// info with the order code first, then the products view after "I'm here".
class TakeawayOrderView extends ConsumerStatefulWidget {
  const TakeawayOrderView({super.key, required this.onLeave});

  final VoidCallback onLeave;

  @override
  ConsumerState<TakeawayOrderView> createState() => _TakeawayOrderViewState();
}

class _TakeawayOrderViewState extends ConsumerState<TakeawayOrderView>
    with OrderTrackingMixin<TakeawayOrderView> {
  bool _productsInfo = false;

  @override
  void initState() {
    super.initState();
    initTracking();
  }

  @override
  void leaveTracking() => widget.onLeave();

  Future<void> _call(String phone) async {
    final bool ok = await ref.read(phoneDialerProvider).call(phone);
    if (!ok) debugPrint('Call Was Unsuccessful!');
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    final AppConfig config = ref.watch(appConfigProvider);
    final String language = ref.watch(languageProvider);
    final AsyncValue<Order?> live = watchOrder();
    final bool paymentsEnabled = watchPaymentsEnabled();
    final Order? order = live.value;
    if (order == null) return const LoadingView(color: Colors.white);
    final bool canPay = paymentsEnabled && !order.isPaid;
    final bool inStore = store.inStore != null;
    final Warehouse? warehouse = order.warehouse;
    final String? phone = warehouse?.contactPhone;
    const TextStyle white = TextStyle(color: Colors.white);

    final List<Widget> children = <Widget>[
      if (order.isPaid)
        Container(
          key: const Key('takeaway-paid'),
          color: EverColors.success,
          padding: const EdgeInsets.all(12),
          child: Text(
            '${l10n.buyPopupOrderPaid}${formatPrice(order.totalPrice)}!',
            textAlign: TextAlign.center,
            style: white,
          ),
        ),
    ];

    if (!_productsInfo) {
      children.addAll(<Widget>[
        Container(
          color: EverColors.secondary,
          padding: const EdgeInsets.all(16),
          child: Column(
            children: <Widget>[
              Text(
                l10n.buyPopupStatusesTakeawayTitle,
                key: const Key('order-status-title'),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                l10n.buyPopupStatusesTakeawayDetails(
                  order.deliveryTimeRange(
                    defaultMin: config.deliveryTimeMin,
                    defaultMax: config.deliveryTimeMax,
                  ),
                ),
                textAlign: TextAlign.center,
                style: white,
              ),
              if (!order.isPaid)
                Text(
                  l10n.buyPopupStatusesTakeawayNotPaidNote(
                    '${order.totalPrice.toStringAsFixed(2)}\$',
                  ),
                  textAlign: TextAlign.center,
                  style: white,
                ),
              TextButton(
                key: const Key('view-order-products'),
                style: TextButton.styleFrom(foregroundColor: Colors.white),
                onPressed: () => viewProducts(order),
                child: Text(
                  l10n.buyPopupViewOrderProducts,
                  style: const TextStyle(decoration: TextDecoration.underline),
                ),
              ),
            ],
          ),
        ),
        if (!inStore)
          OrderMap(
            user: order.user?.geoLocation?.loc,
            warehouse: warehouse?.geoLocation?.loc,
          ),
        if (warehouse != null && warehouse.logo.isNotEmpty)
          Padding(
            padding: const EdgeInsets.all(12),
            child: Center(child: WarehouseLogo(warehouse.logo, size: 72, light: true)),
          ),
        Container(
          color: EverColors.brandLight,
          padding: const EdgeInsets.all(16),
          child: Column(
            children: <Widget>[
              ElapsedTime(frozen: order.hasIssues),
              const SizedBox(height: 12),
              Text(
                l10n.storeInfo,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              Text(warehouse?.name ?? '', key: const Key('store-name'), style: white),
              if (!inStore && warehouse != null)
                Text(
                  storeFullAddress(warehouse),
                  key: const Key('store-address'),
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white70),
                ),
              if (phone != null && phone.isNotEmpty)
                TextButton.icon(
                  key: const Key('store-call'),
                  style: TextButton.styleFrom(foregroundColor: Colors.white),
                  onPressed: () => unawaited(_call(phone)),
                  icon: const FaIcon(FontAwesomeIcons.phone, size: 14),
                  label: Text(phone),
                ),
              const SizedBox(height: 12),
              OrderCode(order: order),
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
                    const SizedBox(width: 8),
                    Expanded(
                      child: FilledButton(
                        key: const Key('takeaway-im-here'),
                        style: FilledButton.styleFrom(backgroundColor: EverColors.success),
                        onPressed: inStore
                            ? end
                            : () => setState(() => _productsInfo = true),
                        child: Text(
                          inStore ? l10n.buyPopupButtonsGotIt : l10n.buyPopupButtonsImHere,
                        ),
                      ),
                    ),
                    if (canPay) ...<Widget>[
                      const SizedBox(width: 8),
                      Expanded(flex: 2, child: PaymentButtons(order: order)),
                    ],
                  ],
                ),
              if (order.isCompleted && !order.hasIssues)
                FilledButton(
                  key: const Key('order-end'),
                  onPressed: end,
                  child: Text(l10n.buyPopupButtonsEnd),
                ),
            ],
          ),
        ),
      ]);
    } else {
      final OrderProduct? first = order.products.isEmpty ? null : order.products.first;
      final bool ready =
          order.warehouseStatus >= OrderWarehouseStatus.packagingFinished;
      children.addAll(<Widget>[
        if (first != null)
          AspectRatio(
            key: const Key('takeaway-products-image'),
            aspectRatio: 16 / 10,
            child: AppImage(productImageUrl(first.product, language)),
          ),
        Container(
          color: EverColors.brandLight,
          padding: const EdgeInsets.all(16),
          child: Column(
            children: <Widget>[
              OrderCode(
                order: order,
                title: first == null ? null : localeValue(first.product.title, language),
              ),
              const SizedBox(height: 16),
              Row(
                children: <Widget>[
                  Expanded(
                    child: OutlinedButton(
                      key: const Key('order-cancel'),
                      style: OutlinedButton.styleFrom(foregroundColor: Colors.white),
                      onPressed: undo,
                      child: Text(l10n.buyPopupButtonsCancel),
                    ),
                  ),
                  if (ready) ...<Widget>[
                    const SizedBox(width: 8),
                    Expanded(
                      child: FilledButton(
                        key: const Key('takeaway-got-it'),
                        style: FilledButton.styleFrom(backgroundColor: EverColors.success),
                        onPressed: end,
                        child: Text(l10n.buyPopupButtonsGotIt),
                      ),
                    ),
                  ],
                  if (canPay) ...<Widget>[
                    const SizedBox(width: 8),
                    Expanded(flex: 2, child: PaymentButtons(order: order)),
                  ],
                ],
              ),
            ],
          ),
        ),
      ]);
    }

    return ListView(key: const Key('takeaway-order-view'), children: children);
  }
}
