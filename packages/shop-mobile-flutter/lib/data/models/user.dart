import 'geo.dart';
import 'json.dart';

class User {
  const User({required this.id, this.email, this.apartment, this.geoLocation});

  factory User.fromJson(Json json) => User(
        id: readId(json) ?? '',
        email: readString(json, 'email'),
        apartment: readString(json, 'apartment'),
        geoLocation: json['geoLocation'] is Map
            ? GeoLocation.fromJson(asJson(json['geoLocation']))
            : null,
      );

  final String id;
  final String? email;
  final String? apartment;
  final GeoLocation? geoLocation;
}

class Device {
  const Device({required this.id, this.language, this.type, this.uuid});

  factory Device.fromJson(Json json) => Device(
        id: readId(json) ?? '',
        language: readString(json, 'language'),
        type: readString(json, 'type'),
        uuid: readString(json, 'uuid'),
      );

  final String id;
  final String? language;
  final String? type;
  final String? uuid;
}

/// A saved Stripe card (`Stripe.Card`); the app reads `id` and `last4`.
class PaymentCard {
  const PaymentCard({required this.id, required this.last4, this.brand});

  factory PaymentCard.fromJson(Json json) => PaymentCard(
        id: readId(json) ?? '',
        last4: readString(json, 'last4') ?? '',
        brand: readString(json, 'brand'),
      );

  final String id;
  final String last4;
  final String? brand;
}
