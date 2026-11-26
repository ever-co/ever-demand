// End-to-end against a running Ever Demand API (no fakes): the real socket.io
// "pyro" routers, GraphQL and HTTP endpoints from --dart-define. Skipped
// unless LIVE_API=true, because it needs the API with its demo data.
//
//   flutter test integration_test/live_api_test.dart -d <device> \
//     --dart-define=LIVE_API=true \
//     --dart-define=SERVICES_ENDPOINT=http://10.0.2.2:5500 \
//     --dart-define=GQL_ENDPOINT=http://10.0.2.2:8443/graphql
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:shop_flutter_mobile/app.dart';
import 'package:shop_flutter_mobile/config/app_config.dart';
import 'package:shop_flutter_mobile/data/store/app_store.dart';
import 'package:shop_flutter_mobile/data/store/key_value_store.dart';
import 'package:shop_flutter_mobile/platform/platform_services.dart';
import 'package:shop_flutter_mobile/providers.dart';

/// No connectivity plugin on the headless tester: always online.
class _Online implements ConnectivityWatcher {
  @override
  Stream<bool> onlineChanges() => const Stream<bool>.empty();
}

const bool liveApi = bool.fromEnvironment('LIVE_API');

AppStore? _store;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  Future<void> wait(WidgetTester tester, Finder finder, {int seconds = 30}) async {
    for (int i = 0; i < seconds * 4; i++) {
      await tester.pump(const Duration(milliseconds: 250));
      if (finder.evaluate().isNotEmpty) return;
    }
    debugPrint('orderId=${_store?.orderId} keys=${find.byWidgetPredicate((Widget w) => w.key is ValueKey<String>).evaluate().map((Element e) => e.widget.key).toList()}');
    fail('Timed out waiting for $finder');
  }

  testWidgets(
    'live API: register → products → buy → order info → undo',
    (WidgetTester tester) async {
      final AppStore store = AppStore(MemoryStore());
      _store = store;
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            appConfigProvider.overrideWithValue(
              AppConfig.fromEnvironment().copyWith(mapsEnabled: false),
            ),
            appStoreProvider.overrideWithValue(store),
            connectivityWatcherProvider.overrideWithValue(_Online()),
          ],
          child: const ShopApp(),
        ),
      );
      final Finder byCode = find.byKey(const Key('invite-by-code-screen'));
      final Finder byLocation = find.byKey(const Key('invite-by-location-screen'));
      final Finder products = find.byKey(const Key('products-screen'));
      final Finder undo = find.byKey(const Key('order-undo'));
      Finder anyOf(List<Finder> finders) => find.byWidgetPredicate(
            (Widget w) => finders.any(
              (Finder f) => f.evaluate().any((Element e) => identical(e.widget, w)),
            ),
          );

      // Registration as the server settings ask for it: the fake invite code
      // 8321 on invite by code, or an address on invite by location (an
      // invite request, then an invite, when the invite system is off).
      Future<void> register() async {
        if (byCode.evaluate().isNotEmpty) {
          await tester.enterText(find.byKey(const Key('invite-code-input')), '8321');
        } else if (byLocation.evaluate().isNotEmpty) {
          await tester.enterText(find.byKey(const Key('address-city')), 'Sofia');
          await tester.enterText(find.byKey(const Key('address-street')), 'Simeonovsko shose');
          await tester.enterText(find.byKey(const Key('address-house')), '104');
          await tester.enterText(find.byKey(const Key('address-apartment')), '3');
          await tester.pump();
          final Finder submit = find.byKey(const Key('address-submit'));
          await tester.ensureVisible(submit);
          await tester.pump();
          await tester.tap(submit);
        }
      }

      await wait(tester, anyOf(<Finder>[byCode, byLocation, products]));
      if (products.evaluate().isEmpty) {
        await register();
        await wait(tester, products);
      }
      expect(store.deviceId, isNotNull);
      final Finder buy = find.byWidgetPredicate(
        (Widget w) =>
            w.key is ValueKey<String> &&
            (w.key! as ValueKey<String>).value.startsWith('buy-'),
      );
      await wait(tester, buy);
      await tester.ensureVisible(buy.first);
      await tester.pump();
      await tester.tap(buy.first);
      // "Browse first" (registration not required on start): the buy asks
      // for a registration, then the feed resumes it.
      await wait(tester, anyOf(<Finder>[undo, byCode, byLocation]), seconds: 60);
      if (undo.evaluate().isEmpty) {
        await register();
        await wait(tester, undo, seconds: 60);
      }
      expect(store.userId, isNotNull);
      expect(store.orderId, isNotNull);
      await tester.ensureVisible(undo);
      await tester.pump();
      await tester.tap(undo);
      final Finder yes = find.byKey(const Key('cancel-order-yes'));
      await wait(tester, yes);
      await tester.tap(yes);
      await wait(tester, products);
      expect(store.orderId, isNull);
    },
    skip: !liveApi,
    timeout: const Timeout(Duration(minutes: 3)),
  );
}
