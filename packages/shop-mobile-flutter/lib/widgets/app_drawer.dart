import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../core/l10n.dart';
import '../core/theme.dart';
import '../providers.dart';
import '../routing/app_router.dart';
import 'order_dialogs.dart';

/// Side menu (`components/menu`). Flutter's [Drawer] opens from the start
/// side, which is the right side in RTL, so one menu covers the Ionic `ltr`
/// and `rtl` menus.
class AppDrawer extends ConsumerWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AppLocalizations l10n = context.l10n;
    final String supportNumber = ref.watch(appConfigProvider).supportNumber;

    void go(String location) {
      Navigator.of(context).pop();
      context.go(location);
    }

    Widget item(IconData icon, String label, VoidCallback onTap, {Key? key}) =>
        ListTile(
          key: key,
          leading: Icon(icon),
          title: Text(label),
          onTap: onTap,
        );

    Widget divider(String label) => Container(
          width: double.infinity,
          color: EverColors.light,
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
          child: Text(
            label,
            style: Theme.of(context).textTheme.labelLarge,
          ),
        );

    return Drawer(
      key: const Key('app-drawer'),
      child: Column(
        children: <Widget>[
          AppBar(
            automaticallyImplyLeading: false,
            backgroundColor: EverColors.secondary,
            title: Text(l10n.sideMenuTitle),
          ),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: <Widget>[
                item(
                  Icons.shopping_basket,
                  l10n.sideMenuGroupsNoTitleItemsProducts,
                  () => go(Routes.products),
                  key: const Key('menu-products'),
                ),
                item(
                  Icons.shopping_cart,
                  l10n.sideMenuGroupsNoTitleItemsOrderHistory,
                  () => go(Routes.ordersHistory),
                  key: const Key('menu-orders-history'),
                ),
                divider(l10n.sideMenuGroupsSettingsDiverTitle),
                item(
                  Icons.language,
                  l10n.sideMenuGroupsSettingsItemsLanguage,
                  () => go(Routes.language),
                  key: const Key('menu-language'),
                ),
                divider(l10n.sideMenuGroupsInfoDiverTitle),
                item(
                  Icons.help,
                  l10n.sideMenuGroupsInfoItemsFaq,
                  () => go('${Routes.info}/help'),
                  key: const Key('menu-help'),
                ),
                if (supportNumber.isNotEmpty)
                  item(
                    Icons.call,
                    l10n.sideMenuGroupsNoTitleItemsCallUs,
                    () async {
                      final bool ok =
                          await ref.read(phoneDialerProvider).call(supportNumber);
                      if (!ok && context.mounted) {
                        await showCallFailedDialog(context);
                      }
                    },
                    key: const Key('menu-call-us'),
                  ),
                item(
                  Icons.info,
                  l10n.sideMenuGroupsInfoItemsAboutUs,
                  () => go('${Routes.info}/about'),
                  key: const Key('menu-about'),
                ),
                divider(l10n.sideMenuGroupsLegalsDiverTitle),
                item(
                  Icons.lock,
                  l10n.sideMenuGroupsLegalsItemsPrivacy,
                  () => go('${Routes.info}/privacy'),
                  key: const Key('menu-privacy'),
                ),
                item(
                  Icons.list,
                  l10n.sideMenuGroupsLegalsItemsTermsOfUse,
                  () => go('${Routes.info}/terms-of-use'),
                  key: const Key('menu-terms'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
