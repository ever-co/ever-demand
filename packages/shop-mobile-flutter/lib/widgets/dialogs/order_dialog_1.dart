import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

Route<Object?> orderDialog1(BuildContext context, Object? arguments) {
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
                  AppLocalizations.of(context)!.elapsedTime.toUpperCase(),
                  textAlign: TextAlign.center,
                  style: Theme.of(context)
                      .textTheme
                      .labelLarge!
                      .copyWith(color: Colors.white),
                ),
                const SizedBox(height: 10.0),
                const Text(
                  '00:07',
                  style: TextStyle(color: Colors.white),
                ),
                Divider(
                  color: Colors.white.withOpacity(0.3),
                  thickness: 0.0,
                  height: 35.0,
                ),
                Text(
                  'Pizza Troya',
                  textAlign: TextAlign.center,
                  style: Theme.of(context)
                      .textTheme
                      .labelLarge!
                      .copyWith(color: Colors.white),
                ),
                const SizedBox(height: 10.0),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(
                      Icons.phone,
                      color: successColor,
                      size: 16,
                    ),
                    SizedBox(width: 5.0),
                    Text(
                      "(391) 475-03282836",
                      style: TextStyle(
                        color: Colors.white,
                        fontStyle: FontStyle.italic,
                        fontSize: 14,
                        // decoration: TextDecoration.underline,
                      ),
                    ),
                  ],
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
                        color: successColor,
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                        child: Text(
                          AppLocalizations.of(context)!.gotIt,
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
