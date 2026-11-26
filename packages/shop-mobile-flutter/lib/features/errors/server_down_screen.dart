import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../core/l10n.dart';
import '../../core/theme.dart';
import '../../data/store/app_store.dart';
import '../../providers.dart';

/// `/server-down`: re-runs the server check every 5 s; once the server
/// answers it loads the settings and goes to `/`.
class ServerDownScreen extends ConsumerStatefulWidget {
  const ServerDownScreen({super.key, this.interval = const Duration(seconds: 5)});

  final Duration interval;

  @override
  ConsumerState<ServerDownScreen> createState() => _ServerDownScreenState();
}

class _ServerDownScreenState extends ConsumerState<ServerDownScreen> {
  Timer? _timer;
  bool _checking = false;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(widget.interval, (_) => unawaited(_check()));
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _check() async {
    if (_checking) return;
    _checking = true;
    try {
      final AppStore store = ref.read(appStoreProvider);
      await ref.read(startupServiceProvider).checkServer();
      if (!store.isServerDown) {
        _timer?.cancel();
        await ref.read(startupServiceProvider).run();
        if (mounted && !store.isServerDown) context.go('/');
      }
    } finally {
      _checking = false;
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        key: const Key('server-down-screen'),
        backgroundColor: EverColors.primary,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Image.asset('assets/imgs/logo.png', height: 96),
              const SizedBox(height: 24),
              Text(
                context.l10n.noServerViewNoServer,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 20),
              ),
            ],
          ),
        ),
      );
}
