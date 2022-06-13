import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';

Route<Object?> processErrorDialog(BuildContext context, Object? arguments) {
  return DialogRoute<void>(
    context: context,
    builder: (BuildContext context) => AlertDialog(
      title: Text(
        AppLocalizations.of(context)!.processingWentWrong,
        textAlign: TextAlign.center,
        style: const TextStyle(color: Colors.white),
      ),
      content: Text(
        AppLocalizations.of(context)!.pleaseTryAgain,
        textAlign: TextAlign.center,
        style: const TextStyle(color: Colors.white),
      ),
      contentPadding: const EdgeInsets.fromLTRB(10.0, 20.0, 20.0, 10.0),
      actionsPadding: const EdgeInsets.symmetric(horizontal: 10.0),
      actionsAlignment: MainAxisAlignment.spaceEvenly,
      actions: [
        MaterialButton(
          minWidth: double.infinity,
          elevation: 0.0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0),
          ),
          color: dangerColorShade,
          onPressed: () {
            Navigator.of(context).pop();
          },
          child: Text(
            AppLocalizations.of(context)!.ok,
            style: const TextStyle(color: Colors.white),
          ),
        ),
      ],
      backgroundColor: primaryColor,
    ),
  );
}
