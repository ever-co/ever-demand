import 'dart:ui';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'config/app_config.dart';
import 'core/languages.dart';
import 'data/models/order.dart';
import 'data/models/warehouse.dart';
import 'data/network/graphql/graphql_service.dart';
import 'data/network/http_services.dart';
import 'data/network/pyro/pyro_router.dart';
import 'data/repositories/location_repository.dart';
import 'data/repositories/merchants_repository.dart';
import 'data/repositories/orders_repository.dart';
import 'data/repositories/products_repository.dart';
import 'data/repositories/shop_api.dart';
import 'data/store/app_store.dart';
import 'platform/platform_services.dart';
import 'services/invite_service.dart';
import 'services/order_flow_service.dart';
import 'services/session_service.dart';
import 'services/startup_service.dart';

// Roots: overridden in main.dart (and in tests).
final Provider<AppConfig> appConfigProvider =
    Provider<AppConfig>((Ref ref) => const AppConfig());

final Provider<AppStore> appStoreProvider = Provider<AppStore>(
  (Ref ref) => throw UnimplementedError('appStoreProvider is set in main()'),
);

// Transport
final Provider<PyroClient> pyroClientProvider = Provider<PyroClient>((Ref ref) {
  final PyroClient client =
      PyroClient(ref.watch(appConfigProvider).servicesEndpoint);
  ref.onDispose(client.dispose);
  return client;
});

final Provider<ShopApi> shopApiProvider =
    Provider<ShopApi>((Ref ref) => ShopApi(ref.watch(pyroClientProvider)));

final Provider<GraphQLService> graphQLServiceProvider =
    Provider<GraphQLService>((Ref ref) {
  final AppConfig config = ref.watch(appConfigProvider);
  final AppStore store = ref.watch(appStoreProvider);
  return GraphQLClientService(
    httpEndpoint: config.gqlEndpoint,
    subscriptionsEndpoint: config.gqlSubscriptionsEndpoint,
    token: () => store.token,
  );
});

final Provider<HttpServices> httpServicesProvider = Provider<HttpServices>(
  (Ref ref) => HttpServices(
    servicesEndpoint: ref.watch(appConfigProvider).servicesEndpoint,
  ),
);

// Platform
final Provider<DeviceLocator> deviceLocatorProvider =
    Provider<DeviceLocator>((Ref ref) => const GeolocatorDeviceLocator());

final Provider<PhoneDialer> phoneDialerProvider =
    Provider<PhoneDialer>((Ref ref) => const UrlLauncherDialer());

final Provider<ConnectivityWatcher> connectivityWatcherProvider =
    Provider<ConnectivityWatcher>((Ref ref) => ConnectivityPlusWatcher());

final Provider<CardTokenizer> cardTokenizerProvider = Provider<CardTokenizer>(
  (Ref ref) =>
      StripeCardTokenizer(ref.watch(appConfigProvider).stripePublishableKey),
);

// Repositories
final Provider<ProductsRepository> productsRepositoryProvider =
    Provider<ProductsRepository>(
  (Ref ref) => ProductsRepository(
    ref.watch(graphQLServiceProvider),
    ref.watch(shopApiProvider),
  ),
);

final Provider<MerchantsRepository> merchantsRepositoryProvider =
    Provider<MerchantsRepository>(
  (Ref ref) => MerchantsRepository(
    ref.watch(graphQLServiceProvider),
    ref.watch(shopApiProvider),
  ),
);

final Provider<OrdersRepository> ordersRepositoryProvider =
    Provider<OrdersRepository>(
  (Ref ref) => OrdersRepository(
    ref.watch(graphQLServiceProvider),
    ref.watch(shopApiProvider),
  ),
);

final Provider<LocationRepository> locationRepositoryProvider =
    Provider<LocationRepository>(
  (Ref ref) => LocationRepository(
    config: ref.watch(appConfigProvider),
    store: ref.watch(appStoreProvider),
    api: ref.watch(shopApiProvider),
    http: ref.watch(httpServicesProvider),
    locator: ref.watch(deviceLocatorProvider),
  ),
);

// Services
final Provider<SessionService> sessionServiceProvider =
    Provider<SessionService>(
  (Ref ref) => SessionService(
    ref.watch(appStoreProvider),
    ref.watch(shopApiProvider),
  ),
);

final Provider<StartupService> startupServiceProvider =
    Provider<StartupService>(
  (Ref ref) => StartupService(
    config: ref.watch(appConfigProvider),
    store: ref.watch(appStoreProvider),
    api: ref.watch(shopApiProvider),
    http: ref.watch(httpServicesProvider),
    language: () => ref.read(languageProvider),
  ),
);

final Provider<InviteService> inviteServiceProvider = Provider<InviteService>(
  (Ref ref) => InviteService(
    config: ref.watch(appConfigProvider),
    store: ref.watch(appStoreProvider),
    api: ref.watch(shopApiProvider),
    location: ref.watch(locationRepositoryProvider),
    orders: ref.watch(ordersRepositoryProvider),
  ),
);

final Provider<OrderFlowService> orderFlowServiceProvider =
    Provider<OrderFlowService>(
  (Ref ref) => OrderFlowService(
    config: ref.watch(appConfigProvider),
    store: ref.watch(appStoreProvider),
    api: ref.watch(shopApiProvider),
    orders: ref.watch(ordersRepositoryProvider),
  ),
);

// App language (`_language`), applied to MaterialApp.locale.
class LanguageController extends Notifier<String> {
  @override
  String build() {
    final AppStore store = ref.watch(appStoreProvider);
    final AppConfig config = ref.watch(appConfigProvider);
    return resolveStartLanguage(
      saved: store.language,
      defaultLanguage: config.defaultLanguage,
      deviceLocale: PlatformDispatcher.instance.locale,
    );
  }

  void set(String language) {
    if (!appLanguages.contains(language)) return;
    ref.read(appStoreProvider).language = language;
    state = language;
  }
}

final NotifierProvider<LanguageController, String> languageProvider =
    NotifierProvider<LanguageController, String>(LanguageController.new);

/// Live order (`order.get(orderId, { populateWarehouse, populateCarrier })`).
final liveOrderProvider = StreamProvider.autoDispose.family<Order?, String>(
  (Ref ref, String orderId) =>
      ref.watch(ordersRepositoryProvider).watchOrder(orderId),
);

/// Live merchant (`warehouse.get(id)`), used for `isPaymentEnabled`, the store
/// header and the menu.
final liveWarehouseProvider = StreamProvider.autoDispose.family<Warehouse?, String>(
  (Ref ref, String warehouseId) => ref
      .watch(merchantsRepositoryProvider)
      .watchWarehouse(warehouseId, fullProducts: false),
);
