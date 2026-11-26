import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

import '../../core/formatting.dart';
import '../../core/l10n.dart';
import '../../core/product_locale.dart';
import '../../core/theme.dart';
import '../../data/models/geo.dart';
import '../../data/models/product.dart';
import '../../data/models/warehouse.dart';
import '../../data/repositories/products_repository.dart';
import '../../data/store/app_store.dart';
import '../../providers.dart';
import '../../widgets/common.dart';

/// Search panel of the feed (`search-products`): merchants by name (5 at a
/// time) and products by text (10 at a time), each with "View more".
class SearchProductsView extends ConsumerStatefulWidget {
  const SearchProductsView({super.key, required this.onOpenDetails});

  static const int merchantsLimit = 5;
  static const int productsLimit = 10;
  static const int maxDescription = 100;

  final Future<void> Function(ProductInfo product) onOpenDetails;

  @override
  ConsumerState<SearchProductsView> createState() => _SearchProductsViewState();
}

class _SearchProductsViewState extends ConsumerState<SearchProductsView> {
  final TextEditingController _input = TextEditingController();
  List<Warehouse> _allMerchants = <Warehouse>[];
  int _merchantsShown = 0;
  final List<ProductInfo> _products = <ProductInfo>[];
  int _productsCount = 0;
  bool _loading = true;
  Loc? _loc;
  int _query = 0;

  @override
  void initState() {
    super.initState();
    unawaited(_init());
  }

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  Future<void> _init() async {
    try {
      _loc = await ref.read(locationRepositoryProvider).customerLoc();
    } on Object catch (e) {
      debugPrint('No location for the search: $e');
    }
    await _search();
  }

  ProductsQueryOptions get _options {
    final AppStore store = ref.read(appStoreProvider);
    return ProductsQueryOptions(
      isDeliveryRequired: store.isDelivery,
      isTakeaway: !store.isDelivery,
    );
  }

  Future<void> _search() async {
    final Loc? loc = _loc;
    if (loc == null) {
      setState(() => _loading = false);
      return;
    }
    final int query = ++_query;
    setState(() => _loading = true);
    final String text = _input.text;
    try {
      final List<Warehouse> merchants = await ref
          .read(merchantsRepositoryProvider)
          .getMerchantsByName(text, loc);
      final ProductsRepository repo = ref.read(productsRepositoryProvider);
      final List<ProductInfo> products = await repo.geoLocationProductsByPaging(
        loc,
        skip: 0,
        limit: SearchProductsView.productsLimit,
        options: _options,
        searchText: text,
      );
      final int count = await repo.getCountOfGeoLocationProducts(
        loc,
        options: _options,
        searchText: text,
      );
      if (!mounted || query != _query) return;
      setState(() {
        _allMerchants = merchants;
        _merchantsShown = SearchProductsView.merchantsLimit;
        _products
          ..clear()
          ..addAll(products);
        _productsCount = count;
      });
    } on Object catch (e) {
      debugPrint('Search failed: $e');
    } finally {
      if (mounted && query == _query) setState(() => _loading = false);
    }
  }

  Future<void> _moreProducts() async {
    final Loc? loc = _loc;
    if (loc == null) return;
    final List<ProductInfo> more = await ref
        .read(productsRepositoryProvider)
        .geoLocationProductsByPaging(
          loc,
          skip: _products.length,
          limit: SearchProductsView.productsLimit,
          options: _options,
          searchText: _input.text,
        );
    if (mounted) setState(() => _products.addAll(more));
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    final String language = ref.watch(languageProvider);
    final List<Warehouse> merchants =
        _allMerchants.take(_merchantsShown).toList();
    final bool empty = merchants.isEmpty && _products.isEmpty;
    const TextStyle white = TextStyle(color: Colors.white);

    return Column(
      key: const Key('search-products'),
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.all(12),
          child: TextField(
            key: const Key('search-input'),
            controller: _input,
            style: white,
            autofocus: true,
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.search, color: Colors.white54),
              hintText: l10n.searchViewSearchPlaceholder,
              hintStyle: const TextStyle(color: Colors.white38),
            ),
            onChanged: (_) => unawaited(_search()),
          ),
        ),
        Expanded(
          child: _loading
              ? const LoadingView(color: Colors.white)
              : empty
                  ? Center(
                      child: Text(l10n.searchViewEmptyList, style: white),
                    )
                  : ListView(
                      children: <Widget>[
                        for (final Warehouse m in merchants)
                          ListTile(
                            key: Key('search-merchant-${m.id}'),
                            leading: WarehouseLogo(m.logo),
                            title: Text(m.name, style: white),
                            trailing: Text(
                              m.isActive ? l10n.searchViewOpen : l10n.searchViewClosed,
                              style: TextStyle(
                                color: m.isActive
                                    ? EverColors.success
                                    : EverColors.danger,
                              ),
                            ),
                          ),
                        if (_allMerchants.length > merchants.length)
                          TextButton(
                            key: const Key('search-more-merchants'),
                            onPressed: () => setState(
                              () => _merchantsShown += SearchProductsView.merchantsLimit,
                            ),
                            child: Text(l10n.searchViewViewMore),
                          ),
                        for (final ProductInfo p in _products)
                          ListTile(
                            key: Key('search-product-${p.warehouseProduct.id}'),
                            onTap: () => unawaited(widget.onOpenDetails(p)),
                            leading: SizedBox(
                              width: 56,
                              height: 56,
                              child: AppImage(
                                productImageUrl(p.warehouseProduct.product, language),
                              ),
                            ),
                            title: Text(
                              localeValue(p.warehouseProduct.product.title, language),
                              style: white,
                            ),
                            subtitle: Text(
                              shorten(
                                localeValue(
                                  p.warehouseProduct.product.description,
                                  language,
                                ),
                                SearchProductsView.maxDescription,
                              ),
                              style: const TextStyle(color: Colors.white70),
                            ),
                            trailing: Text(
                              '${formatPrice(p.warehouseProduct.price)}\$',
                              style: white,
                            ),
                          ),
                        if (_productsCount > _products.length)
                          TextButton(
                            key: const Key('search-more-products'),
                            onPressed: () => unawaited(_moreProducts()),
                            child: Text(l10n.searchViewViewMore),
                          ),
                      ],
                    ),
        ),
      ],
    );
  }
}
