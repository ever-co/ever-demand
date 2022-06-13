import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';

class AppDrawer extends StatelessWidget {
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
          const DrawerHeader(
            decoration: BoxDecoration(
              color: Colors.redAccent,
            ),
            child: UserAccountsDrawerHeader(
              decoration: BoxDecoration(color: Colors.redAccent),
              margin: EdgeInsets.zero,
              accountName: Text('Aaron Dizele'),
              accountEmail: Text('aldizele@gmail.com'),
            ),
          ),
          // Products
          NavigationItem(
            title: AppLocalizations.of(context)!.productsViewTitle,
            iconData: const Icon(Icons.shopping_basket),
            routeName: "/products",
          ),
          //   Order History
          NavigationItem(
            title: AppLocalizations.of(context)!.orderHistory,
            iconData: const Icon(Icons.shopping_cart_outlined),
            routeName: "/order-history",
          ),

          const Divider(
            height: 1,
            thickness: 1,
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              AppLocalizations.of(context)!.store,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          //   Call Waiter
          NavigationItem(
            title: AppLocalizations.of(context)!.callWaiter,
            routeName: "/merchants",
          ),
          //   About Store
          NavigationItem(
            title: '${AppLocalizations.of(context)!.about} Pizza Troya',
            iconData: const Icon(Icons.info),
            routeName: "/products-store",
          ),

          const Divider(
            height: 1,
            thickness: 1,
          ),
          // Settings
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  AppLocalizations.of(context)!.settings,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const Icon(Icons.settings, size: 16)
              ],
            ),
          ),
          // Language
          NavigationItem(
            title: "Language",
            iconData: const Icon(Icons.language),
            routeName: "/language",
          ),
          const Divider(
            height: 1,
            thickness: 1,
          ),
          // Information
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              AppLocalizations.of(context)!.information,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          // Help
          NavigationItem(
            title: AppLocalizations.of(context)!.help,
            iconData: const Icon(Icons.help_outline),
            routeName: "/info-help",
          ),
          //   Call Us
          NavigationItem(
            title: AppLocalizations.of(context)!.callUs,
            iconData: const Icon(Icons.phone),
            routeName: "/info-callus",
          ),
          //   About Us
          NavigationItem(
            title: AppLocalizations.of(context)!.aboutUs,
            iconData: const Icon(Icons.info_outline),
            routeName: "/info-about",
          ),
          const Divider(
            height: 1,
            thickness: 1,
          ),
          // Legals
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              AppLocalizations.of(context)!.legal,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          //   Privacy
          NavigationItem(
            title: AppLocalizations.of(context)!.privacy,
            iconData: const Icon(Icons.lock_outline),
            routeName: "/info-privacy",
          ),
          //   Terms of use
          NavigationItem(
            title: AppLocalizations.of(context)!.termsOfUse,
            iconData: const Icon(Icons.list_alt_outlined),
            routeName: "/info-terms-of-use",
          ),
        ],
      ),
    );
  }
}

class NavigationItem extends StatelessWidget {
  final String title;
  final Widget? iconData;
  final String routeName;

  const NavigationItem({
    Key? key,
    required this.title,
    this.iconData,
    required this.routeName,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: () {
        Navigator.of(context)
          ..pop()
          ..pushNamed(routeName);
      },
      title: Text(title),
      leading: iconData ?? const SizedBox(height: 5, width: 5),
      horizontalTitleGap: 5.0,
      selected: ModalRoute.of(context)!.settings.name == routeName,
      dense: true,
      focusColor: everSignin,
      selectedColor: everSignin,
      hoverColor: everSignin,
    );
  }
}
