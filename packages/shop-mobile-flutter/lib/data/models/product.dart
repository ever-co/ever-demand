import 'enums.dart';
import 'json.dart';

/// One `{ locale, value }` (texts) or `{ locale, url }` (images) entry.
class LocaleMember {
  const LocaleMember({required this.locale, required this.value});

  factory LocaleMember.fromJson(Json json) => LocaleMember(
        locale: readString(json, 'locale') ?? '',
        value: readString(json, 'value') ?? readString(json, 'url') ?? '',
      );

  final String locale;
  final String value;
}

class ProductImage {
  const ProductImage({
    required this.locale,
    required this.url,
    this.width,
    this.height,
    this.orientation = ImageOrientation.square,
  });

  factory ProductImage.fromJson(Json json) => ProductImage(
        locale: readString(json, 'locale') ?? '',
        url: readString(json, 'url') ?? '',
        width: readInt(json, 'width'),
        height: readInt(json, 'height'),
        orientation: readInt(json, 'orientation') ?? ImageOrientation.square,
      );

  final String locale;
  final String url;
  final int? width;
  final int? height;
  final int orientation;

  LocaleMember get asMember => LocaleMember(locale: locale, value: url);
}

class Product {
  const Product({
    required this.id,
    this.title = const <LocaleMember>[],
    this.description = const <LocaleMember>[],
    this.details = const <LocaleMember>[],
    this.images = const <ProductImage>[],
  });

  factory Product.fromJson(Json json) => Product(
        id: readId(json) ?? '',
        title: asJsonList(json['title']).map(LocaleMember.fromJson).toList(),
        description:
            asJsonList(json['description']).map(LocaleMember.fromJson).toList(),
        details: asJsonList(json['details']).map(LocaleMember.fromJson).toList(),
        images: asJsonList(json['images']).map(ProductImage.fromJson).toList(),
      );

  final String id;
  final List<LocaleMember> title;
  final List<LocaleMember> description;
  final List<LocaleMember> details;
  final List<ProductImage> images;

  List<LocaleMember> get imageMembers =>
      images.map((ProductImage i) => i.asMember).toList();
}

class WarehouseProduct {
  const WarehouseProduct({
    required this.id,
    required this.product,
    this.productId,
    this.price = 0,
    this.initialPrice,
    this.count = 0,
    this.soldCount = 0,
    this.isManufacturing = false,
    this.isCarrierRequired = false,
    this.isDeliveryRequired = false,
    this.isProductAvailable = true,
    this.isTakeaway = false,
    this.deliveryTimeMin,
    this.deliveryTimeMax,
  });

  factory WarehouseProduct.fromJson(Json json) {
    final Object? rawProduct = json['product'];
    final Product product = rawProduct is Map
        ? Product.fromJson(asJson(rawProduct))
        : Product(id: rawProduct?.toString() ?? '');
    return WarehouseProduct(
      id: readId(json) ?? '',
      product: product,
      productId: readString(json, 'productId') ?? product.id,
      price: readDouble(json, 'price') ?? 0,
      initialPrice: readDouble(json, 'initialPrice'),
      count: readInt(json, 'count') ?? 0,
      soldCount: readInt(json, 'soldCount') ?? 0,
      isManufacturing: readBool(json, 'isManufacturing'),
      isCarrierRequired: readBool(json, 'isCarrierRequired'),
      isDeliveryRequired: readBool(json, 'isDeliveryRequired'),
      isProductAvailable: readBool(json, 'isProductAvailable', fallback: true),
      isTakeaway: readBool(json, 'isTakeaway'),
      deliveryTimeMin: readInt(json, 'deliveryTimeMin'),
      deliveryTimeMax: readInt(json, 'deliveryTimeMax'),
    );
  }

  final String id;
  final Product product;
  final String? productId;
  final double price;
  final double? initialPrice;
  final int count;
  final int soldCount;
  final bool isManufacturing;
  final bool isCarrierRequired;
  final bool isDeliveryRequired;
  final bool isProductAvailable;
  final bool isTakeaway;
  final int? deliveryTimeMin;
  final int? deliveryTimeMax;

  /// Discount badge: the Ionic `floor((1 - price / initialPrice) * 100)`,
  /// 0 when none. Computed as `(initial - price) * 100 / initial`, so 8 of 10
  /// is 20 % (the Ionic float form floors 19.999… to 19).
  int get discountPercent {
    final double? initial = initialPrice;
    if (initial == null || initial <= 0 || initial == price) return 0;
    final int value = ((initial - price) * 100 / initial).floor();
    return value > 0 ? value : 0;
  }
}

/// A row of the product feed (`ProductInfo`).
class ProductInfo {
  const ProductInfo({
    required this.warehouseProduct,
    required this.warehouseId,
    this.warehouseLogo = '',
    this.distance = 0,
    this.soldOut = false,
  });

  factory ProductInfo.fromJson(Json json) => ProductInfo(
        warehouseProduct:
            WarehouseProduct.fromJson(asJson(json['warehouseProduct'])),
        warehouseId: readString(json, 'warehouseId') ?? '',
        warehouseLogo: readString(json, 'warehouseLogo') ?? '',
        distance: readDouble(json, 'distance') ?? 0,
      );

  final WarehouseProduct warehouseProduct;
  final String warehouseId;
  final String warehouseLogo;
  final double distance;

  /// Set by the client (failed buy, details lookup, live count 0).
  final bool soldOut;

  ProductInfo copyWith({bool? soldOut}) => ProductInfo(
        warehouseProduct: warehouseProduct,
        warehouseId: warehouseId,
        warehouseLogo: warehouseLogo,
        distance: distance,
        soldOut: soldOut ?? this.soldOut,
      );
}
