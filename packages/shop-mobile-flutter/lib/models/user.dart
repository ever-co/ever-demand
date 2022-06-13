import 'package:shop_flutter_mobile/models/device.dart';
import 'package:shop_flutter_mobile/models/geolocation.dart';

class User {
  final String? typename;
  final String id;
  final GeoLocation geoLocation;
  final String apartment;
  final String? firstName;
  final String? lastName;
  final String? email;
  final String? phone;
  final List<String>? devicesIds;
  final List<Device> devices;
  final String? image;
  final String? fullAddress;
  final DateTime? createdAt;
  final bool isBanned;

  const User({
    this.typename,
    required this.id,
    required this.geoLocation,
    required this.apartment,
    this.firstName,
    this.lastName,
    this.email,
    this.phone,
    this.devicesIds,
    required this.devices,
    this.image,
    this.fullAddress,
    this.createdAt,
    required this.isBanned,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      typename: json['__typename'],
      id: json['_id'],
      geoLocation: json['geoLocation'],
      apartment: json['apartment'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      email: json['email'],
      phone: json['phone'],
      devicesIds: json['devicesIds'],
      devices: json['devices'],
      image: json['image'],
      fullAddress: json['fullAddress'],
      createdAt: DateTime.parse(json['_createdAt']),
      isBanned: json['isBanned'] as bool,
    );
  }
}

class UserLogin {
  final String? typename;
  final User user;
  final String token;

  const UserLogin({
    this.typename,
    required this.user,
    required this.token,
  });

  factory UserLogin.fromJson(Map<String, dynamic> json) {
    return UserLogin(
      typename: json['__typename'],
      user: json['user'],
      token: json['token'],
    );
  }
}
