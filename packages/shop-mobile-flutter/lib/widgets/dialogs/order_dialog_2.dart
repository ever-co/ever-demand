import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

Route<Object?> orderDialog2(BuildContext context, Object? arguments) {
  Widget separatorDots() {
    return Row(
      children: const [
        Icon(Icons.circle, size: 5, color: Colors.white24),
        SizedBox(width: 5.0),
        Icon(Icons.circle, size: 5, color: Colors.white24),
      ],
    );
  }

  return DialogRoute<void>(
    context: context,
    builder: (BuildContext context) => AlertDialog(
      scrollable: true,
      contentPadding: EdgeInsets.zero,
      backgroundColor: primaryColor,
      content: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 25.0,
              vertical: 40.0,
            ),
            color: scaffoldBackgroundColor,
            child: Column(
              children: [
                Text(
                  AppLocalizations.of(context)!.weRePreparingTheOrder,
                  textAlign: TextAlign.center,
                  style: Theme.of(context)
                      .textTheme
                      .headline6!
                      .copyWith(color: Colors.white),
                ),
                const SizedBox(height: 20.0),
                const Text(
                  'You can get it in 30-60 minutes.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.normal,
                  ),
                ),
                const Text(
                  "Prepare your wallet (75.00\$ in cash).",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(10.0, 20.0, 10.0, 5.0),
            child: Column(
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
                              fontWeight: FontWeight.w600,
                              fontSize: 18.0,
                              color: Colors.white,
                            ),
                          ),
                          SizedBox(height: 15.0),
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
                              fontWeight: FontWeight.normal,
                              fontSize: 18.0,
                              color: Colors.white.withOpacity(0.4),
                            ),
                          ),
                          const SizedBox(height: 15.0),
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
                              fontWeight: FontWeight.normal,
                              fontSize: 18.0,
                              color: Colors.white.withOpacity(0.4),
                            ),
                          ),
                          const SizedBox(height: 15.0),
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
                const SizedBox(height: 40.0),
                Row(
                  children: [
                    Expanded(
                      child: MaterialButton(
                        elevation: 0.0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                        color: primaryColorShade,
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                        child: Text(
                          AppLocalizations.of(context)!.undo,
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10.0),
                    Expanded(
                      flex: 2,
                      child: MaterialButton(
                        elevation: 0.0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                        color: dangerColor,
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                        child: Text(
                          AppLocalizations.of(context)!.payWithCard,
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    )
                  ],
                ),
              ],
            ),
          )
        ],
      ),
    ),
  );
}
