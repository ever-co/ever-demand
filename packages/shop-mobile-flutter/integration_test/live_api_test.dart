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
import 'package:shop_flutter_mobile/providers.dart';

const bool liveApi = bool.fromEnvironment('LIVE_API');

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  Future<void> wait(WidgetTester tester, Finder finder, {int seconds = 30}) async {
    for (int i = 0; i < seconds * 4; i++) {
      await tester.pump(const Duration(milliseconds: 250));
      if (finder.evaluate().isNotEmpty) return;
    }
    fail('Timed out waiting for $finder');
  }

  testWidgets(
    'live API: fake invite 8321 → products → buy → order info → undo',
    (WidgetTester tester) async {
      final AppStore store = AppStore(MemoryStore());
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            appConfigProvider.overrideWithValue(
              AppConfig.fromEnvironment().copyWith(mapsEnabled: false),
            ),
            appStoreProvider.overrideWithValue(store),
          ],
          child: const ShopApp(),
        ),
      );
      final Finder byCode = find.byKey(const Key('invite-by-code-screen'));
      final Finder products = find.byKey(const Key('products-screen'));
      await wait(tester, find.byWidgetPredicate((Widget w) =>
          w.key == const Key('invite-by-code-screen') ||
          w.key == const Key('invite-by-location-screen') ||
          w.key == const Key('products-screen')));
      if (byCode.evaluate().isNotEmpty) {
        await tester.enterText(find.byKey(const Key('invite-code-input')), '8321');
        await wait(tester, products);
      }
      expect(store.deviceId, isNotNull);
      final Finder buy = find.byWidgetPredicate(
        (Widget w) =>
            w.key is ValueKey<String> &&
            (w.key! as ValueKey<String>).value.startsWith('buy-'),
      );
      await wait(tester, buy);
      await tester.tap(buy.first);
      await wait(tester, find.byKey(const Key('order-undo')));
      expect(store.orderId, isNotNull);
      await tester.tap(find.byKey(const Key('order-undo')));
      await wait(tester, find.byKey(const Key('cancel-order-yes')));
      await tester.tap(find.byKey(const Key('cancel-order-yes')));
      await wait(tester, products);
      expect(store.orderId, isNull);
    },
    skip: !liveApi,
    timeout: const Timeout(Duration(minutes: 3)),
  );
}
