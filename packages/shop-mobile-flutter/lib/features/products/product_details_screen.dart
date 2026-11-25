import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../config/app_config.dart';
import '../../core/l10n.dart';
import '../../core/product_locale.dart';
import '../../core/theme.dart';
import '../../data/models/enums.dart';
import '../../data/models/product.dart';
import '../../data/models/warehouse.dart';
import '../../data/store/app_store.dart';
import '../../providers.dart';
import '../../services/order_flow_service.dart';
import '../../widgets/app_drawer.dart';
import '../../widgets/common.dart';
import '../../widgets/product_badges.dart';
import '../order/order_popup.dart';
import 'product_views.dart';

/// Which images the details page shows (§4.6): one image alone; one
/// horizontal (`orientation 2`) and one vertical → the horizontal one alone;
/// else the vertical ones (or the horizontal ones when there are no vertical
/// ones) in a 2-per-view carousel.
List<ProductImage> detailsImages(List<ProductImage> images, String language) {
  final List<ProductImage> localized = images
      .where((ProductImage i) => i.locale.startsWith(language))
      .toList();
  final List<ProductImage> all = localized.isEmpty ? images : localized;
  if (all.length <= 1) return all;
  final List<ProductImage> horizontal = all
      .where((ProductImage i) => i.orientation == ImageOrientation.horizontal)
      .toList();
  final List<ProductImage> vertical = all
      .where((ProductImage i) => i.orientation != ImageOrientation.horizontal)
      .toList();
  if (horizontal.length == 1 && vertical.length == 1) return horizontal;
  return vertical.isNotEmpty ? vertical : horizontal;
}

class ProductDetailsScreen extends ConsumerStatefulWidget {
  const ProductDetailsScreen({
    super.key,
    required this.productId,
    required this.warehouseId,
    this.backUrl = '/products',
  });

  static const int maxDescription = 53;

  final String productId;
  final String warehouseId;
  final String backUrl;

  @override
  ConsumerState<ProductDetailsScreen> createState() =>
      _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends ConsumerState<ProductDetailsScreen> {
  Warehouse? _warehouse;
  WarehouseProduct? _product;
  bool _soldOut = false;
  bool _loading = true;
  bool _buying = false;
  StreamSubscription<List<WarehouseProduct>>? _soldOutSub;

  @override
  void initState() {
    super.initState();
    unawaited(_load());
  }

  @override
  void dispose() {
    unawaited(_soldOutSub?.cancel());
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final Warehouse? warehouse = await ref
          .read(merchantsRepositoryProvider)
          .getWarehouse(widget.warehouseId, fullProducts: true);
      WarehouseProduct? product;
      for (final WarehouseProduct p in warehouse?.products ?? <WarehouseProduct>[]) {
        if (p.product.id == widget.productId) product = p;
      }
      if (!mounted) return;
      setState(() {
        _warehouse = warehouse;
        _product = product;
        _loading = false;
      });
      _watchSoldOut();
      await _continueOrder();
    } on Object catch (e) {
      debugPrint('Could not load the product: $e');
      if (mounted) setState(() => _loading = false);
    }
  }

  /// Live "sold out": missing at the merchant or `count <= 0`.
  void _watchSoldOut() {
    final WarehouseProduct? product = _product;
    if (product == null) return;
    _soldOutSub = ref
        .read(productsRepositoryProvider)
        .watchWarehouseProducts(widget.warehouseId)
        .listen(
          (List<WarehouseProduct> products) {
            WarehouseProduct? live;
            for (final WarehouseProduct p in products) {
              if (p.productId == product.productId) live = p;
            }
            if (mounted) setState(() => _soldOut = live == null || live.count <= 0);
          },
          onError: (Object e) => debugPrint('Sold-out watch failed: $e'),
        );
  }

  /// Resume a Buy started before registration.
  Future<void> _continueOrder() async {
    final AppStore store = ref.read(appStoreProvider);
    final String? buyProduct = store.buyProduct;
    if (store.userId != null) {
      if (buyProduct != null && _product != null) {
        store
          ..buyProduct = null
          ..warehouseId = null;
        await _buy();
      }
    } else {
      store
        ..buyProduct = null
        ..warehouseId = null;
    }
  }

