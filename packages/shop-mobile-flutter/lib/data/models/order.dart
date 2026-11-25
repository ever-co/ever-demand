import 'enums.dart';
import 'geo.dart';
import 'json.dart';
import 'product.dart';
import 'warehouse.dart';

class OrderProduct {
  const OrderProduct({
    required this.id,
    required this.product,
    this.count = 1,
    this.price = 0,
    this.initialPrice,
    this.isTakeaway = false,
    this.isDeliveryRequired = false,
    this.deliveryTimeMin,
    this.deliveryTimeMax,
    this.comment,
  });

  factory OrderProduct.fromJson(Json json) {
    final Object? rawProduct = json['product'];
    return OrderProduct(
      id: readId(json) ?? '',
      product: rawProduct is Map
          ? Product.fromJson(asJson(rawProduct))
          : Product(id: rawProduct?.toString() ?? ''),
      count: readInt(json, 'count') ?? 1,
      price: readDouble(json, 'price') ?? 0,
      initialPrice: readDouble(json, 'initialPrice'),
      isTakeaway: readBool(json, 'isTakeaway'),
      isDeliveryRequired: readBool(json, 'isDeliveryRequired'),
      deliveryTimeMin: readInt(json, 'deliveryTimeMin'),
      deliveryTimeMax: readInt(json, 'deliveryTimeMax'),
      comment: readString(json, 'comment'),
    );
  }

  /// The order product id (`_id`). Empty on GraphQL history rows, which do
  /// not select it (see the inventory quirk in docs/latest-stack).
  final String id;
  final Product product;
  final int count;
  final double price;
  final double? initialPrice;
  final bool isTakeaway;
  final bool isDeliveryRequired;
  final int? deliveryTimeMin;
  final int? deliveryTimeMax;
  final String? comment;
}

class Carrier {
  const Carrier({required this.id, this.firstName, this.lastName, this.phone, this.geoLocation});

  factory Carrier.fromJson(Json json) => Carrier(
        id: readId(json) ?? '',
        firstName: readString(json, 'firstName'),
        lastName: readString(json, 'lastName'),
        phone: readString(json, 'phone'),
        geoLocation: json['geoLocation'] is Map
            ? GeoLocation.fromJson(asJson(json['geoLocation']))
            : null,
      );

  final String id;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final GeoLocation? geoLocation;
}

class OrderUser {
  const OrderUser({required this.id, this.geoLocation});

  factory OrderUser.fromJson(Json json) => OrderUser(
        id: readId(json) ?? '',
        geoLocation: json['geoLocation'] is Map
            ? GeoLocation.fromJson(asJson(json['geoLocation']))
            : null,
      );

  final String id;
  final GeoLocation? geoLocation;
}

class Order {
  const Order({
    required this.id,
    this.warehouseId = '',
    this.warehouse,
    this.user,
    this.carrier,
    this.products = const <OrderProduct>[],
    this.isConfirmed = false,
    this.isCancelled = false,
    this.isPaid = false,
    this.isCompleted = false,
    this.waitForCompletion = false,
    this.warehouseStatus = OrderWarehouseStatus.noStatus,
    this.carrierStatus = OrderCarrierStatus.noCarrier,
    this.orderNumber,
    this.orderType,
    this.createdAt,
    this.deliveryTime,
    int? status,
  }) : _status = status;

