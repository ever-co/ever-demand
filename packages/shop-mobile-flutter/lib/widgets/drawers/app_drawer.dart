import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          // Header
          const NavigationHeader(),

          // Products
          NavigationDestination(
            label: AppLocalizations.of(context)!.productsViewTitle,
            icon: const Icon(Icons.shopping_basket),
            route: "/products",
          ),
          //   Order History
          NavigationDestination(
            label: AppLocalizations.of(context)!.orderHistory,
            icon: const Icon(Icons.shopping_cart_outlined),
            route: "/order-history",
          ),

          // Store Subhead
          NavigationSubhead(label: AppLocalizations.of(context)!.store),

          //   Call Waiter
          NavigationDestination(
            label: AppLocalizations.of(context)!.callWaiter,
            route: "/merchants",
          ),

          //   About Store
          NavigationDestination(
            label: '${AppLocalizations.of(context)!.about} Pizza Troya',
            icon: const Icon(Icons.info),
            route: "/products-store",
          ),

          // Settings Subhead
          NavigationSubhead(
            label: AppLocalizations.of(context)!.settings,
            icon: Icons.settings,
          ),

          // Language
          const NavigationDestination(
            label: "Language",
            icon: Icon(Icons.language),
            route: "/language",
          ),

          // Information Subhead
          NavigationSubhead(label: AppLocalizations.of(context)!.information),

          // Help
          NavigationDestination(
            label: AppLocalizations.of(context)!.help,
            icon: const Icon(Icons.help_outline),
            route: "/info-help",
          ),

          //   Call Us
          NavigationDestination(
            label: AppLocalizations.of(context)!.callUs,
            icon: const Icon(Icons.phone),
            route: "/info-callus",
          ),

          //   About Us
          NavigationDestination(
            label: AppLocalizations.of(context)!.aboutUs,
            icon: const Icon(Icons.info_outline),
            route: "/info-about",
          ),

          // Legal Subhead
          NavigationSubhead(label: AppLocalizations.of(context)!.legal),

          //   Privacy
          NavigationDestination(
            label: AppLocalizations.of(context)!.privacy,
            icon: const Icon(Icons.lock_outline),
            route: "/info-privacy",
          ),

          //   Terms of use
          NavigationDestination(
            label: AppLocalizations.of(context)!.termsOfUse,
            icon: const Icon(Icons.list_alt_outlined),
            route: "/info-terms-of-use",
          ),
        ],
      ),
    );
  }
}

class NavigationDestination extends StatelessWidget {
  final String label;
  final Widget? icon;
  final String route;

  const NavigationDestination({
    Key? key,
    required this.label,
    this.icon,
    required this.route,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: () {
        Navigator.of(context)
          ..pop()
          ..pushNamed(route);
      },
      title: Text(label),
      leading: icon ?? const SizedBox(height: 5, width: 5),
      horizontalTitleGap: 5.0,
      selected: ModalRoute.of(context)!.settings.name == route,
      dense: true,
      focusColor: everSignin,
      selectedColor: everSignin,
      hoverColor: everSignin,
    );
  }
}

class NavigationSubhead extends StatelessWidget {
  const NavigationSubhead({
    Key? key,
    required this.label,
    this.icon,
  }) : super(key: key);

  final String label;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Divider(height: 1, thickness: 1),
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              if (icon != null) Icon(icon, size: 16),
            ],
          ),
        ),
      ],
    );
  }
}

class NavigationHeader extends StatelessWidget {
  const NavigationHeader({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DrawerHeader(
      decoration: const BoxDecoration(color: Colors.redAccent),
      child: UserAccountsDrawerHeader(
        decoration: const BoxDecoration(color: Colors.redAccent),
        margin: EdgeInsets.zero,
        accountName: Text(
          'Aaron Dizele',
          style: Theme.of(context)
              .textTheme
              .titleLarge!
              .copyWith(color: Colors.white),
        ),
        accountEmail: const Text('aldizele@gmail.com'),
      ),
    );
  }
}
