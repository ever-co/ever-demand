import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/colors.dart';
import 'package:shop_flutter_mobile/screens/animations/delayed_animation.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

const customColor = AppColors();

class SignupAdress extends StatefulWidget {
  const SignupAdress({Key? key}) : super(key: key);

  @override
  _SignupAdressState createState() => _SignupAdressState();
}

class _SignupAdressState extends State<SignupAdress> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      //body: getBody,
      backgroundColor: customColor.dRed,
      body: SingleChildScrollView(
        child: Container(
          margin: const EdgeInsets.symmetric(
            vertical: 60,
            horizontal: 30,
          ),
          child: Column(
            children: [
              DelayedAnimation(
                // this one controls the logo animation
                delay: 1500,
                child: Container(
                  alignment: Alignment.center,
                  // height: 50,
                  margin: const EdgeInsets.only(top: 50, bottom: 100),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        AppLocalizations.of(context)!.yourAddress,
                        style: TextStyle(
                          color: customColor.whiteColor,
                          fontSize: 24,
                        ),
                      ),
                      Text(AppLocalizations.of(context)!.launchNotification,
                          style: TextStyle(
                            color: customColor.greyColor,
                            fontStyle: FontStyle.normal,
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.center),
                      Text(AppLocalizations.of(context)!.detectingLocation,
                          style: TextStyle(
                            color: customColor.whiteColor,
                            fontStyle: FontStyle.normal,
                            fontSize: 20,
                          ),
                          textAlign: TextAlign.center),
                      Container(
                        margin: const EdgeInsets.only(top: 20),
                        child: Text(
                            AppLocalizations.of(context)!.detectingLocation,
                            style: TextStyle(
                              color: customColor.whiteColor,
                              fontStyle: FontStyle.normal,
                              fontSize: 20,
                            ),
                            textAlign: TextAlign.center),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
