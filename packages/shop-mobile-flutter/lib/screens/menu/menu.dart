import "package:flutter/material.dart";
import "package:flutter/cupertino.dart";
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/colors.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:shop_flutter_mobile/screens/app_widgets/app_drawer.dart';
import 'package:shop_flutter_mobile/screens/app_widgets/appbar.dart';
import 'package:shop_flutter_mobile/screens/products/products.dart';

const customColor = AppColors();

class MenuBar extends StatefulWidget {
  const MenuBar({Key? key}) : super(key: key);

  @override
  _MenuBarState createState() => _MenuBarState();
}

class _MenuBarState extends State<MenuBar> {
  bool isSwitched = false;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.productsViewTitle),
        centerTitle: false,
        actions: [
          IconButton(
            iconSize: 50,
            icon: Text(AppLocalizations.of(context)!.takeAway),
            onPressed: () {},
          ),
          Switch(
            value: isSwitched,
            onChanged: (value) {
              setState(() {
                isSwitched = value;
                //print(isSwitched);
              });
            },
            activeTrackColor: customColor.greyColor,
            activeColor: customColor.everSignin,
          ),
          IconButton(
            iconSize: 50,
            icon: Text(AppLocalizations.of(context)!.delivery),
            onPressed: () {},
          ),
        ],
        backgroundColor: customColor.dRed,
      ),
      drawer: appDrawer(context),
      body: Products(),
    );
  }
}
