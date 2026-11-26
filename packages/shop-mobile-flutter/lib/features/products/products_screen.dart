import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../config/app_config.dart';
import '../../core/formatting.dart';
import '../../core/l10n.dart';
import '../../core/theme.dart';
import '../../data/models/order.dart';
import '../../providers.dart';
import '../../routing/app_router.dart';
import '../../services/order_flow_service.dart';
import '../../widgets/app_drawer.dart';
import '../../widgets/common.dart';
import '../../widgets/order_dialogs.dart';
import '../order/order_popup.dart';
import 'product_views.dart';
import 'products_controller.dart';
import 'search_products_view.dart';

class ProductsScreen extends ConsumerStatefulWidget {
  const ProductsScreen({super.key});

  @override
  ConsumerState<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends ConsumerState<ProductsScreen> {
  late final ProductsController _feed = ProductsController(
    config: ref.read(appConfigProvider),
    store: ref.read(appStoreProvider),
    api: ref.read(shopApiProvider),
    products: ref.read(productsRepositoryProvider),
    merchants: ref.read(merchantsRepositoryProvider),
    location: ref.read(locationRepositoryProvider),
    orderFlow: ref.read(orderFlowServiceProvider),
  )..onNavigate = _onNavigate;

  @override
  void initState() {
    super.initState();
    unawaited(_feed.init().then((_) => _openPopupIfOrderOpen()));
  }

  @override
  void dispose() {
    _feed.dispose();
    super.dispose();
  }

  /// Popup mode opens the order modal on load when an order is open.
  Future<void> _openPopupIfOrderOpen() async {
    if (!mounted) return;
    if (ref.read(appConfigProvider).isPopupOrderInfo && _feed.hasPendingOrder) {
      await showOrderPopup(context);
      await _feed.refreshOpenOrderTotal();
    }
  }

  Future<void> _onNavigate(FeedNavigation navigation) async {
    if (!mounted) return;
    switch (navigation) {
      case FeedGoTo(:final String location):
        context.go(location);
      case FeedShowCart():
        await _showCart();
      case FeedShowOrderInfo():
        await _showOrderInfo();
    }
  }

  /// `showOrderInfo`: the cart modal while the order waits for completion,
  /// else the tracking popup or page.
  Future<void> _showOrderInfo() async {
    final OrderFlowService flow = ref.read(orderFlowServiceProvider);
    if (await flow.shouldShowCart()) {
      await _showCart();
      return;
    }
    if (!mounted) return;
    if (ref.read(appConfigProvider).isPopupOrderInfo) {
      await showOrderPopup(context);
      await _feed.refreshOpenOrderTotal();
    } else {
      context.go(flow.orderInfoLocation);
    }
  }

  Future<void> _showCart() async {
    final String? orderId = ref.read(appStoreProvider).orderId;
    if (orderId == null) return;
    final Order? order = await ref.read(shopApiProvider).order.get(orderId).first;
    if (!mounted || order == null) return;
    final OrderInfoModalResult result =
        await showOrderInfoModal(context, order, cart: true);
    if (result == OrderInfoModalResult.closed) return;
    await ref.read(orderFlowServiceProvider).completeCart();
    await _showOrderInfo();
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    final AppConfig config = ref.watch(appConfigProvider);
    return ListenableBuilder(
      listenable: _feed,
      builder: (BuildContext context, _) {
        final bool pending = _feed.hasPendingOrder;
        return Scaffold(
          key: const Key('products-screen'),
          backgroundColor: Colors.black,
          drawer: const AppDrawer(),
          appBar: AppBar(
            title: _feed.inStore
                ? Text(
                    '${_feed.merchant?.name ?? ''} ${l10n.productsViewTitle}'.trim(),
                    key: const Key('products-store-title'),
                  )
                : null,
            actions: <Widget>[
              if (!pending)
                IconButton(
                  key: const Key('products-search'),
                  icon: const Icon(Icons.search),
                  onPressed: _feed.toggleSearch,
                ),
              if (!pending)
                _StoreSign(
                  inStore: _feed.inStore,
                  onTap: () {
                    if (_feed.navigateToMerchants) {
                      context.go(Routes.merchants);
                    } else {
                      unawaited(_feed.changeStoreMode());
                    }
                  },
                ),
              if (pending)
                _OrderSign(
                  total: _feed.openOrderTotal,
                  onTap: () => unawaited(_showOrderInfo()),
                ),
            ],
            bottom: !_feed.inStore && !pending
                ? PreferredSize(
                    preferredSize: const Size.fromHeight(44),
                    child: _DeliveryToggle(
                      delivery: _feed.isDeliveryRequired,
                      onChanged: (bool v) => unawaited(_feed.setDeliveryRequired(v)),
                    ),
                  )
                : null,
          ),
          body: _feed.searchOpen
              ? SearchProductsView(onOpenDetails: _feed.openDetails)
              : _body(config),
        );
      },
    );
  }

  Widget _body(AppConfig config) {
    if (!_feed.loaded && _feed.allProducts.isEmpty) {
      return const LoadingView(color: Colors.white);
    }
    if (_feed.visibleProducts.isEmpty) {
      final String? placeholder = _feed.placeholder;
      return Center(
        key: const Key('products-empty'),
        child: placeholder == null || placeholder.isEmpty
            ? const SizedBox.shrink()
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: HtmlView(
                  placeholder,
                  textStyle: const TextStyle(color: Colors.white),
                ),
              ),
      );
    }
    return config.isSlidesView
        ? ProductsSlidesView(feed: _feed)
        : ProductsListView(feed: _feed);
  }
}

class _DeliveryToggle extends StatelessWidget {
  const _DeliveryToggle({required this.delivery, required this.onChanged});

  final bool delivery;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    TextStyle style(bool selected) => TextStyle(
          color: selected ? Colors.white : Colors.white54,
          fontWeight: selected ? FontWeight.bold : FontWeight.normal,
        );
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        GestureDetector(
          onTap: () => onChanged(false),
          child: Text(l10n.productsViewTakeaway, style: style(!delivery)),
        ),
        Switch(
          key: const Key('delivery-toggle'),
          value: delivery,
          onChanged: onChanged,
        ),
        GestureDetector(
          onTap: () => onChanged(true),
          child: Text(l10n.productsViewDelivery, style: style(delivery)),
        ),
      ],
    );
  }
}

/// `e-cu-store-sign`: "In Store" / "Exit Store".
class _StoreSign extends StatelessWidget {
  const _StoreSign({required this.inStore, required this.onTap});

  final bool inStore;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => TextButton.icon(
        key: const Key('store-sign'),
        style: TextButton.styleFrom(foregroundColor: Colors.white),
        onPressed: onTap,
        icon: FaIcon(
          inStore
              ? FontAwesomeIcons.rightFromBracket
              : FontAwesomeIcons.rightToBracket,
          size: 16,
        ),
        label: Text(inStore ? context.l10n.exitStore : context.l10n.inStore),
      );
}

/// `e-cu-order-sign`: basket + the open order's total.
class _OrderSign extends StatelessWidget {
  const _OrderSign({required this.total, required this.onTap});

  final double? total;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => TextButton.icon(
        key: const Key('order-sign'),
        style: TextButton.styleFrom(foregroundColor: EverColors.warning),
        onPressed: onTap,
        icon: const FaIcon(FontAwesomeIcons.basketShopping, size: 16),
        label: Text('${formatPrice(total ?? 0)}\$'),
      );
}
