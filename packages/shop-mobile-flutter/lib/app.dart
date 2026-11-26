import 'dart:async';

import 'package:cupertino_ui/cupertino_ui.dart' show GlobalCupertinoLocalizations;
import 'package:flutter_localizations/flutter_localizations.dart'
    show GlobalWidgetsLocalizations;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import 'core/l10n.dart';
import 'core/languages.dart';
import 'core/theme.dart';
import 'providers.dart';
import 'routing/app_router.dart';

/// Set once the start-up sequence finished; the router lets nothing but the
/// start-up page through before that.
final Provider<ValueNotifier<bool>> startupCompletedProvider =
    Provider<ValueNotifier<bool>>((Ref ref) {
  final ValueNotifier<bool> done = ValueNotifier<bool>(false);
  ref.onDispose(done.dispose);
  return done;
});

class ShopApp extends ConsumerStatefulWidget {
  const ShopApp({super.key, this.initialLocation = Routes.startup});

  final String initialLocation;

  @override
  ConsumerState<ShopApp> createState() => _ShopAppState();
}

class _ShopAppState extends ConsumerState<ShopApp> {
  late final GoRouter _router;
  StreamSubscription<bool>? _connectivity;
  bool _showingConnectionLost = false;

  @override
  void initState() {
    super.initState();
    final ValueNotifier<bool> done = ref.read(startupCompletedProvider);
    _router = buildRouter(
      initialLocation: widget.initialLocation,
      guards: AppGuards(
        store: ref.read(appStoreProvider),
        session: ref.read(sessionServiceProvider),
        startupDone: () => done.value,
      ),
    );
    _connectivity = ref
        .read(connectivityWatcherProvider)
        .onlineChanges()
        .listen(_onOnlineChanged, onError: (Object _) {});
  }

  /// Network lost → connection-lost page; back online → previous page.
  void _onOnlineChanged(bool online) {
    if (!online && !_showingConnectionLost) {
      _showingConnectionLost = true;
      unawaited(_router.push<void>(Routes.connectionLost));
    } else if (online && _showingConnectionLost) {
      _showingConnectionLost = false;
      if (_router.canPop()) _router.pop();
    }
  }

  @override
  void dispose() {
    unawaited(_connectivity?.cancel());
    _router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final String language = ref.watch(languageProvider);
    return MaterialApp.router(
      title: 'Ever',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      locale: localeOf(language),
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: const <LocalizationsDelegate<Object>>[
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: _router,
    );
  }
}