  factory Order.fromJson(Json json) {
    final Object? rawWarehouse = json['warehouse'];
    final Object? rawCarrier = json['carrier'];
    final Object? rawUser = json['user'];
    return Order(
      id: readId(json) ?? '',
      warehouseId: readString(json, 'warehouseId') ??
          readRefId(json, 'warehouse') ??
          '',
      warehouse: rawWarehouse is Map ? Warehouse.fromJson(asJson(rawWarehouse)) : null,
      user: rawUser is Map ? OrderUser.fromJson(asJson(rawUser)) : null,
      carrier: rawCarrier is Map
          ? Carrier.fromJson(asJson(rawCarrier))
          : (rawCarrier is String ? Carrier(id: rawCarrier) : null),
      products: asJsonList(json['products']).map(OrderProduct.fromJson).toList(),
      isConfirmed: readBool(json, 'isConfirmed'),
      isCancelled: readBool(json, 'isCancelled'),
      isPaid: readBool(json, 'isPaid'),
      isCompleted: readBool(json, 'isCompleted'),
      waitForCompletion: readBool(json, 'waitForCompletion'),
      warehouseStatus:
          readInt(json, 'warehouseStatus') ?? OrderWarehouseStatus.noStatus,
      carrierStatus:
          readInt(json, 'carrierStatus') ?? OrderCarrierStatus.noCarrier,
      orderNumber: readInt(json, 'orderNumber'),
      orderType: readInt(json, 'orderType'),
      createdAt: readDate(json, 'createdAt') ?? readDate(json, '_createdAt'),
      deliveryTime: readDate(json, 'deliveryTime'),
      status: readInt(json, 'status'),
    );
  }

  final String id;
  final String warehouseId;
  final Warehouse? warehouse;
  final OrderUser? user;
  final Carrier? carrier;
  final List<OrderProduct> products;
  final bool isConfirmed;
  final bool isCancelled;
  final bool isPaid;
  final bool isCompleted;
  final bool waitForCompletion;
  final int warehouseStatus;
  final int carrierStatus;
  final int? orderNumber;
  final int? orderType;
  final DateTime? createdAt;
  final DateTime? deliveryTime;
  final int? _status;

  /// Σ count × price, as `Order.totalPrice` on the server entity.
  double get totalPrice => products.fold<double>(
        0,
        (double sum, OrderProduct p) => sum + p.count * p.price,
      );

  /// `Order.status`: the payload value (GraphQL selects it) or the value the
  /// server entity computes from the carrier and warehouse statuses.
  int get status {
    final int? fromPayload = _status;
    if (fromPayload != null) return fromPayload;
    if (carrier == null ||
        carrierStatus <= OrderCarrierStatus.carrierPickedUpOrder) {
      if (warehouseStatus >= 200) return OrderStatus.warehouseIssue;
      if (isCancelled) return OrderStatus.canceledWhileWarehousePreparation;
      return OrderStatus.warehousePreparation;
    }
    if (carrierStatus >= 200) return OrderStatus.carrierIssue;
    if (isCancelled) return OrderStatus.canceledWhileInDelivery;
    if (isPaid && carrierStatus == OrderCarrierStatus.deliveryCompleted) {
      return OrderStatus.delivered;
    }
    return OrderStatus.inDelivery;
  }

  bool get isCanceledStatus =>
      status == OrderStatus.canceledWhileInDelivery ||
      status == OrderStatus.canceledWhileWarehousePreparation;

  bool get isFailedStatus =>
      status == OrderStatus.carrierIssue || status == OrderStatus.warehouseIssue;

  bool get inProcessing => status < OrderStatus.delivered;

  bool get isTakeaway => products.any((OrderProduct p) => p.isTakeaway);

  /// Tracking step shown on the order pages.
  DeliveryStep get deliveryStep {
    if (isCompleted && !isCancelled) return DeliveryStep.completed;
    if (carrierStatus >= OrderCarrierStatus.carrierArrivedToCustomer) {
      return DeliveryStep.customer;
    }
    if (carrierStatus >= OrderCarrierStatus.carrierPickedUpOrder) {
      return DeliveryStep.carrier;
    }
    return DeliveryStep.warehouse;
  }

  bool get issuesDuringDelivery =>
      carrierStatus >= OrderCarrierStatus.issuesDuringDelivery;

  bool get issuesDuringWarehouseProcessing =>
      warehouseStatus >= OrderWarehouseStatus.allocationFailed;

