import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../config/app_config.dart';
import '../../data/network/http_services.dart';
import '../../data/store/app_store.dart';
import '../../providers.dart';
import '../../widgets/common.dart';

/// `/maintenance-info`: the maintenance message (server HTML); every 5 s it
/// checks `api.status && <app>.status` and leaves once it is false.
class MaintenanceScreen extends ConsumerStatefulWidget {
  const MaintenanceScreen({super.key, this.interval = const Duration(seconds: 5)});

  final Duration interval;

  @override
  ConsumerState<MaintenanceScreen> createState() => _MaintenanceScreenState();
}

class _MaintenanceScreenState extends ConsumerState<MaintenanceScreen> {
  Timer? _timer;
  String? _message;

  @override
  void initState() {
    super.initState();
    unawaited(_loadMessage());
    _timer = Timer.periodic(widget.interval, (_) => unawaited(_check()));
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadMessage() async {
    final AppStore store = ref.read(appStoreProvider);
    final AppConfig config = ref.read(appConfigProvider);
    final String? mode = store.maintenanceMode;
    if (mode == null) return;
    final String? message = await ref
        .read(httpServicesProvider)
        .maintenanceMessage(mode, config.settingsMaintenanceApiUrl);
    if (mounted) setState(() => _message = message);
  }

  Future<void> _check() async {
    final AppConfig config = ref.read(appConfigProvider);
    final HttpServices http = ref.read(httpServicesProvider);
    final bool? status = await http.maintenanceStatus(
      config.settingsAppType,
      config.settingsMaintenanceApiUrl,
    );
    if (status == false) {
      _timer?.cancel();
      ref.read(appStoreProvider).clearMaintenanceMode();
      await ref.read(startupServiceProvider).loadServerSettings();
      if (mounted) context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        key: const Key('maintenance-screen'),
        body: SafeArea(
          child: _message == null
              ? const SizedBox.shrink()
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: HtmlView(_message!),
                ),
        ),
      );
}
