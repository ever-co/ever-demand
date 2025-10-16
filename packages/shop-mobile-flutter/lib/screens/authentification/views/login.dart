import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:shop_flutter_mobile/widgets/widgets.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'signup_address1.dart';
import 'signup_address2.dart';
// import 'package:shop_flutter_mobile/screens/authentification/signup_thanks.dart';
// import 'package:shop_flutter_mobile/screens/other/nav.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({Key? key}) : super(key: key);
  final customColor = const AppColors();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: customColor.dRed,
      body: SafeArea(
        child: GestureDetector(
          onTap: () => FocusScope.of(context).unfocus(),
          child: SingleChildScrollView(
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 60, horizontal: 30),
              child: Column(
                children: [
                  DelayedAnimation(
                    // this one controls the logo animation
                    delay: 100,
                    child: Container(
                      alignment: Alignment.center,
                      // height: 50,
                      margin: const EdgeInsets.only(top: 50, bottom: 30),
                      child: Column(
                        children: [
                          Text(
                            AppLocalizations.of(context)!.ever,
                            style: TextStyle(
                              color: customColor.whiteColor,
                              fontFamily: 'PlutoHeavyItalic',
                              fontSize: 80,
                            ),
                          ),
                          Text(
                            AppLocalizations.of(context)!.logoMotto,
                            style: TextStyle(
                              color: customColor.greyColor,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  DelayedAnimation(
                    // this one controls the button animation
                    delay: 150,
                    child: Container(
                      width: double.infinity,
                      height: 40,
                      margin: const EdgeInsets.only(top: 50),
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.of(context).push(MaterialPageRoute(
                              builder: (context) =>
                                  const SignupAdressScreen()));
                        },
                        style: ButtonStyle(
                          shape:
                              MaterialStateProperty.all<RoundedRectangleBorder>(
                            RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              // side: const BorderSide(color: white),
                            ),
                          ),
                          backgroundColor:
                              MaterialStateProperty.all(customColor.everSignin),
                          foregroundColor:
                              MaterialStateProperty.all(Colors.white),
                          textStyle: MaterialStateProperty.all(
                            const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        child:
                            Text(AppLocalizations.of(context)!.getInByAddress),
                      ),
                    ),
                  ),
                  DelayedAnimation(
                    // this one controls the button animation
                    delay: 200,
                    child: Container(
                      width: double.infinity,
                      height: 40,
                      margin: const EdgeInsets.only(top: 10, bottom: 10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: <Widget>[
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        const SignupAdressScreen(),
                                  ),
                                );
                              },
                              style: ButtonStyle(
                                shape: MaterialStateProperty.all<
                                    RoundedRectangleBorder>(
                                  RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12.0),
                                    // side: const BorderSide(color: white),
                                  ),
                                ),
                                backgroundColor: MaterialStateProperty.all(
                                    customColor.facebookColor),
                                foregroundColor:
                                    MaterialStateProperty.all(Colors.white),
                                textStyle: MaterialStateProperty.all(
                                  const TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                              label: const Text(""),
                              icon: const FaIcon(
                                FontAwesomeIcons.facebookSquare,
                                size: 24.0,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(
                            //Use of SizedBox
                            width: 8,
                          ),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        const SignupAdress2Screen(),
                                  ),
                                );
                              },
                              style: ButtonStyle(
                                shape: MaterialStateProperty.all<
                                    RoundedRectangleBorder>(
                                  RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12.0),
                                    // side: const BorderSide(color: white),
                                  ),
                                ),
                                backgroundColor: MaterialStateProperty.all(
                                    customColor.googleColor),
                                foregroundColor:
                                    MaterialStateProperty.all(Colors.white),
                                textStyle: MaterialStateProperty.all(
                                  const TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                              label: const Text(""),
                              icon: const FaIcon(
                                FontAwesomeIcons.google,
                                size: 22.0,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  DelayedAnimation(
                    // this one controls the button animation
                    delay: 250,
                    child: Container(
                      width: double.infinity,
                      height: 50,
                      margin: const EdgeInsets.only(top: 3, bottom: 3),
                      child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: <Widget>[
                            Flexible(
                              flex: 10, // 50%
                              child: Text(
                                AppLocalizations.of(context)!.or,
                                style: TextStyle(
                                  color: customColor.greyColor,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                            const Flexible(
                              flex: 10, // 50%
                              child: Text(" "),
                            ),
                            Flexible(
                              flex: 80, // 50%
                              child: Text(
                                AppLocalizations.of(context)!.signUpByInvite,
                                style: TextStyle(
                                  color: customColor.whiteColor,
                                  fontSize: 14,
                                  fontWeight: FontWeight.normal,
                                ),
                              ),
                            ),
                          ]),
                    ),
                  ),
                  DelayedAnimation(
                    // this one controls the button animation
                    delay: 300,
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      child: Theme(
                        data: ThemeData(
                          primaryColor: customColor.whiteColor,
                          primaryColorDark: customColor.dRed,
                        ),
                        child: TextFormField(
                          cursorColor: Colors.black,
                          keyboardType: TextInputType.text,
                          textAlignVertical: TextAlignVertical.center,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                          ),
                          decoration: const InputDecoration(
                            //isCollapsed: true,
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.fromLTRB(10, 0, 0, 10),
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                color: Colors.grey,
                              ),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(6)),
                            ),
                            hintText: "Invite Code",
                            hintStyle: TextStyle(
                              color: Colors.grey,
                              fontSize: 16,
                            ),
                            hintMaxLines: 1,
                            // labelText: "Invite Code",
                            // labelStyle: TextStyle(color: Colors.grey, fontSize: 16),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
