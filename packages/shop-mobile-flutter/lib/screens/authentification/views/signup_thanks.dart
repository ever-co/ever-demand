import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:shop_flutter_mobile/widgets/widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class SignupThanksScreen extends StatefulWidget {
  const SignupThanksScreen({Key? key}) : super(key: key);

  @override
  _SignupThanksScreenState createState() => _SignupThanksScreenState();
}

class _SignupThanksScreenState extends State<SignupThanksScreen> {
  final customColor = const AppColors();

  @override
  Widget build(BuildContext context) {
    String address = "3, Av. Tulipiers, Les Volcans, Goma, Goma";
    return Scaffold(
      //body: getBody,
      backgroundColor: customColor.dRed,
      body: SingleChildScrollView(
        child: Container(
          margin: const EdgeInsets.symmetric(
            vertical: 20,
            horizontal: 30,
          ),
          child: Column(
            children: [
              DelayedAnimation(
                // this one controls the logo animation
                delay: 100,
                child: Container(
                  alignment: Alignment.center,
                  // height: 50,
                  margin:
                      const EdgeInsets.symmetric(vertical: 60, horizontal: 30),
                  child: Column(
                    children: [
                      Text(AppLocalizations.of(context)!.ever,
                          style: TextStyle(
                            color: customColor.whiteColor,
                            fontFamily: 'PlutoHeavyItalic',
                            fontSize: 80,
                          )),
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
                // this one controls the logo animation
                delay: 200,
                child: Container(
                  alignment: Alignment.center,
                  // height: 50,
                  margin: const EdgeInsets.only(bottom: 30),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        margin: const EdgeInsets.only(top: 20),
                        child: Text(
                          AppLocalizations.of(context)!.invitedTextTitle,
                          style: TextStyle(
                            color: customColor.whiteColor,
                            fontSize: 20,
                          ),
                        ),
                      ),
                      Container(
                        margin: const EdgeInsets.only(top: 20),
                        child: Text(
                            AppLocalizations.of(context)!.invitedTextDetails,
                            style: TextStyle(
                              color: customColor.greyColor,
                              fontStyle: FontStyle.normal,
                              fontSize: 16,
                            ),
                            textAlign: TextAlign.center),
                      ),
                      Container(
                        margin: const EdgeInsets.only(top: 30),
                        child: Text(address,
                            style: TextStyle(
                              color: customColor.greyColor,
                              fontStyle: FontStyle.normal,
                              fontSize: 16,
                            ),
                            textAlign: TextAlign.center),
                      ),
                      Container(
                        margin: const EdgeInsets.only(top: 20),
                        child:
                            Text(AppLocalizations.of(context)!.signinByInvite,
                                style: TextStyle(
                                  color: customColor.whiteColor,
                                  fontStyle: FontStyle.normal,
                                  fontSize: 16,
                                ),
                                textAlign: TextAlign.center),
                      ),
                      Container(
                        padding: const EdgeInsets.all(30),
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
