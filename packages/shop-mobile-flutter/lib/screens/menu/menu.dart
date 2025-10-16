import "package:flutter/material.dart";
import 'package:flutter/cupertino.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:shop_flutter_mobile/screens/screens.dart';
import 'package:shop_flutter_mobile/widgets/widgets.dart';

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
        elevation: 0.0,
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
          //   InkWell(
          //     child: Column(
          //       children: const [
          //         Icon(Icons.login_outlined, size: 14),
          //         Text(
          //           'In store',
          //           style: TextStyle(fontSize: 11.0),
          //         ),
          //       ],
          //     ),
          //   ),
        ],
      ),
      body: const ProductSlide(),
    );
  }
}
