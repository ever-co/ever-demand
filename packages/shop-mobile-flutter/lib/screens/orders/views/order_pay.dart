import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:shop_flutter_mobile/widgets/widgets.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class OrderPayScreen extends StatefulWidget {
  const OrderPayScreen({Key? key}) : super(key: key);

  @override
  State<OrderPayScreen> createState() => _OrderPayScreenState();
}

class _OrderPayScreenState extends State<OrderPayScreen> {
  final snackBar = const SnackBar(
    // backgroundColor: Color(0xff10dc60),
    behavior: SnackBarBehavior.fixed,
    content: Text(
      'Yay! A SnackBar!',
      style: TextStyle(color: successColor),
    ),
  );

  Widget separatorDots() {
    return Row(
      children: const [
        Icon(Icons.circle, size: 5, color: Colors.white24),
        SizedBox(width: 5.0),
        Icon(Icons.circle, size: 5, color: Colors.white24),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.orderInfo),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text(
              'Back',
              style: TextStyle(color: Colors.white),
            ),
          )
        ],
      ),
      drawer: const AppDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 80.0),
        child: Column(
          mainAxisSize: MainAxisSize.max,
          children: [
            Padding(
              padding: const EdgeInsets.all(40.0),
              child: Column(
                children: [
                  Text(
                    AppLocalizations.of(context)!.viewOrderProductsStatuses,
                    textAlign: TextAlign.center,
                    style: Theme.of(context)
                        .textTheme
                        .headline6!
                        .copyWith(color: Colors.white),
                  ),
                  const SizedBox(height: 10.0),
                  const Text(
                    'You can get it in 30-60 minutes.',
                    style: TextStyle(color: Colors.white),
                  ),
                  const Text(
                    "Prepare your wallet (75.00\$ in cash).",
                    style: TextStyle(color: Colors.white),
                  ),
                ],
              ),
            ),
            Container(
              height: MediaQuery.of(context).size.height * 0.3,
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 20.0),
            Column(
              children: [
                Text(
                  AppLocalizations.of(context)!.elapsedTime,
                  textAlign: TextAlign.center,
                  style: Theme.of(context)
                      .textTheme
                      .headline6!
                      .copyWith(color: Colors.white),
                ),
                const SizedBox(height: 10.0),
                const Text(
                  '00:07',
                  style: TextStyle(color: Colors.white),
                ),
              ],
            ),
            const SizedBox(height: 30.0),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // We
                  Column(
                    children: const [
                      Text(
                        'We',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18.0,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(height: 20.0),
                      FaIcon(
                        FontAwesomeIcons.building,
                        color: Colors.white,
                        size: 30,
                      )
                    ],
                  ),
                  separatorDots(),
                  // Carrier
                  Column(
                    children: [
                      Text(
                        'Carrier',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18.0,
                          color: Colors.white.withOpacity(0.4),
                        ),
                      ),
                      const SizedBox(height: 20.0),
                      const FaIcon(
                        FontAwesomeIcons.motorcycle,
                        color: Colors.white,
                        size: 30,
                      ),
                    ],
                  ),
                  separatorDots(),
                  // You
                  Column(
                    children: [
                      Text(
                        'You',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18.0,
                          color: Colors.white.withOpacity(0.4),
                        ),
                      ),
                      const SizedBox(height: 20.0),
                      const FaIcon(
                        FontAwesomeIcons.houseChimney,
                        color: Colors.white,
                        size: 30,
                      ),
                    ],
                  ),
                ],
              ),
            ),
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
                Navigator.of(context).restorablePush(processErrorDialog);
              },
              child: Text(
                AppLocalizations.of(context)!.undo,
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
                color: dangerColor,
                onPressed: () => Navigator.of(context).pushNamed('/order-item'),
                // ScaffoldMessenger.of(context).showSnackBar(snackBar),
                child: Text(
                  AppLocalizations.of(context)!.payWithCard,
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
