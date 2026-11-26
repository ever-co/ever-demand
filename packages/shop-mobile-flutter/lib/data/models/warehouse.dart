import 'enums.dart';
import 'geo.dart';
import 'json.dart';
import 'product.dart';

/// A merchant (`Warehouse`). Fields the shop app reads.
class Warehouse {
  const Warehouse({
    required this.id,
    this.name = '',
    this.username,
    this.logo = '',
    this.isActive = true,
    this.isPaymentEnabled = false,
    this.contactPhone,
    this.geoLocation,
    this.orderBarcodeType = OrderBarcodeType.qr,
    this.products = const <WarehouseProduct>[],
  });

  factory Warehouse.fromJson(Json json) => Warehouse(
        id: readId(json) ?? '',
        name: readString(json, 'name') ?? '',
        username: readString(json, 'username'),
        logo: readString(json, 'logo') ?? '',
        isActive: readBool(json, 'isActive', fallback: true),
        isPaymentEnabled: readBool(json, 'isPaymentEnabled'),
        contactPhone: readString(json, 'contactPhone'),
        geoLocation: json['geoLocation'] is Map
            ? GeoLocation.fromJson(asJson(json['geoLocation']))
            : null,
        orderBarcodeType:
            readInt(json, 'orderBarcodeType') ?? OrderBarcodeType.qr,
        products: asJsonList(json['products'])
            .map(WarehouseProduct.fromJson)
            .toList(),
      );

  final String id;
  final String name;
  final String? username;
  final String logo;
  final bool isActive;
  final bool isPaymentEnabled;
  final String? contactPhone;
  final GeoLocation? geoLocation;
  final int orderBarcodeType;
  final List<WarehouseProduct> products;
}
