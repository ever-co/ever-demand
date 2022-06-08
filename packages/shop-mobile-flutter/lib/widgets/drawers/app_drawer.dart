import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/app.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';

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
          NavigationItem(
            title: AppLocalizations.of(context)!.productsViewTitle,
            iconData: const Icon(Icons.shopping_basket),
            onPress: () {},
            routeName: "/products",
          ),
          NavigationItem(
            title: AppLocalizations.of(context)!.orderHistory,
            iconData: const Icon(Icons.shopping_cart_outlined),
            onPress: () {},
            routeName: "/order-history",
          ),
          const Divider(
            height: 1,
            thickness: 1,
          ),
          // Settings
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(AppLocalizations.of(context)!.settings),
          ),
          //
          NavigationItem(
            title: "Language",
            iconData: const Icon(Icons.language),
            onPress: () {},
            routeName: "/language",
          ),
          const Divider(
            height: 1,
            thickness: 1,
          ),
          // Information
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(AppLocalizations.of(context)!.information),
          ),
          //
          NavigationItem(
            title: AppLocalizations.of(context)!.help,
            iconData: const Icon(Icons.help_outline),
            onPress: () {},
            routeName: "/info-help",
          ),
          NavigationItem(
            title: AppLocalizations.of(context)!.callUs,
            iconData: const Icon(Icons.phone),
            onPress: () {},
            routeName: "/info-callus",
          ),
          NavigationItem(
            title: AppLocalizations.of(context)!.aboutUs,
            iconData: const Icon(Icons.info_outline),
            onPress: () {},
            routeName: "/info-about",
          ),
          const Divider(
            height: 1,
            thickness: 1,
          ),
          // Legals
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(AppLocalizations.of(context)!.legal),
          ),
          NavigationItem(
            title: AppLocalizations.of(context)!.privacy,
            iconData: const Icon(Icons.lock_outline),
            onPress: () {},
            routeName: "/info-privacy",
          ),
          NavigationItem(
            title: AppLocalizations.of(context)!.termsOfUse,
            iconData: const Icon(Icons.list_alt_outlined),
            onPress: () {},
            routeName: "/info-terms-of-use",
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
  final String routeName;

  const NavigationItem({
    Key? key,
    required this.title,
    required this.iconData,
    required this.onPress,
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
      leading: iconData,
      selected: ModalRoute.of(context)!.settings.name == routeName,
      dense: true,
      focusColor: customColor.everSignin,
      selectedColor: customColor.everSignin,
      hoverColor: customColor.everSignin,
      //   selected: ModalRoute.of(context).settings.name
      //   child: Container(
      //     padding: const EdgeInsets.symmetric(vertical: 15.0, horizontal: 15.0),
      //     decoration: BoxDecoration(
      //       border: Border(
      //         bottom: BorderSide(
      //           color: Theme.of(context).dividerColor.withOpacity(0.1),
      //           width: 1,
      //         ),
      //       ),
      //     ),
      //     child: Row(
      //       children: [
      //         iconData,
      //         const SizedBox(width: 20.0),
      //         Text(title),
      //       ],
      //     ),
      //   ),
    );
  }
}
