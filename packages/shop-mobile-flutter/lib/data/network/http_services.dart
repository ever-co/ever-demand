import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

/// One entry of the maintenance JSON (`{ maintenance: [...] }`).
class MaintenanceInfo {
  const MaintenanceInfo({
    required this.type,
    required this.status,
    this.message = '',
  });

  factory MaintenanceInfo.fromJson(Map<String, dynamic> json) =>
      MaintenanceInfo(
        type: '${json['type'] ?? ''}',
        status: json['status'] == true,
        message: '${json['message'] ?? ''}',
      );

  final String type;
  final bool status;
  final String message;
}

/// Plain HTTP calls of the shop app: server-up check, maintenance status and
/// the IP geolocation fallback.
class HttpServices {
  HttpServices({required this.servicesEndpoint, http.Client? client})
      : _client = client ?? http.Client();

  final String servicesEndpoint;
  final http.Client _client;

  static const Duration _timeout = Duration(seconds: 10);

  /// `ServerConnectionService.checkServerConnection`: null when the server
  /// answered 2xx, its HTTP status on an error status, `0` when unreachable.
  Future<int?> checkServerConnection() async {
    try {
      final http.Response res =
          await _client.get(Uri.parse(servicesEndpoint)).timeout(_timeout);
      if (res.statusCode >= 200 && res.statusCode < 300) return null;
      return res.statusCode;
    } on Object {
      return 0;
    }
  }

  Future<List<MaintenanceInfo>> getMaintenanceInfo(String url) async {
    final http.Response res = await _client
        .get(
          Uri.parse(url),
          headers: const <String, String>{'Content-Type': 'application/json'},
        )
        .timeout(_timeout);
    final Object? body = jsonDecode(res.body);
    final Object? list = body is Map ? body['maintenance'] : null;
    if (list is! List) return const <MaintenanceInfo>[];
    return list
        .whereType<Map<dynamic, dynamic>>()
        .map((Map<dynamic, dynamic> m) =>
            MaintenanceInfo.fromJson(m.cast<String, dynamic>()))
        .toList();
  }

  /// `MaintenanceService.load`: the type in maintenance (`api` first, then
  /// [appType]) or null. Any error means "no maintenance".
  Future<String?> maintenanceMode(String appType, String url) async {
    if (url.isEmpty) return null;
    try {
      final List<MaintenanceInfo> info = await getMaintenanceInfo(url);
      for (final String type in <String>['api', appType]) {
        for (final MaintenanceInfo m in info) {
          if (m.type == type && m.status) return m.type;
        }
      }
      return null;
    } on Object {
      return null;
    }
  }

  /// `MaintenanceService.getMessage(type)`.
  Future<String?> maintenanceMessage(String type, String url) async {
    try {
      final List<MaintenanceInfo> info = await getMaintenanceInfo(url);
      for (final MaintenanceInfo m in info) {
        if (m.type == type) return m.message;
      }
    } on Object {
      // Same as the Ionic service: no message.
    }
    return null;
  }

  /// `MaintenanceService.getStatus(appType)`: `api.status && app.status`;
  /// null when it cannot tell.
  Future<bool?> maintenanceStatus(String appType, String url) async {
    try {
      final List<MaintenanceInfo> info = await getMaintenanceInfo(url);
      MaintenanceInfo? find(String t) {
        for (final MaintenanceInfo m in info) {
          if (m.type == t) return m;
        }
        return null;
      }

      final MaintenanceInfo? api = find('api');
      final MaintenanceInfo? app = find(appType);
      if (api == null || app == null) return null;
      return api.status && app.status;
    } on Object {
      return null;
    }
  }

  /// `GET ${SERVICES_ENDPOINT}/getLocationByIP` → `{ latitude, longitude }`.
  Future<({double lat, double lng})?> locationByIp() async {
    try {
      final http.Response res = await _client
          .get(Uri.parse('$servicesEndpoint/getLocationByIP'))
          .timeout(_timeout);
      if (res.statusCode != 200 || res.body.isEmpty) return null;
      final Object? body = jsonDecode(res.body);
      if (body is Map && body['latitude'] is num && body['longitude'] is num) {
        return (
          lat: (body['latitude'] as num).toDouble(),
          lng: (body['longitude'] as num).toDouble(),
        );
      }
    } on Object {
      // Fall through: no location.
    }
    return null;
  }
}
