import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/colors.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

const customColor = AppColors();

class CircularIndicator extends StatefulWidget {
  const CircularIndicator({Key? key}) : super(key: key);

  @override
  CircularIndicatorWidget createState() => CircularIndicatorWidget();
}

class CircularIndicatorWidget extends State {
  bool visible = true;

  loadProgress() {
    if (visible == true) {
      setState(() {
        visible = false;
      });
    } else {
      setState(() {
        visible = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Visibility(
              maintainSize: true,
              maintainAnimation: true,
              maintainState: true,
              visible: visible,
              child: Container(
                  margin: const EdgeInsets.only(top: 50, bottom: 30),
                  child: const CircularProgressIndicator())),
          ElevatedButton.icon(
            onPressed: loadProgress,
            style: ButtonStyle(
              shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                  RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.0),
                // side: const BorderSide(color: white),
              )),
              backgroundColor:
                  MaterialStateProperty.all(customColor.everSignin),
              foregroundColor: MaterialStateProperty.all(Colors.white),
              textStyle: MaterialStateProperty.all(const TextStyle(
                color: Colors.white,
                fontSize: 16,
              )),
            ),
            label: Text(AppLocalizations.of(context)!.getInByAddress),
            icon: const Icon(
              Icons.location_on,
              size: 25.0,
              color: Colors.white,
            ),
          ),
        ],
      ),
    ));
  }
}
