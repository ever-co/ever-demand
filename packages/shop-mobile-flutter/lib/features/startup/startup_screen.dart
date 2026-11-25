import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../app.dart';
import '../../core/theme.dart';
import '../../providers.dart';
import '../../widgets/common.dart';

/// Splash while the start-up sequence runs, then on to [from] (or `/`).
class StartupScreen extends ConsumerStatefulWidget {
  const StartupScreen({super.key, this.from});

  final String? from;

  @override
  ConsumerState<StartupScreen> createState() => _StartupScreenState();
}

class _StartupScreenState extends ConsumerState<StartupScreen> {
  @override
  void initState() {
    super.initState();
    unawaited(_run());
  }

  Future<void> _run() async {
    final ValueNotifier<bool> done = ref.read(startupCompletedProvider);
    if (!done.value) {
      try {
        await ref.read(startupServiceProvider).run();
      } on Object catch (e) {
        debugPrint('Start-up failed: $e');
      }
      done.value = true;
    }
    if (!mounted) return;
    final String? from = widget.from;
    context.go(from == null || from.startsWith('/startup') ? '/' : from);
  }

  @override
  Widget build(BuildContext context) => const Scaffold(
        key: Key('startup-screen'),
        backgroundColor: EverColors.primary,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              AppImage('assets/imgs/ever-logo.svg', width: 160, height: 80, fit: BoxFit.contain),
              SizedBox(height: 24),
              CircularProgressIndicator(color: Colors.white),
            ],
          ),
        ),
      );
}
