import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

import 'app.dart';
import 'config/app_config.dart';
import 'data/store/app_store.dart';
import 'data/store/key_value_store.dart';
import 'providers.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final AppConfig config = AppConfig.fromEnvironment();
  KeyValueStore kv;
  try {
    kv = await SharedPreferencesStore.create();
  } on Object catch (e) {
    debugPrint('Local storage unavailable, using memory: $e');
    kv = MemoryStore();
  }
  runApp(
    ProviderScope(
      overrides: [
        appConfigProvider.overrideWithValue(config),
        appStoreProvider.overrideWithValue(AppStore(kv)),
      ],
      child: const ShopApp(),
    ),
  );
}
