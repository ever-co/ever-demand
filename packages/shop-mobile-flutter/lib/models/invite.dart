import 'package:shop_flutter_mobile/models/geolocation.dart';

class Invite {
  final String? typename;
  final String id;
  final String code;
  final String apartment;
  final GeoLocation geoLocation;

  const Invite({
    this.typename,
    required this.id,
    required this.code,
    required this.apartment,
    required this.geoLocation,
  });

  factory Invite.fromJson(Map<String, dynamic> json) {
    return Invite(
      typename: json['__typename'],
      id: json['_id'],
      code: json['code'],
      apartment: json['apartment'],
      geoLocation: json['geoLocation'],
    );
  }
}

class NewInvite {
  final String? typename;
  final String id;
  final dynamic apartment;
  final dynamic code;
  final GeoLocation geoLocation;

  const NewInvite({
    this.typename,
    required this.id,
    required this.apartment,
    required this.code,
    required this.geoLocation,
  });

  factory NewInvite.fromJson(Map<String, dynamic> json) {
    return NewInvite(
      typename: json['__typename'],
      id: json['_id'],
      apartment: json['apartment'],
      code: json['code'],
      geoLocation: json['geoLocation'],
    );
  }
}
