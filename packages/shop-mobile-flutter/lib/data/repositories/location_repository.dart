import 'dart:async';

import 'package:geolocator/geolocator.dart';

import '../../config/app_config.dart';
import '../models/geo.dart';
import '../models/user.dart';
import '../network/http_services.dart';
import '../store/app_store.dart';
import 'shop_api.dart';

class LocationUnavailableException implements Exception {
  const LocationUnavailableException([this.reason = "Can't detect location"]);

  final String reason;

  @override
  String toString() => reason;
}

/// Device GPS, behind an interface so tests never touch the plugin.
abstract interface class DeviceLocator {
  Future<Loc?> currentPosition({Duration timeout});
}

class GeolocatorDeviceLocator implements DeviceLocator {
  const GeolocatorDeviceLocator();

  @override
  Future<Loc?> currentPosition({
    Duration timeout = const Duration(seconds: 30),
  }) async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) return null;
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return null;
      }
      final Position p = await Geolocator.getCurrentPosition(
        locationSettings: LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: timeout,
        ),
      );
      return Loc(lng: p.longitude, lat: p.latitude);
    } on Object {
      return null;
    }
  }
}

/// Where the customer is, with the Ionic app's fallbacks
/// (`GeoLocationService.getCurrentCoords` and the feed's location rule).
class LocationRepository {
  LocationRepository({
    required this.config,
    required this.store,
    required this.api,
    required this.http,
    this.locator = const GeolocatorDeviceLocator(),
  });

  final AppConfig config;
  final AppStore store;
  final ShopApi api;
  final HttpServices http;
  final DeviceLocator locator;

  /// DEFAULT_LATITUDE/LONGITUDE when both are set (the device is never
  /// asked), else the device GPS, else the IP lookup.
  Future<Loc> currentLoc() async {
    if (config.hasDefaultLocation) {
      return Loc(lng: config.defaultLongitude!, lat: config.defaultLatitude!);
    }
    final Loc? device = await locator.currentPosition();
    if (device != null && device.lat != 0 && device.lng != 0) return device;
    final ({double lat, double lng})? ip = await http.locationByIp();
    if (ip != null) return Loc(lng: ip.lng, lat: ip.lat);
    throw const LocationUnavailableException();
  }

  /// Location for the product feed and the merchants list: in production a
  /// registered customer's saved address, otherwise [currentLoc].
  Future<Loc> customerLoc() async {
    final String? userId = store.userId;
    if (config.production && userId != null) {
      final User? user = await api.user.get(userId).first;
      final Loc? loc = user?.geoLocation?.loc;
      if (loc != null) return loc;
    }
    return currentLoc();
  }

  /// Device coordinates for the invite flows (no IP fallback, may be null).
  Future<Loc?> deviceOrDefaultLoc() async {
    if (config.hasDefaultLocation) {
      return Loc(lng: config.defaultLongitude!, lat: config.defaultLatitude!);
    }
    return locator.currentPosition();
  }
}
