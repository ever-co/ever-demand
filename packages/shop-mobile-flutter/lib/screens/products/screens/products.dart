import "package:flutter/material.dart";
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/screens/screens.dart';
import 'package:shop_flutter_mobile/widgets/widgets.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({Key? key}) : super(key: key);

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  final customColor = const AppColors();
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
      drawer: const AppDrawer(),
      body: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 10.0),
        itemCount: 3,
        itemBuilder: (context, index) {
          return const ProductItem();
        },
      ),
    );
  }
}
