import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/colors.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:shop_flutter_mobile/screens/products/products.dart';

const customColor = AppColors();

Widget appDrawer(BuildContext context) {
  return Drawer(
    child: Container(
      color: customColor.whiteColor,
      child: SingleChildScrollView(
        child: Container(
          color: customColor.everSignin,
          margin: const EdgeInsets.only(top: 10),
          child: Column(
            children: [
              DrawerHeader(
                child: Center(
                  child: Text(
                    AppLocalizations.of(context)!.ever,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white, fontSize: 30),
                  ),
                ),
              ),
              ListTile(
                leading: const FaIcon(
                  FontAwesomeIcons.cartPlus,
                  size: 30.0,
                  color: Colors.white,
                ),
                title: Text(
                  AppLocalizations.of(context)!.productsViewTitle,
                  style: const TextStyle(color: Colors.white, fontSize: 20),
                ),
                onTap: () {
                  Navigator.of(context).push(MaterialPageRoute(
                      builder: (context) => const Products()));
                },
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
