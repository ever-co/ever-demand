import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

import '../../core/l10n.dart';
import '../../data/repositories/shop_api.dart';
import '../../data/store/app_store.dart';
import '../../providers.dart';
import '../../widgets/app_drawer.dart';
import '../../widgets/common.dart';

/// The four info pages and the `user` router method each one reads.
enum InfoPage {
  about('about'),
  help('help'),
  privacy('privacy'),
  termsOfUse('terms-of-use');

  const InfoPage(this.path);

  final String path;

  static InfoPage fromPath(String? path) => InfoPage.values.firstWhere(
        (InfoPage p) => p.path == path,
        orElse: () => InfoPage.about,
      );

  String title(AppLocalizations l10n) => switch (this) {
        InfoPage.about => l10n.aboutViewTitle,
        InfoPage.help => l10n.helpViewTitle,
        InfoPage.privacy => l10n.privacyViewTitle,
        InfoPage.termsOfUse => l10n.termsOfUseViewTitle,
      };

  Stream<String> load(UserRouterApi user, AppStore store) {
    final String language = store.language ?? 'en-US';
    return switch (this) {
      InfoPage.about => user.getAboutUs(store.userId, store.deviceId, language),
      InfoPage.help => user.getHelp(store.userId, store.deviceId, language),
      InfoPage.privacy => user.getPrivacy(store.userId, store.deviceId, language),
      InfoPage.termsOfUse =>
        user.getTermsOfUse(store.userId, store.deviceId, language),
    };
  }
}

final infoHtmlProvider =
    StreamProvider.autoDispose.family<String, InfoPage>((Ref ref, InfoPage page) {
  return page.load(ref.watch(shopApiProvider).user, ref.watch(appStoreProvider));
});

/// `/info/about`, `/info/help`, `/info/privacy`, `/info/terms-of-use`:
/// server HTML, "Loading..." until it arrives.
class InfoScreen extends ConsumerWidget {
  const InfoScreen({super.key, required this.page});

  final InfoPage page;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AsyncValue<String> html = ref.watch(infoHtmlProvider(page));
    return Scaffold(
      key: Key('info-screen-${page.path}'),
      drawer: const AppDrawer(),
      appBar: AppBar(title: Text(page.title(context.l10n))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: HtmlView(html.value ?? '<h1>Loading...</h1>'),
      ),
    );
  }
}
