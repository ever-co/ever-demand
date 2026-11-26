import 'package:flutter/foundation.dart';

/// The dev invite code from `FAKE_INVITE_*`: registers without a server-side
/// invite (it still calls `user-auth.register`).
@immutable
class FakeInvite {
  const FakeInvite({
    required this.id,
    required this.city,
    required this.postcode,
    required this.address,
    required this.house,
    required this.apartment,
    required this.code,
    required this.countryId,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String city;
  final String postcode;
  final String address;
  final String house;
  final String apartment;
  final int code;
  final int countryId;
  final String createdAt;
  final String updatedAt;
}

/// App configuration. Every value comes from `--dart-define` (or
/// `--dart-define-from-file`), with the same names and defaults as the Ionic
/// app's `scripts/env.ts`.
@immutable
class AppConfig {
  const AppConfig({
    this.production = false,
    this.gqlEndpoint = 'http://localhost:8443/graphql',
    this.gqlSubscriptionsEndpoint = 'ws://localhost:2086/subscriptions',
    this.servicesEndpoint = 'http://localhost:5500',
    this.productsViewType = 'slides',
    this.orderInfoType = 'page',
    this.companyName = 'Ever Co. LTD',
    this.defaultLanguage = 'en-US',
    this.defaultLocale = 'en-US',
    this.deliveryTimeMin = 30,
    this.deliveryTimeMax = 60,
    this.supportNumber = '0888888888',
    this.stripePublishableKey = '',
    this.defaultLatitude = 42.6459136,
    this.defaultLongitude = 23.3332736,
    this.fakeUuid = '',
    this.fakeInvite = defaultFakeInvite,
    this.settingsAppType = 'shop-mobile',
    this.settingsMaintenanceApiUrl = '',
    this.merchantIds = const <String>[],
    this.shoppingCart = false,
    this.mapsEnabled = true,
    this.mapTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    this.tenant = '',
    this.tenantBaseDomain = '',
  });

  /// Reads `--dart-define` values. On Android, `localhost` / `127.0.0.1` in
  /// the endpoints become `10.0.2.2` (the emulator's address of the host),
  /// unless `KEEP_LOCALHOST=true` (for `adb reverse` on a real device).
  factory AppConfig.fromEnvironment({TargetPlatform? platform}) {
    const String lat = String.fromEnvironment(
      'DEFAULT_LATITUDE',
      defaultValue: '42.6459136',
    );
    const String lng = String.fromEnvironment(
      'DEFAULT_LONGITUDE',
      defaultValue: '23.3332736',
    );
    const String merchantIds = String.fromEnvironment('MERCHANT_IDS');
    const bool keepLocalhost = bool.fromEnvironment('KEEP_LOCALHOST');
    final bool android = !kIsWeb &&
        (platform ?? defaultTargetPlatform) == TargetPlatform.android;
    String host(String url) =>
        android && !keepLocalhost ? emulatorHost(url) : url;

    return AppConfig(
      production: const bool.fromEnvironment('PRODUCTION'),
      gqlEndpoint: host(const String.fromEnvironment(
        'GQL_ENDPOINT',
        defaultValue: 'http://localhost:8443/graphql',
      )),
      gqlSubscriptionsEndpoint: host(const String.fromEnvironment(
        'GQL_SUBSCRIPTIONS_ENDPOINT',
        defaultValue: 'ws://localhost:2086/subscriptions',
      )),
      servicesEndpoint: host(const String.fromEnvironment(
        'SERVICES_ENDPOINT',
        defaultValue: 'http://localhost:5500',
      )),
      productsViewType: const String.fromEnvironment(
        'PRODUCTS_VIEW_TYPE',
        defaultValue: 'slides',
      ),
      orderInfoType: const String.fromEnvironment(
        'ORDER_INFO_TYPE',
        defaultValue: 'page',
      ),
      companyName: const String.fromEnvironment(
        'COMPANY_NAME',
        defaultValue: 'Ever Co. LTD',
      ),
      defaultLanguage: const String.fromEnvironment(
        'DEFAULT_LANGUAGE',
        defaultValue: 'en-US',
      ),
      defaultLocale: const String.fromEnvironment(
        'DEFAULT_LOCALE',
        defaultValue: 'en-US',
      ),
      deliveryTimeMin: const int.fromEnvironment(
        'DELIVERY_TIME_MIN',
        defaultValue: 30,
      ),
      deliveryTimeMax: const int.fromEnvironment(
        'DELIVERY_TIME_MAX',
        defaultValue: 60,
      ),
      supportNumber: const String.fromEnvironment(
        'SUPPORT_NUMBER',
        defaultValue: '0888888888',
      ),
      stripePublishableKey: const String.fromEnvironment(
        'STRIPE_PUBLISHABLE_KEY',
      ),
      defaultLatitude: double.tryParse(lat),
      defaultLongitude: double.tryParse(lng),
      fakeUuid: const String.fromEnvironment('FAKE_UUID'),
      fakeInvite: const FakeInvite(
        id: String.fromEnvironment(
          'FAKE_INVITE_ID',
          defaultValue: '1ae9d04f9010d834f8906881',
        ),
        city: String.fromEnvironment('FAKE_INVITE_CITY', defaultValue: 'Sofia'),
        postcode: String.fromEnvironment(
          'FAKE_INVITE_POSTCODE',
          defaultValue: '1700',
        ),
        address: String.fromEnvironment(
          'FAKE_INVITE_ADDRESS',
          defaultValue: 'Simeonovsko shose',
        ),
        house: String.fromEnvironment('FAKE_INVITE_HOUSE', defaultValue: '104'),
        apartment: String.fromEnvironment(
          'FAKE_INVITE_APARTMENT',
          defaultValue: '3',
        ),
        code: int.fromEnvironment('FAKE_INVITE_CODE', defaultValue: 8321),
        countryId: int.fromEnvironment(
          'FAKE_INVITE_COUNTRY_ID',
          defaultValue: 21,
        ),
        createdAt: String.fromEnvironment(
          'FAKE_INVITE_CREATED_AT',
          defaultValue: '2018-05-02T14:50:55.658Z',
        ),
        updatedAt: String.fromEnvironment(
          'FAKE_INVITE_UPDATED_AT',
          defaultValue: '2018-05-02T14:50:55.658Z',
        ),
      ),
      settingsAppType: const String.fromEnvironment(
        'SETTINGS_APP_TYPE',
        defaultValue: 'shop-mobile',
      ),
      settingsMaintenanceApiUrl: const String.fromEnvironment(
        'SETTINGS_MAINTENANCE_API_URL',
      ),
      merchantIds: merchantIds
          .split(',')
          .map((String s) => s.trim())
          .where((String s) => s.isNotEmpty)
          .toList(),
      shoppingCart: const bool.fromEnvironment('SHOPPING_CART'),
      mapsEnabled: const bool.fromEnvironment('MAPS_ENABLED', defaultValue: true),
      mapTileUrl: const String.fromEnvironment(
        'MAP_TILE_URL',
        defaultValue: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ),
      tenant: const String.fromEnvironment('TENANT').trim(),
      tenantBaseDomain: const String.fromEnvironment('TENANT_BASE_DOMAIN').trim(),
    );
  }

  static const FakeInvite defaultFakeInvite = FakeInvite(
    id: '1ae9d04f9010d834f8906881',
    city: 'Sofia',
    postcode: '1700',
    address: 'Simeonovsko shose',
    house: '104',
    apartment: '3',
    code: 8321,
    countryId: 21,
    createdAt: '2018-05-02T14:50:55.658Z',
    updatedAt: '2018-05-02T14:50:55.658Z',
  );

  /// `localhost` / `127.0.0.1` → `10.0.2.2`.
  static String emulatorHost(String url) {
    final Uri? uri = Uri.tryParse(url);
    if (uri == null) return url;
    if (uri.host == 'localhost' || uri.host == '127.0.0.1') {
      return uri.replace(host: '10.0.2.2').toString();
    }
    return url;
  }

  final bool production;
  final String gqlEndpoint;
  final String gqlSubscriptionsEndpoint;
  final String servicesEndpoint;

  /// `slides` or `list`.
  final String productsViewType;

  /// `page` or `popup`.
  final String orderInfoType;
  final String companyName;
  final String defaultLanguage;
  final String defaultLocale;
  final int deliveryTimeMin;
  final int deliveryTimeMax;

  /// Side menu "Call us"; the item hides when empty.
  final String supportNumber;
  final String stripePublishableKey;

  /// When both are set the app never asks the device for its location.
  final double? defaultLatitude;
  final double? defaultLongitude;

  /// Device uuid for `device.create`; empty = a random uuid kept in storage.
  final String fakeUuid;
  final FakeInvite? fakeInvite;
  final String settingsAppType;
  final String settingsMaintenanceApiUrl;

  /// "Single merchant" mode: the feed shows only these merchants.
  final List<String> merchantIds;
  final bool shoppingCart;

  /// Order maps (OpenStreetMap tiles through flutter_map). Off in tests.
  final bool mapsEnabled;
  final String mapTileUrl;

  /// White-label build: this shop's tenant (slug or 24-hex id), sent to the
  /// API as `Tenant-Id` and in every socket handshake. Empty: resolved at
  /// runtime (config/tenant.dart).
  final String tenant;

  /// Parent domain of tenant hosts (`<slug>.everdemand.co`, web build);
  /// empty = not used.
  final String tenantBaseDomain;

  bool get hasDefaultLocation =>
      defaultLatitude != null &&
      defaultLongitude != null &&
      defaultLatitude != 0 &&
      defaultLongitude != 0;

  bool get isPopupOrderInfo => orderInfoType == 'popup';

  bool get isSlidesView => productsViewType != 'list';

  AppConfig copyWith({
    bool? production,
    String? productsViewType,
    String? orderInfoType,
    String? supportNumber,
    String? stripePublishableKey,
    double? defaultLatitude,
    double? defaultLongitude,
    bool clearDefaultLocation = false,
    List<String>? merchantIds,
    bool? shoppingCart,
    bool? mapsEnabled,
    String? settingsMaintenanceApiUrl,
    String? defaultLanguage,
    String? servicesEndpoint,
    String? tenant,
    String? tenantBaseDomain,
  }) =>
      AppConfig(
        production: production ?? this.production,
        gqlEndpoint: gqlEndpoint,
        gqlSubscriptionsEndpoint: gqlSubscriptionsEndpoint,
        servicesEndpoint: servicesEndpoint ?? this.servicesEndpoint,
        productsViewType: productsViewType ?? this.productsViewType,
        orderInfoType: orderInfoType ?? this.orderInfoType,
        companyName: companyName,
        defaultLanguage: defaultLanguage ?? this.defaultLanguage,
        defaultLocale: defaultLocale,
        deliveryTimeMin: deliveryTimeMin,
        deliveryTimeMax: deliveryTimeMax,
        supportNumber: supportNumber ?? this.supportNumber,
        stripePublishableKey: stripePublishableKey ?? this.stripePublishableKey,
        defaultLatitude: clearDefaultLocation
            ? null
            : (defaultLatitude ?? this.defaultLatitude),
        defaultLongitude: clearDefaultLocation
            ? null
            : (defaultLongitude ?? this.defaultLongitude),
        fakeUuid: fakeUuid,
        fakeInvite: fakeInvite,
        settingsAppType: settingsAppType,
        settingsMaintenanceApiUrl:
            settingsMaintenanceApiUrl ?? this.settingsMaintenanceApiUrl,
        merchantIds: merchantIds ?? this.merchantIds,
        shoppingCart: shoppingCart ?? this.shoppingCart,
        mapsEnabled: mapsEnabled ?? this.mapsEnabled,
        mapTileUrl: mapTileUrl,
        tenant: tenant ?? this.tenant,
        tenantBaseDomain: tenantBaseDomain ?? this.tenantBaseDomain,
      );
}
