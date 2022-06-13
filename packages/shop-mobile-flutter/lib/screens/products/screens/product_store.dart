import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/screens/screens.dart';
import 'package:shop_flutter_mobile/widgets/drawers/app_drawer.dart';

class ProductStoreScreen extends StatefulWidget {
  const ProductStoreScreen({Key? key}) : super(key: key);

  @override
  State<ProductStoreScreen> createState() => _ProductStoreScreenState();
}

class _ProductStoreScreenState extends State<ProductStoreScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: false,
        title: const Text('Pizza Troya Products'),
        actions: [
          TextButton(
            onPressed: () {},
            child: Center(
              child: Column(
                children: [
                  const Icon(
                    Icons.logout,
                    color: dangerColor,
                    size: 16,
                  ),
                  const SizedBox(height: 5),
                  Text(
                    AppLocalizations.of(context)!.exitStore,
                    style: const TextStyle(fontSize: 10, color: Colors.white),
                  ),
                ],
              ),
            ),
          )
        ],
      ),
      drawer: const AppDrawer(),
      body: const ProductSlide(),
    );
  }
}
