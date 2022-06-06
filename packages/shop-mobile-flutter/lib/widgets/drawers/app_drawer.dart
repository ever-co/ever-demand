import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:shop_flutter_mobile/screens/products/products.dart';

class AppDrawer extends StatelessWidget {
  final customColor = const AppColors();
  const AppDrawer({Key? key}) : super(key: key);

  Widget subheaderNavigation({String title = '', bool? isSettings = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 15.0),
      decoration: BoxDecoration(color: Colors.grey.withOpacity(0.2)),
      child: Row(
        children: [
          if (isSettings!) const Icon(Icons.settings),
          if (isSettings) const SizedBox(width: 20.0),
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          Container(
            padding: const EdgeInsets.only(top: 20.0),
            decoration: BoxDecoration(
              color: customColor.everSignin,
            ),
            height: 100.0,
            child: Center(
              child: Text(
                AppLocalizations.of(context)!.ever,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 30,
                ),
              ),
            ),
          ),
          NavigationItem(
            title: AppLocalizations.of(context)!.productsViewTitle,
            iconData: const Icon(Icons.shopping_basket),
            onPress: () {},
          ),
          NavigationItem(
            title: AppLocalizations.of(context)!.orderHistory,
            iconData: const Icon(Icons.shopping_cart_outlined),
            onPress: () {},
          ),
          // Settings
          subheaderNavigation(
            title: AppLocalizations.of(context)!.settings,
            isSettings: true,
          ),
          //
          NavigationItem(
            title: "Language",
            iconData: const Icon(Icons.language),
            onPress: () {},
          ),
          // Information
          subheaderNavigation(title: AppLocalizations.of(context)!.information),
          //
          NavigationItem(
            title: AppLocalizations.of(context)!.help,
            iconData: const Icon(Icons.help_outline),
            onPress: () {},
          ),
          NavigationItem(
            title: AppLocalizations.of(context)!.callUs,
            iconData: const Icon(Icons.phone),
            onPress: () {},
          ),
          NavigationItem(
            title: AppLocalizations.of(context)!.aboutUs,
            iconData: const Icon(Icons.info_outline),
            onPress: () {},
          ),
          // Legals
          subheaderNavigation(title: AppLocalizations.of(context)!.legal),
          NavigationItem(
            title: AppLocalizations.of(context)!.privacy,
            iconData: const Icon(Icons.lock_outline),
            onPress: () {},
          ),
          NavigationItem(
            title: AppLocalizations.of(context)!.termsOfUse,
            iconData: const Icon(Icons.list_alt_outlined),
            onPress: () {},
          ),
        ],
      ),
    );
  }
}

class NavigationItem extends StatelessWidget {
  final String title;
  final Widget iconData;
  final Function onPress;

  const NavigationItem({
    Key? key,
    required this.title,
    required this.iconData,
    required this.onPress,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) => const Products(),
        ),
      ),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 15.0, horizontal: 15.0),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: Theme.of(context).dividerColor.withOpacity(0.1),
              width: 1,
            ),
          ),
        ),
        child: Row(
          children: [
            iconData,
            const SizedBox(width: 20.0),
            Text(title),
          ],
        ),
      ),
    );
  }
}