  Future<void> _buy() async {
    final WarehouseProduct? product = _product;
    if (product == null || _buying) return;
    setState(() => _buying = true);
    final OrderFlowService flow = ref.read(orderFlowServiceProvider);
    final BuyOutcome outcome = await flow.buy(
      warehouseId: widget.warehouseId,
      productId: product.product.id,
      warehouseProductId: product.id,
      fromDetails: true,
    );
    if (!mounted) return;
    setState(() => _buying = false);
    switch (outcome) {
      case BuyOutcome.needsRegistration:
        context.go('/invite');
      case BuyOutcome.soldOut:
        setState(() => _soldOut = true);
      case BuyOutcome.showCart || BuyOutcome.showOrderInfo:
        if (ref.read(appConfigProvider).isPopupOrderInfo) {
          await showOrderPopup(context);
        } else {
          context.go(flow.orderInfoLocation);
        }
    }
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    final String language = ref.watch(languageProvider);
    final AppConfig config = ref.watch(appConfigProvider);
    final WarehouseProduct? wp = _product;

    return Scaffold(
      key: const Key('product-details-screen'),
      backgroundColor: EverColors.brandDark,
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: Text(l10n.productsViewDetailsDetails),
        actions: <Widget>[
          BackTextButton(
            label: l10n.productsViewDetailsBack,
            onPressed: () => context.go(widget.backUrl),
          ),
        ],
      ),
      body: _loading
          ? const LoadingView(color: Colors.white)
          : wp == null
              ? Center(
                  child: Text(l10n.notFound, style: const TextStyle(color: Colors.white)),
                )
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        WarehouseLogo(_warehouse?.logo ?? '', light: true),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                localeValue(wp.product.title, language),
                                key: const Key('product-details-title'),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                shorten(
                                  localeValue(wp.product.description, language),
                                  ProductDetailsScreen.maxDescription,
                                ),
                                style: const TextStyle(color: Colors.white70),
                              ),
                            ],
                          ),
                        ),
                        DeliveryInfoBadge(
                          wp,
                          isDelivery: ref.read(appStoreProvider).isDelivery,
                          defaultMin: config.deliveryTimeMin,
                          defaultMax: config.deliveryTimeMax,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Align(
                      alignment: AlignmentDirectional.centerStart,
                      child: DiscountBadge(wp),
                    ),
                    const SizedBox(height: 12),
                    _Images(images: detailsImages(wp.product.images, language)),
                    const SizedBox(height: 16),
                    Text(
                      l10n.productsViewDetailsIncludes,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      localeValue(wp.product.details, language),
                      style: const TextStyle(color: Colors.white70),
                    ),
                    const SizedBox(height: 20),
                    FilledButton(
                      key: const Key('product-details-buy'),
                      onPressed: _soldOut || _buying ? null : () => unawaited(_buy()),
                      child: Text(
                        buyButtonLabel(
                          l10n,
                          ProductInfo(
                            warehouseProduct: wp,
                            warehouseId: widget.warehouseId,
                            soldOut: _soldOut,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }
}

class _Images extends StatefulWidget {
  const _Images({required this.images});

  final List<ProductImage> images;

  @override
  State<_Images> createState() => _ImagesState();
}

class _ImagesState extends State<_Images> {
  // Two images per view, 5 px apart (the Ionic swiper options).
  final PageController _pages = PageController(viewportFraction: 0.5);

  @override
  void dispose() {
    _pages.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final List<ProductImage> images = widget.images;
    if (images.isEmpty) return const SizedBox.shrink();
    if (images.length == 1) {
      return AspectRatio(
        aspectRatio: 16 / 10,
        child: AppImage(images.first.url),
      );
    }
    return SizedBox(
      key: const Key('product-details-carousel'),
      height: 220,
      child: PageView.builder(
        controller: _pages,
        padEnds: false,
        itemCount: images.length,
        itemBuilder: (BuildContext context, int i) => Padding(
          padding: const EdgeInsetsDirectional.only(end: 5),
          child: AppImage(images[i].url),
        ),
      ),
    );
  }
}