  bool get hasIssues => issuesDuringDelivery || issuesDuringWarehouseProcessing;

  /// "min-max" minutes from the products, as the order pages show it.
  String deliveryTimeRange({int defaultMin = 30, int defaultMax = 60}) {
    int min = 0;
    int max = 0;
    for (final OrderProduct p in products) {
      final int? pMin = p.deliveryTimeMin;
      final int? pMax = p.deliveryTimeMax;
      if (pMin != null && pMin > min) min = pMin;
      if (pMax != null && pMax > max) max = pMax;
    }
    if (min != 0 && max != 0) return '$min-$max';
    if (min != 0) return '$min';
    if (max != 0) return '$max';
    return '$defaultMin-$defaultMax';
  }

  /// `getIdFromTheDate(order)`: `ddMMyyyy-orderNumber` in local time.
  String? get shortId {
    final DateTime? created = createdAt?.toLocal();
    final int? number = orderNumber;
    if (created == null || number == null) return null;
    String two(int v) => v.toString().padLeft(2, '0');
    return '${two(created.day)}${two(created.month)}${created.year}-$number';
  }

  /// `Order.getStatusText(language)` from packages/common (hard-coded texts).
  String statusText(String language) {
    final List<String>? texts = _statusTexts[language];
    if (texts == null) return 'BAD_STATUS';
    switch (status) {
      case OrderStatus.warehousePreparation:
        return texts[0];
      case OrderStatus.inDelivery:
        return texts[1];
      case OrderStatus.delivered:
        return texts[2];
      case OrderStatus.canceledWhileWarehousePreparation:
      case OrderStatus.canceledWhileInDelivery:
        return texts[3];
      case OrderStatus.warehouseIssue:
        return texts[4];
      case OrderStatus.carrierIssue:
        return texts[5];
      default:
        return texts[6];
    }
  }

  Order copyWith({List<OrderProduct>? products}) => Order(
        id: id,
        warehouseId: warehouseId,
        warehouse: warehouse,
        user: user,
        carrier: carrier,
        products: products ?? this.products,
        isConfirmed: isConfirmed,
        isCancelled: isCancelled,
        isPaid: isPaid,
        isCompleted: isCompleted,
        waitForCompletion: waitForCompletion,
        warehouseStatus: warehouseStatus,
        carrierStatus: carrierStatus,
        orderNumber: orderNumber,
        orderType: orderType,
        createdAt: createdAt,
        deliveryTime: deliveryTime,
        status: _status,
      );
}

const Map<String, List<String>> _statusTexts = <String, List<String>>{
  'en-US': <String>[
    'Preparation',
    'In Delivery',
    'Delivered',
    'Cancelled',
    'Preparation Issue',
    'Delivery Issue',
    'BAD_STATUS',
  ],
  'bg-BG': <String>[
    'Подготовка',
    'Доставя се',
    'Доставено',
    'Отказана',
    'Проблем при подготовката',
    'Проблем при доставката',
    'Проблем с поръчката',
  ],
  'he-IL': <String>[
    'בהכנה',
    'במשלוח',
    'הסתיים בצלחה',
    'התבטל',
    'בעייה בהכנה',
    'בעייה במשלוח',
    'BAD_STATUS',
  ],
  'ru-RU': <String>[
    'В подготовке',
    'В доставки',
    'Доставлено',
    'Отменено',
    'Проблема с подготовкой',
    'Проблема с доставкой',
    'BAD_STATUS',
  ],
  'es-ES': <String>[
    'Preparación',
    'En la entrega',
    'Entregado',
    'Cancelado',
    'Problema de preparación',
    'Problema de envio',
    'BAD_STATUS',
  ],
  'fr-FR': <String>[
    'Preparation',
    'En Livraison',
    'livré',
    'Annulé',
    'Problème de préparation',
    'Problème de livraison',
    'BAD_STATUS',
  ],
};
