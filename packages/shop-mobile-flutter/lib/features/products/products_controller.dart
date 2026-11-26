import 'dart:async';

import 'package:flutter/foundation.dart';

import '../../config/app_config.dart';
import '../../data/models/enums.dart';
import '../../data/models/geo.dart';
import '../../data/models/product.dart';
import '../../data/models/warehouse.dart';
import '../../data/repositories/location_repository.dart';
import '../../data/repositories/merchants_repository.dart';
import '../../data/repositories/products_repository.dart';
import '../../data/repositories/shop_api.dart';
import '../../data/store/app_store.dart';
import '../../services/order_flow_service.dart';

/// Navigation the feed asks the screen to do.
sealed class FeedNavigation {
  const FeedNavigation();
}

class FeedGoTo extends FeedNavigation {
  const FeedGoTo(this.location);
  final String location;
}

/// Show the shopping cart modal (`SHOPPING_CART`).
class FeedShowCart extends FeedNavigation {
  const FeedShowCart();
}

/// Show the order tracking (page or popup).
class FeedShowOrderInfo extends FeedNavigation {
  const FeedShowOrderInfo();
}

/// The product feed (`/products`, docs/latest-stack/shop-mobile-features.md
/// §4.4): location, delivery type, merchant filter, paging with a 2 s poll
/// that keeps the "sold out" flags live, and the buy / details actions.
class ProductsController extends ChangeNotifier {
  ProductsController({
    required this.config,
    required this.store,
    required this.api,
    required this.products,
    required this.merchants,
    required this.location,
    required this.orderFlow,
    this.pageSize = 10,
    this.pollInterval = const Duration(seconds: 2),
  });

  final AppConfig config;
  final AppStore store;
  final ShopApi api;
  final ProductsRepository products;
  final MerchantsRepository merchants;
  final LocationRepository location;
  final OrderFlowService orderFlow;
  final int pageSize;
  final Duration pollInterval;

  /// Called when the feed needs the screen to navigate.
  void Function(FeedNavigation navigation)? onNavigate;

  final List<ProductInfo> _items = <ProductInfo>[];
  final List<Timer> _pollers = <Timer>[];
  StreamSubscription<String?>? _placeholderSub;
  Loc? loc;
  int productsCount = 0;
  bool loaded = false;
  bool loadingMore = false;
  bool isDeliveryRequired = true;
  bool searchOpen = false;
  Warehouse? merchant;
  String? placeholder;
  double? openOrderTotal;
  int _generation = 0;
  bool _disposed = false;

  /// Rows with `count === 0` are hidden, as in the Ionic views.
  List<ProductInfo> get visibleProducts => _items
      .where((ProductInfo p) => p.warehouseProduct.count != 0)
      .toList(growable: false);

  List<ProductInfo> get allProducts => List<ProductInfo>.unmodifiable(_items);

  bool get inStore => store.inStore != null;
  bool get hasPendingOrder => store.hasPendingOrder;
  bool get hasMore => productsCount > _items.length;

  /// The store sign opens `/merchants` unless MERCHANT_IDS are configured
  /// (or the customer is in a store already).
  bool get navigateToMerchants => config.merchantIds.isEmpty && !inStore;

  /// `1` for the slides view, `0` for the list view.
  int get imageOrientation => config.isSlidesView ? 1 : 0;

  void _notify() {
    if (!_disposed) notifyListeners();
  }

  Future<void> init() async {
    if (inStore) {
      store.deliveryType = DeliveryType.takeaway;
      unawaited(_loadMerchant());
    }
    isDeliveryRequired = store.deliveryType == DeliveryType.delivery;
    _subscribePlaceholder();
    unawaited(refreshOpenOrderTotal());
    try {
      loc = await location.customerLoc();
    } on Object catch (e) {
      debugPrint('No location for the feed: $e');
      store.registrationSystem = RegistrationSystem.once;
      onNavigate?.call(const FeedGoTo('/invite'));
      return;
    }
    await _continueOrder();
    await loadProducts();
  }

