import 'package:shop_flutter_mobile/models/image.dart';
import 'package:shop_flutter_mobile/models/translate.dart';
import 'package:shop_flutter_mobile/models/warehouse.dart';

class Product {
  final String? typename;
  final String? id;
  final List<Translate> title;
  final List<Translate> description;
  final List<Translate> details;
  final List<Image> images;
  final List<String>? categories;
  final List<Translate> detailsHTML;
  final List<Translate> descriptionHTML;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Product({
    this.typename,
    this.id,
    required this.title,
    required this.description,
    required this.details,
    required this.images,
    this.categories,
    required this.detailsHTML,
    required this.descriptionHTML,
    this.createdAt,
    this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      typename: json['__typename'],
      id: json['_id'],
      title: json['title'],
      description: json['description'],
      details: json['details'],
      images: json['images'],
      categories: json['categories'],
      detailsHTML: json['detailsHTML'],
      descriptionHTML: json['descriptionHTML'],
      createdAt: DateTime.parse(json['_createdAt']),
      updatedAt: DateTime.parse(json['_updatedAt']),
    );
  }
}

class ProductInfo {
  final WarehouseProduct warehouseProduct;
  final double distance;
  final String warehouseId;
  final String warehouseLogo;

  const ProductInfo({
    required this.warehouseProduct,
    required this.distance,
    required this.warehouseId,
    required this.warehouseLogo,
  });

  factory ProductInfo.fromJson(Map<String, dynamic> json) {
    return ProductInfo(
      warehouseProduct: json['warehouseProduct'],
      distance: json['distance'],
      warehouseId: json['warehouseId'],
      warehouseLogo: json['warehouseLogo'],
    );
  }
}
