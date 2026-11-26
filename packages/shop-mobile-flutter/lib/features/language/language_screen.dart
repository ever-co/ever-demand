import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../core/l10n.dart';
import '../../core/languages.dart';
import '../../providers.dart';
import '../../widgets/app_drawer.dart';
import '../../widgets/common.dart';

/// Language selection (`/language`): picks one of the six languages, then
/// goes back.
class LanguageScreen extends ConsumerWidget {
  const LanguageScreen({super.key});

  void _back(BuildContext context) {
    if (context.canPop()) {
      context.pop();
    } else {
      context.go('/products');
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AppLocalizations l10n = context.l10n;
    final String current = ref.watch(languageProvider);
    return Scaffold(
      key: const Key('language-screen'),
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: Text(l10n.languageViewTitle),
        actions: <Widget>[BackTextButton(onPressed: () => _back(context))],
      ),
      body: RadioGroup<String>(
        groupValue: current,
        onChanged: (String? lang) {
          if (lang == null) return;
          ref.read(languageProvider.notifier).set(lang);
          _back(context);
        },
        child: ListView(
          children: <Widget>[
            for (final String lang in appLanguages)
              RadioListTile<String>(
                key: Key('language-$lang'),
                value: lang,
                title: Text(languageName(l10n, lang)),
              ),
          ],
        ),
      ),
    );
  }
}
