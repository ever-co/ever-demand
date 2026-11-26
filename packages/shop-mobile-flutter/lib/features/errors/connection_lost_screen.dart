import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

import '../../core/l10n.dart';
import '../../core/theme.dart';
import '../../providers.dart';

/// `/errors/connection-lost`: shown while the device is offline; the app
/// goes back to the previous page when the network returns.
class ConnectionLostScreen extends ConsumerWidget {
  const ConnectionLostScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AppLocalizations l10n = context.l10n;
    final String company = ref.watch(appConfigProvider).companyName;
    const TextStyle white = TextStyle(color: Colors.white);
    return PopScope(
      canPop: false,
      child: Scaffold(
        key: const Key('connection-lost-screen'),
        backgroundColor: EverColors.primary,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Image.asset(
                  'assets/imgs/logo.png',
                  height: 96,
                  semanticLabel: '$company Logo',
                ),
                const SizedBox(height: 24),
                Text(
                  l10n.connectionErrorViewTitle,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white, fontSize: 22),
                ),
                const SizedBox(height: 12),
                Text(
                  '${l10n.connectionErrorViewDescription0}\n'
                  '${l10n.connectionErrorViewDescription1}\n'
                  '${l10n.connectionErrorViewDescription2}',
                  textAlign: TextAlign.center,
                  style: white,
                ),
                const SizedBox(height: 24),
                const CircularProgressIndicator(color: Colors.white),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
