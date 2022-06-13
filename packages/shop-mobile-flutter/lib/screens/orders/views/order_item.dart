import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:shop_flutter_mobile/widgets/widgets.dart';

class OrderItemScreen extends StatefulWidget {
  const OrderItemScreen({Key? key}) : super(key: key);

  @override
  State<OrderItemScreen> createState() => _OrderItemScreenState();
}

class _OrderItemScreenState extends State<OrderItemScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.orderInfo),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Back', style: TextStyle(color: Colors.white)),
          )
        ],
      ),
      drawer: const AppDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 80.0),
        child: Column(
          mainAxisSize: MainAxisSize.max,
          children: [
            Container(
              height: MediaQuery.of(context).size.height * 0.65,
              width: double.infinity,
              decoration: const BoxDecoration(
                color: primaryColor,
                image: DecorationImage(
                  image: AssetImage('assets/imgs/spiced-pasta.webp'),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(15.0, 30.0, 15.0, 15.0),
              child: Column(
                children: [
                  Center(
                    child: Container(
                      height: 120.0,
                      width: 120.0,
                      decoration: BoxDecoration(
                        color: Colors.white70,
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40.0),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Mix of 23 sushi',
                        style: Theme.of(context)
                            .textTheme
                            .subtitle1!
                            .copyWith(color: Colors.white),
                      ),
                      Text(
                        '#01242019-104',
                        style: Theme.of(context)
                            .textTheme
                            .subtitle1!
                            .copyWith(color: Colors.white),
                      ),
                    ],
                  ),
                ],
              ),
            )
          ],
        ),
      ),
      bottomSheet: Container(
        color: scaffoldBackgroundColor,
        padding: const EdgeInsets.all(5.0),
        child: Row(
          children: [
            MaterialButton(
              padding: const EdgeInsets.symmetric(vertical: 12.5),
              elevation: 0.0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.0),
              ),
              color: primaryColorShade,
              onPressed: () {
                Navigator.of(context).restorablePush(confirmDialog);
              },
              child: Text(
                AppLocalizations.of(context)!.cancel,
                style: const TextStyle(color: Colors.white),
              ),
            ),
            const SizedBox(width: 7.5),
            Expanded(
              child: MaterialButton(
                padding: const EdgeInsets.symmetric(vertical: 12.5),
                elevation: 0.0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.0),
                ),
                color: successColorShade,
                onPressed: () {},
                child: Text(
                  AppLocalizations.of(context)!.gotIt,
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
