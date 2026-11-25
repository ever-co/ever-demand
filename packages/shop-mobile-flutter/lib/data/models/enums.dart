// Numeric enums shared with the API (packages/common/src/enums). The values
// travel as plain integers, so they are kept as int constants here.

/// `DeliveryType`: how the customer gets an order.
abstract final class DeliveryType {
  static const int delivery = 0;
  static const int takeaway = 1;
}

/// `OrderStatus`: combined status computed from carrier and warehouse status.
abstract final class OrderStatus {
  static const int warehousePreparation = 0;
  static const int inDelivery = 1;
  static const int delivered = 2;
  static const int canceledWhileWarehousePreparation = 200;
  static const int canceledWhileInDelivery = 201;
  static const int warehouseIssue = 202;
  static const int carrierIssue = 203;
}

/// `OrderCarrierStatus`.
abstract final class OrderCarrierStatus {
  static const int noCarrier = 0;
  static const int carrierSelectedOrder = 1;
  static const int carrierPickedUpOrder = 2;
  static const int carrierStartDelivery = 3;
  static const int carrierArrivedToCustomer = 4;
  static const int deliveryCompleted = 5;
  static const int issuesDuringDelivery = 204;
  static const int clientRefuseTakingOrder = 205;
}

/// `OrderWarehouseStatus`.
abstract final class OrderWarehouseStatus {
  static const int noStatus = 0;
  static const int readyForProcessing = 1;
  static const int warehouseStartedProcessing = 2;
  static const int allocationStarted = 3;
  static const int allocationFinished = 4;
  static const int packagingStarted = 5;
  static const int packagingFinished = 6;
  static const int givenToCarrier = 7;
  static const int givenToCustomer = 8;
  static const int allocationFailed = 200;
  static const int packagingFailed = 201;
}

/// `OrderBarcodeTypes`: how a takeaway order code is rendered.
abstract final class OrderBarcodeType {
  static const int qr = 0;
  static const int code128 = 1;
  static const int code39 = 2;
  static const int pharmacode = 3;
  static const int msi = 4;
}

/// `RegistrationSystem` as stored in `_registrationSystem`.
abstract final class RegistrationSystem {
  static const String enabled = 'enabled';
  static const String disabled = 'disabled';
  static const String once = 'once';
}

/// Order tracking step on the order pages (`DeliveryStatus` in the Ionic app).
enum DeliveryStep { warehouse, carrier, customer, completed }

/// Product image orientation values (`IProductImage.orientation`).
abstract final class ImageOrientation {
  static const int square = 0;
  static const int vertical = 1;
  static const int horizontal = 2;
}
