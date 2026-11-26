import '../models/geo.dart';
import '../models/json.dart';
import '../models/product.dart';
import '../network/graphql/documents.dart';
import '../network/graphql/graphql_service.dart';
import 'shop_api.dart';

/// `GetGeoLocationProductsOptions`.
class ProductsQueryOptions {
  const ProductsQueryOptions({
    this.isDeliveryRequired,
    this.isTakeaway,
    this.merchantIds,
    this.imageOrientation,
    this.locale,
    this.withoutCount,
  });

  final bool? isDeliveryRequired;
  final bool? isTakeaway;
  final List<String>? merchantIds;
  final int? imageOrientation;
  final String? locale;
  final bool? withoutCount;

  Json toJson() => <String, dynamic>{
        'isDeliveryRequired': ?isDeliveryRequired,
        'isTakeaway': ?isTakeaway,
        'merchantIds': ?merchantIds,
        'imageOrientation': ?imageOrientation,
        'locale': ?locale,
        'withoutCount': ?withoutCount,
      };
}

class ProductsRepository {
  ProductsRepository(this._gql, this._api);

  final GraphQLService _gql;
  final ShopApi _api;

  static Json _geo(Loc loc) => <String, dynamic>{'loc': loc.toJson()};

  /// `GeoLocationProductsByPaging`; keeps only non-null rows whose
  /// `warehouseProduct.isProductAvailable` is true (as the Ionic service).
  Future<List<ProductInfo>> geoLocationProductsByPaging(
    Loc loc, {
    required int skip,
    required int limit,
    ProductsQueryOptions options = const ProductsQueryOptions(),
    String? searchText,
  }) async {
    final Json data = await _gql.query(
      geoLocationProductsByPagingQuery,
      variables: <String, dynamic>{
        'geoLocation': _geo(loc),
        'options': options.toJson(),
        'pagingOptions': <String, int>{'skip': skip, 'limit': limit},
        'searchText': ?searchText,
      },
    );
    return asJsonList(data['geoLocationProductsByPaging'])
        .map(ProductInfo.fromJson)
        .where((ProductInfo p) => p.warehouseProduct.isProductAvailable)
        .toList();
  }

  Future<int> getCountOfGeoLocationProducts(
    Loc loc, {
    ProductsQueryOptions options = const ProductsQueryOptions(),
    String? searchText,
  }) async {
    final Json data = await _gql.query(
      getCountOfGeoLocationProductsQuery,
      variables: <String, dynamic>{
        'geoLocation': _geo(loc),
        'options': options.toJson(),
        'searchText': ?searchText,
      },
    );
    final Object? count = data['getCountOfGeoLocationProducts'];
    return count is num ? count.toInt() : 0;
  }

  /// `GetWarehouseProduct`: null when the merchant no longer has it.
  Future<WarehouseProduct?> getWarehouseProduct(
    String warehouseId,
    String warehouseProductId,
  ) async {
    final Json data = await _gql.query(
      getWarehouseProductQuery,
      variables: <String, dynamic>{
        'warehouseId': warehouseId,
        'warehouseProductId': warehouseProductId,
      },
    );
    final Json? raw = asJsonOrNull(data['getWarehouseProduct']);
    return raw == null ? null : WarehouseProduct.fromJson(raw);
  }

  /// Live products of a merchant (`warehouse-products.get`).
  Stream<List<WarehouseProduct>> watchWarehouseProducts(
    String warehouseId, {
    bool fullProducts = false,
  }) =>
      _api.warehouseProducts.get(warehouseId, fullProducts: fullProducts);
}
