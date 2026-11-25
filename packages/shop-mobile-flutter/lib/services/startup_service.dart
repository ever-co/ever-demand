import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import '../config/app_config.dart';
import '../data/models/enums.dart';
import '../data/models/user.dart';
import '../data/network/http_services.dart';
import '../data/repositories/shop_api.dart';
import '../data/store/app_store.dart';

/// The Ionic app's start-up (APP_INITIALIZERs + AppComponent), in order:
/// server check, maintenance check, server settings, device registration.
class StartupService {
  StartupService({
    required this.config,
    required this.store,
    required this.api,
    required this.http,
    required this.language,
    this.rpcTimeout = const Duration(seconds: 15),
    String Function()? platformType,
  }) : _platformType = platformType ?? _defaultPlatformType;

  final AppConfig config;
  final AppStore store;
  final ShopApi api;
  final HttpServices http;
  final String Function() language;
  final Duration rpcTimeout;
  final String Function() _platformType;

  static String _defaultPlatformType() {
    if (kIsWeb) return 'browser';
    return switch (defaultTargetPlatform) {
      TargetPlatform.android => 'android',
      TargetPlatform.iOS => 'ios',
      _ => 'browser',
    };
  }

  Future<void> run() async {
    await checkServer();
    await checkMaintenance();
    if (store.maintenanceMode == null && !store.isServerDown) {
      await loadServerSettings();
      await registerDevice();
    }
  }

  /// HTTP GET `SERVICES_ENDPOINT`: `serverConnection` = error status, `0`
  /// when unreachable, cleared when the server answers.
  Future<void> checkServer() async {
    store.serverConnection = await http.checkServerConnection();
  }

  Future<void> checkMaintenance() async {
    store.maintenanceMode = await http.maintenanceMode(
      config.settingsAppType,
      config.settingsMaintenanceApiUrl,
    );
  }

  /// `invite.getInvitesSettings()` and `user-auth.getRegistrationsSettings()`.
  /// The server not answering in time counts as down.
  Future<void> loadServerSettings() async {
    try {
      final bool invites =
          await api.invite.getInvitesSettings().timeout(rpcTimeout);
      final bool registrationRequired = await api.userAuth
          .getRegistrationRequiredOnStart()
          .timeout(rpcTimeout);
      store.inviteSystem = invites;
      store.registrationSystem = registrationRequired
          ? RegistrationSystem.enabled
          : RegistrationSystem.disabled;
    } on TimeoutException {
      store.serverConnection = 0;
    } on Object catch (e) {
      debugPrint('Could not load the server settings: $e');
    }
  }

  /// `device.create` once, when `_deviceId` is unset.
  Future<void> registerDevice() async {
    if (store.deviceId != null) return;
    String uuid = config.fakeUuid;
    if (uuid.isEmpty) {
      uuid = store.deviceUuid ?? const Uuid().v4();
      store.deviceUuid = uuid;
    }
    try {
      final Device device = await api.device
          .create(
            channelId: null,
            language: language(),
            type: _platformType(),
            uuid: uuid,
          )
          .timeout(rpcTimeout);
      store.deviceId = device.id;
    } on Object catch (e) {
      debugPrint('Could not register the device: $e');
    }
  }
}
