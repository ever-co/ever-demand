import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/app.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/widgets/drawers/app_drawer.dart';

class OrdersHistoryScreen extends StatefulWidget {
  const OrdersHistoryScreen({Key? key}) : super(key: key);

  @override
  State<OrdersHistoryScreen> createState() => _OrdersHistoryScreenState();
}

class _OrdersHistoryScreenState extends State<OrdersHistoryScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.orderHistory),
      ),
      drawer: const AppDrawer(),
      backgroundColor: customColor.whiteColor,
      body: ListView.builder(
        itemCount: 10,
        itemBuilder: (BuildContext context, int index) {
          return Container(
            margin: const EdgeInsets.symmetric(vertical: 7.5, horizontal: 15.0),
            child: Material(
              borderRadius: BorderRadius.circular(8.0),
              elevation: 4,
              shadowColor: Colors.grey.shade50,
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 10.0),
                child: Column(
                  children: [
                    ListTile(
                      title: const Text('To: Israel 77452, Adshdod'),
                      subtitle: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text('1/24/19, 1:45 PM'),
                          const SizedBox(width: 5),
                          Text(
                            'Completed',
                            style: TextStyle(
                              fontSize: 11,
                              color: customColor.successColor,
                            ),
                          )
                        ],
                      ),
                      leading: Container(
                        width: 50,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade200,
                        ),
                      ),
                      trailing: const Text(
                        '\$31',
                        style: TextStyle(fontSize: 18),
                      ),
                    ),
                    const Divider(),
                    ListTile(
                      title: Row(
                        children: [
                          const Text('Mix of 23 shushi'),
                          const SizedBox(width: 5),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 4.0, vertical: 2.0),
                            decoration: BoxDecoration(
                                color: Colors.grey.shade300,
                                borderRadius: BorderRadius.circular(5)),
                            child: const Center(
                              child: Text(
                                '1',
                                style: TextStyle(fontSize: 11.0),
                              ),
                            ),
                          )
                        ],
                      ),
                      subtitle: const Text('23 Sushi Mix'),
                      leading: Container(
                        width: 50,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade200,
                        ),
                      ),
                      trailing: const Text(
                        '\$31',
                        style: TextStyle(fontSize: 14, color: Colors.black87),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
