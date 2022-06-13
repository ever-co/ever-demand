import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';

Route<Object?> confirmDialog(BuildContext context, Object? arguments) {
  return DialogRoute<void>(
    context: context,
    builder: (BuildContext context) => AlertDialog(
      title: Text(
        AppLocalizations.of(context)!.areYouSure,
        textAlign: TextAlign.center,
        style: const TextStyle(color: Colors.white),
      ),
      content: const Text(
        'Undo will return you the money, but you will lose the order!',
        textAlign: TextAlign.center,
        style: TextStyle(color: Colors.white),
      ),
      contentPadding: const EdgeInsets.fromLTRB(20.0, 20.0, 20.0, 15.0),
      actionsAlignment: MainAxisAlignment.spaceEvenly,
      actionsPadding: const EdgeInsets.symmetric(horizontal: 10.0),
      actions: [
        Row(
          children: [
            Expanded(
              child: MaterialButton(
                elevation: 0.0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.0),
                ),
                color: dangerColorShade,
                onPressed: () {
                  Navigator.of(context).pop();
                },
                child: Text(
                  AppLocalizations.of(context)!.no,
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            ),
            const SizedBox(width: 10.0),
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
                  AppLocalizations.of(context)!.yes,
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            )
          ],
        ),
      ],
      backgroundColor: primaryColor,
    ),
  );
}
