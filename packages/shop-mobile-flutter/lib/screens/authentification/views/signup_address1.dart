// ignore_for_file: dead_code
import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:shop_flutter_mobile/widgets/widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'signup_thanks.dart';

class SignupAdressScreen extends StatefulWidget {
  const SignupAdressScreen({Key? key}) : super(key: key);
  @override
  _SignupAdressScreenState createState() => _SignupAdressScreenState();
}

class _SignupAdressScreenState extends State<SignupAdressScreen> {
  final customColor = const AppColors();
  bool isStretched = false;
  bool isDone = true;

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
              const SizedBox(height: 120),
              DelayedAnimation(
                // this one controls the logo animation
                delay: 100,
                child: Container(
                    alignment: Alignment.center,
                    // height: 100,
                    margin: const EdgeInsets.only(top: 10),
                    child: Column(
                      children: [
                        Text(
                          AppLocalizations.of(context)!.yourAddress,
                          style: TextStyle(
                            color: customColor.whiteColor,
                            fontSize: 25,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    )),
              ),
              DelayedAnimation(
                // this one controls the logo animation
                delay: 200,
                child: Container(
                  alignment: Alignment.center,
                  // height: 50,
                  margin: const EdgeInsets.only(top: 10, bottom: 10),
                  child: Column(
                    children: [
                      Text(
                        AppLocalizations.of(context)!.launchNotification,
                        style: TextStyle(
                          color: customColor.greyColor,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
              DelayedAnimation(
                // this one controls the logo animation
                delay: 300,
                child: Container(
                  alignment: Alignment.center,
                  // height: 50,
                  margin: const EdgeInsets.only(top: 30, bottom: 50),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 20),
                      Text(AppLocalizations.of(context)!.detectingLocation,
                          style: TextStyle(
                            color: customColor.whiteColor,
                            fontStyle: FontStyle.normal,
                            fontSize: 16,
                          ),
                          textAlign: TextAlign.center),
                    ],
                  ),
                ),
              ),
              DelayedAnimation(
                // this one controls the button animation
                delay: 100,
                child: Container(
                  width: double.infinity,
                  height: 50,
                  margin: const EdgeInsets.only(top: 50),
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.of(context).push(MaterialPageRoute(
                          builder: (context) => const SignupThanksScreen()));
                    },
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
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