  void _subscribePlaceholder() {
    final String? userId = store.userId;
    if (userId == null) return;
    _placeholderSub = api.userProducts
        .getPlaceholder(userId, store.deviceId)
        .listen(
          (String? html) {
            placeholder = html;
            _notify();
          },
          onError: (Object e) => debugPrint('Placeholder failed: $e'),
        );
  }

  Future<void> _loadMerchant() async {
    final String? id = store.inStore;
    if (id == null) return;
    try {
      merchant = await merchants.getWarehouse(id, fullProducts: false);
      _notify();
    } on Object catch (e) {
      debugPrint('Could not load the merchant: $e');
    }
  }

  Future<void> refreshOpenOrderTotal() async {
    final String? orderId = store.orderId;
    if (orderId == null) {
      openOrderTotal = null;
      _notify();
      return;
    }
    try {
      openOrderTotal = await orderFlow.orders.orderTotalPrice(orderId);
      _notify();
    } on Object catch (e) {
      debugPrint('Could not load the order total: $e');
    }
  }

  Future<List<String>?> _merchantFilter() async {
    if (config.merchantIds.isNotEmpty) return config.merchantIds;
    final String? storeId = store.inStore;
    if (storeId != null) return <String>[storeId];
    if (store.hasPendingOrder) return orderFlow.openOrderMerchantFilter();
    return null;
  }

  ProductsQueryOptions _options(List<String>? merchantIds) =>
      ProductsQueryOptions(
        isDeliveryRequired: store.isDelivery,
        isTakeaway: !store.isDelivery,
        merchantIds: merchantIds ?? const <String>[],
        imageOrientation: imageOrientation,
        locale: store.language ?? config.defaultLocale,
        withoutCount: true,
      );

  /// Loads the next page (count first, then `skip = loaded so far`).
  Future<void> loadProducts() async {
    final Loc? at = loc;
    if (at == null || loadingMore) return;
    final int generation = _generation;
    store.deliveryType =
        isDeliveryRequired ? DeliveryType.delivery : DeliveryType.takeaway;
    loadingMore = true;
    _notify();
    try {
      final ProductsQueryOptions options = _options(await _merchantFilter());
      final int count = await products.getCountOfGeoLocationProducts(
        at,
        options: options,
      );
      if (generation != _generation) return;
      productsCount = count;
      if (productsCount > _items.length) {
        final int skip = _items.length;
        final List<ProductInfo> page = await products.geoLocationProductsByPaging(
          at,
          skip: skip,
          limit: pageSize,
          options: options,
        );
        if (generation != _generation) return;
        _items.addAll(page);
        _startPoll(at, skip, options, generation);
      }
    } on Object catch (e) {
      debugPrint('Could not load products: $e');
    } finally {
      if (generation == _generation) {
        loadingMore = false;
        loaded = true;
        _notify();
      }
    }
  }

  /// Later polls of a page only update the sold-out flags of shown rows.
  void _startPoll(Loc at, int skip, ProductsQueryOptions options, int generation) {
    _pollers.add(Timer.periodic(pollInterval, (Timer t) async {
      if (generation != _generation || _disposed) {
        t.cancel();
        return;
      }
      try {
        final List<ProductInfo> page = await products.geoLocationProductsByPaging(
          at,
          skip: skip,
          limit: pageSize,
          options: options,
        );
        if (generation != _generation) return;
        bool changed = false;
        for (final ProductInfo fresh in page) {
          final int i = _indexOf(fresh.warehouseProduct.id);
          if (i < 0) continue;
          final bool soldOut = fresh.warehouseProduct.count == 0;
          if (_items[i].soldOut != soldOut) {
            _items[i] = _items[i].copyWith(soldOut: soldOut);
            changed = true;
          }
        }
        if (changed) _notify();
      } on Object catch (e) {
        debugPrint('Products poll failed: $e');
      }
    }));
  }

  int _indexOf(String warehouseProductId) => _items.indexWhere(
        (ProductInfo p) => p.warehouseProduct.id == warehouseProductId,
      );

  void markSoldOut(String warehouseProductId) {
    final int i = _indexOf(warehouseProductId);
    if (i >= 0) {
      _items[i] = _items[i].copyWith(soldOut: true);
      _notify();
    }
  }

