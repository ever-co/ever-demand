import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:shop_flutter_mobile/widgets/drawers/app_drawer.dart';

class OrderInfoScreen extends StatefulWidget {
  const OrderInfoScreen({Key? key}) : super(key: key);

  @override
  State<OrderInfoScreen> createState() => _OrderInfoScreenState();
}

class _OrderInfoScreenState extends State<OrderInfoScreen> {
  final customColor = const AppColors();

  final snackBar = const SnackBar(
    backgroundColor: Color(0xff10dc60),
    behavior: SnackBarBehavior.fixed,
    content: Text(
      'Yay! A SnackBar!',
      //   style: TextStyle(color: Colors.white),
    ),
  );

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
                  const Text("Prepare your wallet(75.00\$ in cash).",
                      style: TextStyle(color: Colors.white)),
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
            DataTable(
              border: const TableBorder(
                horizontalInside: BorderSide(color: Colors.white),
              ),
              columns: [
                DataColumn(
                  label: Text(AppLocalizations.of(context)!.elapsedTime,
                      style: const TextStyle(color: Colors.white)),
                ),
                DataColumn(
                  label: Text(AppLocalizations.of(context)!.storeInfo,
                      style: const TextStyle(color: Colors.white)),
                ),
              ],
              rows: const [
                DataRow(
                  cells: [
                    DataCell(
                      Text(
                        '00:07',
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                    DataCell(
                      Text(
                        'Pizza Troya',
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20.0),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(
                  Icons.phone,
                  color: Colors.white,
                  size: 16,
                ),
                SizedBox(width: 5.0),
                Text(
                  "(391) 475-03282836",
                  style: TextStyle(
                    color: Colors.white,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ],
            )
          ],
        ),
      ),
      bottomSheet: Container(
        color: customColor.scaffoldBackgroundColor,
        padding: const EdgeInsets.all(5.0),
        child: Row(
          children: [
            MaterialButton(
              padding: const EdgeInsets.symmetric(vertical: 12.5),
              elevation: 0.0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(5.0),
              ),
              color: customColor.primaryColorShade,
              onPressed: () {},
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
                  borderRadius: BorderRadius.circular(5.0),
                ),
                color: customColor.successColorShade,
                onPressed: () =>
                    ScaffoldMessenger.of(context).showSnackBar(snackBar),
                child: Text(
                  AppLocalizations.of(context)!.gotIt,
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            )
          ],
        ),
      ),

      //   Column(
      //     children: [

      //       Text(
      //         AppLocalizations.of(context)!.elapsedTime,
      //         textAlign: TextAlign.center,
      //         style: Theme.of(context)
      //             .textTheme
      //             .headline6!
      //             .copyWith(color: Colors.white),
      //       ),
      //       const SizedBox(height: 10.0),
      //       const Text(
      //         '00:07',
      //         style: TextStyle(color: Colors.white),
      //       ),
      //       const Divider(
      //         color: Colors.white,
      //         thickness: 0.0,
      //         height: 35.0,
      //       ),
      //       Text(
      //         AppLocalizations.of(context)!.storeInfo,
      //         textAlign: TextAlign.center,
      //         style: Theme.of(context)
      //             .textTheme
      //             .headline6!
      //             .copyWith(color: Colors.white),
      //       ),
      //       const SizedBox(height: 10.0),
      //       const Text(
      //         'Pizza Troya',
      //         style: TextStyle(color: Colors.white),
      //       ),
      //     ],
      //   ),
    );
  }
}
