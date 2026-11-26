import '../models/geo.dart';
import '../models/json.dart';
import '../models/warehouse.dart';
import '../network/graphql/documents.dart';
import '../network/graphql/graphql_service.dart';
import 'shop_api.dart';

class MerchantsRepository {
  MerchantsRepository(this._gql, this._api);

  final GraphQLService _gql;
  final ShopApi _api;

  Future<List<Warehouse>> getCloseMerchants(Loc loc) async {
    final Json data = await _gql.query(
      getCloseMerchantsQuery,
      variables: <String, dynamic>{
        'geoLocation': <String, dynamic>{'loc': loc.toJson()},
      },
    );
    return asJsonList(data['getCloseMerchants']).map(Warehouse.fromJson).toList();
  }

  /// `GetMerchantsBuyName` (sic: the schema's name).
  Future<List<Warehouse>> getMerchantsByName(String searchName, Loc? loc) async {
    final Json data = await _gql.query(
      getMerchantsBuyNameQuery,
      variables: <String, dynamic>{
        'searchName': searchName,
        if (loc != null) 'geoLocation': <String, dynamic>{'loc': loc.toJson()},
      },
    );
    return asJsonList(data['getMerchantsBuyName'])
        .map(Warehouse.fromJson)
        .toList();
  }

  /// Live merchant (`warehouse.get(id, fullProducts)`).
  Stream<Warehouse?> watchWarehouse(String id, {bool fullProducts = true}) =>
      _api.warehouse.get(id, fullProducts: fullProducts);

  /// First value of [watchWarehouse].
  Future<Warehouse?> getWarehouse(String id, {bool fullProducts = true}) =>
      watchWarehouse(id, fullProducts: fullProducts).first;
}
