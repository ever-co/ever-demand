import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';

import '../models/enums.dart';
import 'key_value_store.dart';

/// The app state the Ionic `Store` keeps in `localStorage`, under the same
/// keys (see docs/latest-stack/shop-mobile-features.md §5). Reads and writes
/// are synchronous; listeners are notified once per microtask after writes,
/// so a write from `initState` never rebuilds widgets during a build.
class AppStore extends ChangeNotifier {
  AppStore(this._kv);

  final KeyValueStore _kv;
  bool _notifyScheduled = false;
  bool _disposed = false;

  // Orders with a card payment in flight. Memory only, so it never outlives
  // the app; shared by every payment widget (fleet fixes #1645/#1646).
  final Set<String> _payingOrderIds = <String>{};

  static const String kToken = 'token';
  static const String kUserId = '_userId';
  static const String kDeviceId = '_deviceId';
  static const String kInviteRequestId = '_inviteRequestId';
  static const String kInviteAddress = 'inviteAddress';
  static const String kInviteSystem = '_inviteSystem';
  static const String kRegistrationSystem = '_registrationSystem';
  static const String kLanguage = '_language';
  static const String kOrderId = '_orderId';
  static const String kOrderWarehouseId = '_currOrderWarehouseId';
  static const String kDeliveryType = 'deliveryType';
  static const String kStartDate = 'startDate';
  static const String kEndTime = 'endTime';
  static const String kInStore = 'inStore';
  static const String kBuyProduct = '_buyProduct';
  static const String kWarehouseId = '_warehouseId';
  static const String kBackToDetails = '_backToDetails';
  static const String kMaintenanceMode = 'maintenanceMode';
  static const String kServerConnection = 'serverConnection';
  static const String kDeviceUuid = '_deviceUuid';
  static const String kTenant = 'tenant';

  String? _get(String key) {
    final String? v = _kv.getString(key);
    return (v == null || v.isEmpty) ? null : v;
  }

  void _set(String key, String? value) {
    if (value == null || value.isEmpty) {
      _kv.remove(key);
    } else {
      _kv.setString(key, value);
    }
    _changed();
  }

  void _changed() {
    if (_notifyScheduled || _disposed) return;
    _notifyScheduled = true;
    scheduleMicrotask(() {
      _notifyScheduled = false;
      if (!_disposed) notifyListeners();
    });
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }

  String? get token => _get(kToken);
  set token(String? v) => _set(kToken, v);

  /// Tenant of a `?tenant=` link on the web build, kept for later visits
  /// (config/tenant.dart).
  String? get tenant => _get(kTenant);
  set tenant(String? v) => _set(kTenant, v);

  String? get userId => _get(kUserId);
  set userId(String? v) => _set(kUserId, v);

  String? get deviceId => _get(kDeviceId);
  set deviceId(String? v) => _set(kDeviceId, v);

  /// Random uuid used for `device.create` when FAKE_UUID is not set.
  String? get deviceUuid => _get(kDeviceUuid);
  set deviceUuid(String? v) => _set(kDeviceUuid, v);

  String? get inviteRequestId => _get(kInviteRequestId);
  set inviteRequestId(String? v) => _set(kInviteRequestId, v);

  String? get inviteAddress => _get(kInviteAddress);
  set inviteAddress(String? v) => _set(kInviteAddress, v);

  bool get inviteSystem => _get(kInviteSystem) == 'enabled';
  set inviteSystem(bool enabled) =>
      _set(kInviteSystem, enabled ? 'enabled' : 'disabled');

  /// `enabled`, `disabled` or `once` (see [RegistrationSystem]).
  String? get registrationSystem => _get(kRegistrationSystem);
  set registrationSystem(String? v) => _set(kRegistrationSystem, v);

  /// `en-US`, `bg-BG`, `he-IL`, `ru-RU`, `es-ES`, `fr-FR`.
  String? get language => _get(kLanguage);
  set language(String? v) => _set(kLanguage, v);

  String? get orderId => _get(kOrderId);
  set orderId(String? v) => _set(kOrderId, v);

  String? get orderWarehouseId => _get(kOrderWarehouseId);
  set orderWarehouseId(String? v) => _set(kOrderWarehouseId, v);

  /// `0` delivery (also when unset, as `Number(null)`), `1` takeaway.
  int get deliveryType => int.tryParse(_get(kDeliveryType) ?? '') ?? 0;
  set deliveryType(int v) => _set(kDeliveryType, '$v');

  bool get isDelivery => deliveryType == DeliveryType.delivery;

  /// When the open order's page was first shown (elapsed time start).
  DateTime? get startOrderDate {
    final String? raw = _get(kStartDate);
    if (raw == null) return null;
    try {
      final Object? decoded = jsonDecode(raw);
      return decoded is String ? DateTime.tryParse(decoded) : null;
    } on FormatException {
      return DateTime.tryParse(raw);
    }
  }

  set startOrderDate(DateTime? v) =>
      _set(kStartDate, v == null ? null : jsonEncode(v.toIso8601String()));

  /// Frozen elapsed time (`{ timePassed: 'mm : ss' }`) once delivered.
  String? get endOrderTime {
    final String? raw = _get(kEndTime);
    if (raw == null) return null;
    try {
      final Object? decoded = jsonDecode(raw);
      if (decoded is Map) return decoded['timePassed']?.toString();
      return decoded?.toString();
    } on FormatException {
      return raw;
    }
  }

  set endOrderTime(String? v) => _set(
        kEndTime,
        v == null ? null : jsonEncode(<String, String>{'timePassed': v}),
      );

  /// Merchant id while "in store" mode is on.
  String? get inStore => _get(kInStore);
  set inStore(String? v) => _set(kInStore, v);
  void clearInStore() => _set(kInStore, null);

  String? get buyProduct => _get(kBuyProduct);
  set buyProduct(String? v) => _set(kBuyProduct, v);

  String? get warehouseId => _get(kWarehouseId);
  set warehouseId(String? v) => _set(kWarehouseId, v);

  String? get backToDetails => _get(kBackToDetails);
  set backToDetails(String? v) => _set(kBackToDetails, v);

  /// `api` or the app type while a maintenance window is on.
  String? get maintenanceMode => _get(kMaintenanceMode);
  set maintenanceMode(String? v) => _set(kMaintenanceMode, v);
  void clearMaintenanceMode() => _set(kMaintenanceMode, null);

  /// HTTP status of the last failed server check; `0` = unreachable.
  /// Null when the last check passed.
  int? get serverConnection => int.tryParse(_get(kServerConnection) ?? '');
  set serverConnection(int? v) => _set(kServerConnection, v?.toString());

  bool get isServerDown => serverConnection == 0;

  bool get hasPendingOrder => orderId != null;

  /// Ends the open order locally (End / cancel / issue / finished order).
  void clearOrder() {
    _kv.remove(kStartDate);
    _kv.remove(kEndTime);
    _set(kOrderId, null);
  }

  /// Clears the elapsed-time keys only (takeaway page leave).
  void clearOrderTimes() {
    _kv.remove(kStartDate);
    _kv.remove(kEndTime);
    _changed();
  }

  bool isPaying(String? orderId) =>
      orderId != null && _payingOrderIds.contains(orderId);

  void startPaying(String orderId) {
    _payingOrderIds.add(orderId);
    _changed();
  }

  void stopPaying(String orderId) {
    _payingOrderIds.remove(orderId);
    _changed();
  }

  Future<void> clear() async {
    await _kv.clear();
    _changed();
  }
}
