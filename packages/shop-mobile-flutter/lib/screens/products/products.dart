import 'package:flutter/cupertino.dart';
import "package:flutter/material.dart";
import 'package:shop_flutter_mobile/colors.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

const customColor = AppColors();

class Products extends StatefulWidget {
  const Products({Key? key}) : super(key: key);

  @override
  _ProductsState createState() => _ProductsState();
}

class _ProductsState extends State<Products> {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
            //flex: 2,
            child: Container(
          color: customColor.dRed,
          child: Center(
            child: Text(
              AppLocalizations.of(context)!.delivery,
              style: const TextStyle(
                  fontSize: 25,
                  fontWeight: FontWeight.normal,
                  color: Colors.white),
            ),
          ),
        )),
        /* Expanded(
            flex: 4,
            child: Container(
              color: customColor.everSignin,
            )), */
      ],
    );
  }
}
