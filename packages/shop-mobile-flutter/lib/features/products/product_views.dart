import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

import '../../config/app_config.dart';
import '../../core/formatting.dart';
import '../../core/l10n.dart';
import '../../core/product_locale.dart';
import '../../core/theme.dart';
import '../../data/models/product.dart';
import '../../providers.dart';
import '../../widgets/common.dart';
import '../../widgets/product_badges.dart';
import 'products_controller.dart';

/// "Buy for 12$" or "Product not available".
String buyButtonLabel(AppLocalizations l10n, ProductInfo p) => p.soldOut
    ? l10n.productsViewNotAvailable
    : '${l10n.productsViewBuyButtonPre}${formatPrice(p.warehouseProduct.price)}\$ '
          '${l10n.productsViewBuyButtonSuf}'
        .trim();

class _BuyDetailsButtons extends StatelessWidget {
  const _BuyDetailsButtons({required this.product, required this.feed});

  final ProductInfo product;
  final ProductsController feed;

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    final String id = product.warehouseProduct.id;
    return Row(
      children: <Widget>[
        Expanded(
          flex: 2,
          child: FilledButton(
            key: Key('buy-$id'),
            onPressed: product.soldOut ? null : () => unawaited(feed.buy(product)),
            child: Text(buyButtonLabel(l10n, product), textAlign: TextAlign.center),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: OutlinedButton(
            key: Key('details-$id'),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              side: const BorderSide(color: EverColors.secondary),
            ),
            onPressed:
                product.soldOut ? null : () => unawaited(feed.openDetails(product)),
            child: Text(l10n.productsViewDetailsDetails),
          ),
        ),
      ],
    );
  }
}

/// Slides view (`PRODUCTS_VIEW_TYPE=slides`): one product per page; the last
/// or second-to-last page loads the next 10.
class ProductsSlidesView extends ConsumerWidget {
  const ProductsSlidesView({super.key, required this.feed});

  static const int maxDescription = 45;

  final ProductsController feed;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final String language = ref.watch(languageProvider);
    final AppConfig config = ref.watch(appConfigProvider);
    final List<ProductInfo> items = feed.visibleProducts;
    return PageView.builder(
      key: const Key('products-slides'),
      itemCount: items.length,
      onPageChanged: (int index) {
        if (items.length - 1 <= index + 1 && feed.hasMore) {
          unawaited(feed.loadProducts());
        }
      },
      itemBuilder: (BuildContext context, int index) {
        final ProductInfo p = items[index];
        final WarehouseProduct wp = p.warehouseProduct;
        return Column(
          key: Key('product-slide-${wp.id}'),
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: <Widget>[
                  AppImage(productImageUrl(wp.product, language)),
                  PositionedDirectional(
                    top: 12,
                    start: 12,
                    child: DiscountBadge(wp),
                  ),
                  PositionedDirectional(
                    top: 12,
                    end: 12,
                    child: DeliveryInfoBadge(
                      wp,
                      isDelivery: feed.isDeliveryRequired,
                      defaultMin: config.deliveryTimeMin,
                      defaultMax: config.deliveryTimeMax,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              color: EverColors.brandDark,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      WarehouseLogo(p.warehouseLogo, light: true),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              localeValue(wp.product.title, language),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              shorten(
                                localeValue(wp.product.description, language),
                                maxDescription,
                              ),
                              style: const TextStyle(color: Colors.white70),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _BuyDetailsButtons(product: p, feed: feed),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

/// List view (`PRODUCTS_VIEW_TYPE=list`): cards, infinite scroll.
class ProductsListView extends ConsumerStatefulWidget {
  const ProductsListView({super.key, required this.feed});

  static const int maxDescription = 53;

  final ProductsController feed;

  @override
  ConsumerState<ProductsListView> createState() => _ProductsListViewState();
}

class _ProductsListViewState extends ConsumerState<ProductsListView> {
  final ScrollController _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    _scroll.addListener(() {
      final ScrollPosition p = _scroll.position;
      if (p.pixels >= p.maxScrollExtent - 100 && widget.feed.hasMore) {
        unawaited(widget.feed.loadProducts());
      }
    });
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final String language = ref.watch(languageProvider);
    final AppConfig config = ref.watch(appConfigProvider);
    final List<ProductInfo> items = widget.feed.visibleProducts;
    return ListView.builder(
      key: const Key('products-list'),
      controller: _scroll,
      itemCount: items.length + (widget.feed.loadingMore ? 1 : 0),
      itemBuilder: (BuildContext context, int index) {
        if (index >= items.length) {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: LoadingView(color: Colors.white),
          );
        }
        final ProductInfo p = items[index];
        final WarehouseProduct wp = p.warehouseProduct;
        return Card(
          key: Key('product-card-${wp.id}'),
          color: EverColors.brandLight,
          margin: const EdgeInsets.all(8),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              ListTile(
                leading: WarehouseLogo(p.warehouseLogo),
                title: Text(
                  localeValue(wp.product.title, language),
                  style: const TextStyle(color: Colors.white),
                ),
                subtitle: Text(
                  shorten(
                    localeValue(wp.product.description, language),
                    ProductsListView.maxDescription,
                  ),
                  style: const TextStyle(color: Colors.white70),
                ),
                trailing: DeliveryInfoBadge(
                  wp,
                  isDelivery: widget.feed.isDeliveryRequired,
                  defaultMin: config.deliveryTimeMin,
                  defaultMax: config.deliveryTimeMax,
                ),
              ),
              AspectRatio(
                aspectRatio: 16 / 10,
                child: Stack(
                  fit: StackFit.expand,
                  children: <Widget>[
                    AppImage(productImageUrl(wp.product, language)),
                    PositionedDirectional(
                      top: 8,
                      start: 8,
                      child: DiscountBadge(wp),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8),
                child: _BuyDetailsButtons(product: p, feed: widget.feed),
              ),
            ],
          ),
        );
      },
    );
  }
}
