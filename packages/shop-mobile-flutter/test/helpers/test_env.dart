import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart' show Override;
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:material_ui/material_ui.dart';
import 'package:shop_flutter_mobile/app.dart';
import 'package:shop_flutter_mobile/config/app_config.dart';
import 'package:shop_flutter_mobile/data/models/geo.dart';
import 'package:shop_flutter_mobile/data/network/http_services.dart';
import 'package:shop_flutter_mobile/data/network/pyro/pyro_router.dart';
import 'package:shop_flutter_mobile/data/repositories/location_repository.dart';
import 'package:shop_flutter_mobile/data/repositories/shop_api.dart';
import 'package:shop_flutter_mobile/data/store/app_store.dart';
import 'package:shop_flutter_mobile/data/store/key_value_store.dart';
import 'package:shop_flutter_mobile/features/merchants/merchants_screen.dart';
import 'package:shop_flutter_mobile/platform/platform_services.dart';
import 'package:shop_flutter_mobile/providers.dart';

import 'fake_graphql.dart';
import 'fake_pyro.dart';
import 'fixtures.dart';

class FakeLocator implements DeviceLocator {
  Loc? position = const Loc(lng: 23.3, lat: 42.6);
  int calls = 0;

  @override
  Future<Loc?> currentPosition({Duration timeout = const Duration(seconds: 30)}) async {
    calls++;
    return position;
  }
}

class FakeDialer implements PhoneDialer {
  final List<String> calls = <String>[];
  bool succeed = true;

  @override
  Future<bool> call(String number) async {
    calls.add(number);
    return succeed;
  }
}

class FakeConnectivity implements ConnectivityWatcher {
  final StreamController<bool> controller = StreamController<bool>.broadcast();

  @override
  Stream<bool> onlineChanges() => controller.stream;
}

/// Card entry without Stripe: a button marks the card complete, the token is
/// [token].
class FakeTokenizer implements CardTokenizer {
  bool available = true;
  String token = 'tok_test';
  Object? error;
  int created = 0;

  @override
  bool get isAvailable => available;

  @override
  Widget buildCardField({required ValueChanged<bool> onComplete}) => TextButton(
        key: const Key('fake-card-field'),
        onPressed: () => onComplete(true),
        child: const Text('4242 4242 4242 4242'),
      );

  @override
  Future<String> createToken({String? email}) async {
    created++;
    final Object? e = error;
    if (e != null) throw e;
    return token;
  }
}

/// Everything a test needs: fake pyro server, fake GraphQL, in-memory
/// storage, fake platform services, and the provider overrides that wire
/// them into the real app.
class TestEnv {
  TestEnv({
    AppConfig? config,
    Map<String, String>? storage,
    this.startupDone = true,
  })  : config = config ?? const AppConfig(mapsEnabled: false),
        kv = MemoryStore(storage) {
    store = AppStore(kv);
    client = pyro.client();
  }

  AppConfig config;
  final MemoryStore kv;
  late final AppStore store;
  final FakePyroBackend pyro = FakePyroBackend();
  late final PyroClient client;
  final FakeGraphQL gql = FakeGraphQL();
  final FakeLocator locator = FakeLocator();
  final FakeDialer dialer = FakeDialer();
  final FakeConnectivity connectivity = FakeConnectivity();
  final FakeTokenizer tokenizer = FakeTokenizer();
  final List<String> scannedCodes = <String>[];
  final bool startupDone;

  /// Answers every plain HTTP call (server check, maintenance, IP lookup).
  http.Client httpClient =
      MockClient((http.Request r) async => http.Response('ok', 200));

  ShopApi get api => ShopApi(client);

  HttpServices get httpServices =>
      HttpServices(servicesEndpoint: config.servicesEndpoint, client: httpClient);

  /// A registered customer with a delivery order flow ready.
  void loggedIn({String userId = 'u1'}) {
    store
      ..userId = userId
      ..deviceId = 'd1'
      ..registrationSystem = 'disabled'
      ..inviteSystem = false;
    pyro.onValue('user.get', userJson(id: userId));
  }

  /// Server settings, device and placeholder handlers of a running API.
  void serverDefaults({bool invites = true, bool registrationRequired = false}) {
    pyro
      ..onCall('invite.getInvitesSettings', (_) => <String, dynamic>{'isEnabled': invites})
      ..onCall(
        'user-auth.getRegistrationsSettings',
        (_) => <String, dynamic>{'registrationRequiredOnStart': registrationRequired},
      )
      ..onCall('device.create', (_) => <String, dynamic>{'_id': 'd1'})
      ..onValue('user-products.getPlaceholder', '');
  }

  List<Override> get overrides => <Override>[
        appConfigProvider.overrideWithValue(config),
        appStoreProvider.overrideWithValue(store),
        pyroClientProvider.overrideWithValue(client),
        graphQLServiceProvider.overrideWithValue(gql),
        httpServicesProvider.overrideWithValue(httpServices),
        deviceLocatorProvider.overrideWithValue(locator),
        phoneDialerProvider.overrideWithValue(dialer),
        connectivityWatcherProvider.overrideWithValue(connectivity),
        cardTokenizerProvider.overrideWithValue(tokenizer),
        codeScannerProvider.overrideWithValue(
          (BuildContext _) async =>
              scannedCodes.isEmpty ? null : scannedCodes.removeAt(0),
        ),
        startupCompletedProvider.overrideWith(
          (Ref ref) => ValueNotifier<bool>(startupDone),
        ),
      ];

  ProviderContainer container() => ProviderContainer(overrides: overrides);

  /// Pumps the real app at [location] and lets the fakes answer.
  Future<void> pumpApp(WidgetTester tester, {String location = '/products'}) async {
    await tester.binding.setSurfaceSize(const Size(420, 900));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(
      ProviderScope(
        overrides: overrides,
        child: ShopApp(initialLocation: location),
      ),
    );
    await settle(tester);
  }
}

/// Scrolls the widget with [key] into view and taps it.
Future<void> tapKey(WidgetTester tester, String key) async {
  final Finder f = find.byKey(Key(key));
  await tester.ensureVisible(f);
  await tester.pump();
  await tester.tap(f);
  await settle(tester);
}

/// An HTTP client for an unreachable server.
http.Client failingClient() =>
    MockClient((http.Request r) async => throw http.ClientException('offline'));

/// Pumps frames so futures, microtasks and short timers complete, without
/// waiting for periodic timers (elapsed time, product poll) to stop.
Future<void> settle(WidgetTester tester, {int frames = 12}) async {
  for (int i = 0; i < frames; i++) {
    await tester.pump(const Duration(milliseconds: 50));
  }
}