  void _reset() {
    _generation++;
    for (final Timer t in _pollers) {
      t.cancel();
    }
    _pollers.clear();
    _items.clear();
    productsCount = 0;
    loaded = false;
    loadingMore = false;
  }

  /// Takeaway / Delivery toggle (no open order): reload from scratch.
  Future<void> setDeliveryRequired(bool value) async {
    if (hasPendingOrder) return;
    isDeliveryRequired = value;
    _reset();
    _notify();
    await loadProducts();
  }

  /// Store sign with MERCHANT_IDS: enter the first merchant / leave the store.
  Future<void> changeStoreMode() async {
    if (inStore) {
      store.clearInStore();
      merchant = null;
    } else if (!navigateToMerchants) {
      store.inStore = config.merchantIds.first;
      store.deliveryType = DeliveryType.takeaway;
      isDeliveryRequired = false;
      unawaited(_loadMerchant());
    }
    _reset();
    _notify();
    await loadProducts();
  }

  /// Leave "in store" mode from the header (store sign while in a store).
  Future<void> exitStore() => changeStoreMode();

  void toggleSearch() {
    searchOpen = !searchOpen;
    _notify();
  }

  /// Buy button (§4.5).
  Future<void> buy(ProductInfo product) async {
    final BuyOutcome outcome = await orderFlow.buy(
      warehouseId: product.warehouseId.isEmpty
          ? (store.warehouseId ?? '')
          : product.warehouseId,
      productId: product.warehouseProduct.product.id,
      warehouseProductId: product.warehouseProduct.id,
    );
    switch (outcome) {
      case BuyOutcome.needsRegistration:
        onNavigate?.call(const FeedGoTo('/invite'));
      case BuyOutcome.soldOut:
        markSoldOut(product.warehouseProduct.id);
      case BuyOutcome.showCart:
        unawaited(refreshOpenOrderTotal());
        onNavigate?.call(const FeedShowCart());
      case BuyOutcome.showOrderInfo:
        unawaited(refreshOpenOrderTotal());
        if (config.isPopupOrderInfo) {
          // The popup feed keeps only the order's merchant.
          final String warehouseId = product.warehouseId;
          _items.removeWhere((ProductInfo p) => p.warehouseId != warehouseId);
          _notify();
        }
        onNavigate?.call(const FeedShowOrderInfo());
    }
  }

  /// Details button: the product must still exist at the merchant.
  Future<void> openDetails(ProductInfo product) async {
    try {
      final WarehouseProduct? found = await products.getWarehouseProduct(
        product.warehouseId,
        product.warehouseProduct.id,
      );
      if (found == null) {
        markSoldOut(product.warehouseProduct.id);
        return;
      }
      onNavigate?.call(FeedGoTo(Uri(
        path: '/products/product-details/${product.warehouseProduct.product.id}',
        queryParameters: <String, String>{
          'backUrl': '/products',
          'warehouseId': product.warehouseId,
        },
      ).toString()));
    } on Object catch (e) {
      debugPrint('Details lookup failed: $e');
      markSoldOut(product.warehouseProduct.id);
    }
  }

  /// Resume a Buy started before registration (`_buyProduct`).
  Future<void> _continueOrder() async {
    final String? buyProduct = store.buyProduct;
    if (buyProduct == null) return;
    final String? userId = store.userId;
    final String? warehouseId = store.warehouseId;
    if (userId != null && warehouseId != null) {
      try {
        final WarehouseProduct? product =
            await products.getWarehouseProduct(warehouseId, buyProduct);
        if (product != null) {
          store
            ..buyProduct = null
            ..warehouseId = null;
          await buy(ProductInfo(warehouseProduct: product, warehouseId: warehouseId));
        }
      } on Object catch (e) {
        debugPrint('Could not resume the buy: $e');
      }
    } else {
      store
        ..buyProduct = null
        ..warehouseId = null;
    }
  }

  @override
  void dispose() {
    _disposed = true;
    _generation++;
    for (final Timer t in _pollers) {
      t.cancel();
    }
    unawaited(_placeholderSub?.cancel());
    super.dispose();
  }
}
