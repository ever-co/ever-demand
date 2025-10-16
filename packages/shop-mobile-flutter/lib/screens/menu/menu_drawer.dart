import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

const customColor = AppColors();

class MenuDrawer extends StatefulWidget {
  const MenuDrawer({Key? key}) : super(key: key);

  @override
  _MenuDrawerState createState() => _MenuDrawerState();
}

class _MenuDrawerState extends State<MenuDrawer> {
  @override
  Widget build(BuildContext context) {
    return Drawer(
        child: Container(
      color: customColor.everSignin,
      child: ListView(
        children: [
          DrawerHeader(
            child: Center(
              child: Text(
                AppLocalizations.of(context)!.ever,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 16),
              ),
            ),
          ),
          ListTile(
            leading: const FaIcon(
              FontAwesomeIcons.cartPlus,
              size: 20.0,
              color: Colors.white,
            ),
            title: Text(AppLocalizations.of(context)!.productsViewTitle),
            onTap: () {
              Navigator.of(context).push(MaterialPageRoute(
                  builder: (context) => const Text('Products')));
            },
          ),
        ],
      ),
    ));
  }
}
