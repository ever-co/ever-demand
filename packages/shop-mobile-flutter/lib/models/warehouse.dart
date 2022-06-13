import 'package:shop_flutter_mobile/models/product.dart';

class WarehouseProduct {
  final String? typename;
  final String? id;
  final int price;
  final int initialPrice;
  final int? count;
  final int soldCount;
  final Product product;
  final bool? isManufacturing;
  final bool? isCarrierRequired;
  final bool? isDeliveryRequired;
  final bool? isTakeaway;
  final int? deliveryTimeMin;
  final int? deliveryTimeMax;

  const WarehouseProduct({
    this.typename,
    this.id,
    required this.price,
    required this.initialPrice,
    this.count,
    required this.soldCount,
    required this.product,
    this.isManufacturing,
    this.isCarrierRequired,
    this.isDeliveryRequired,
    this.isTakeaway,
    this.deliveryTimeMin,
    this.deliveryTimeMax,
  });

  factory WarehouseProduct.fromJson(Map<String, dynamic> json) {
    // return an object on contructor
    return WarehouseProduct(
      typename: json['__typename'],
      id: json['_id'],
      price: json['price'],
      initialPrice: json['initialPrice'],
      count: json['count'],
      soldCount: json['soldCount'],
      product: json['product'],
      isManufacturing: json['isManufacturing'],
      isCarrierRequired: json['isCarrierRequired'],
      isDeliveryRequired: json['isDeliveryRequired'],
      isTakeaway: json['isTakeaway'],
      deliveryTimeMin: json['deliveryTimeMin'],
      deliveryTimeMax: json['deliveryTimeMax'],
    );
  }
}
