// ignore_for_file: dead_code
import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:shop_flutter_mobile/widgets/widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
// import 'package:shop_flutter_mobile/screens/authentification/signup_thanks.dart';

const customColor = AppColors();

class SignupAdress2Screen extends StatefulWidget {
  const SignupAdress2Screen({Key? key}) : super(key: key);

  @override
  _SignupAdress2ScreenState createState() => _SignupAdress2ScreenState();
}

class _SignupAdress2ScreenState extends State<SignupAdress2Screen> {
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
                  margin: const EdgeInsets.only(top: 10, bottom: 40),
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
                        contentPadding: EdgeInsets.all(10),
                        enabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: Colors.grey,
                          ),
                          borderRadius: BorderRadius.all(Radius.circular(6)),
                        ),
                        hintText: "Address 1",
                        hintStyle: TextStyle(
                          color: Colors.grey,
                          fontSize: 16,
                        ),
                        labelText: "Address 1",
                        labelStyle: TextStyle(color: Colors.grey, fontSize: 16),
                      ),
                    ),
                  ),
                ),
              ),
              DelayedAnimation(
                delay: 400,
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
                        contentPadding: EdgeInsets.all(10),
                        enabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: Colors.grey,
                          ),
                          borderRadius: BorderRadius.all(Radius.circular(6)),
                        ),
                        hintText: "Address 2",
                        hintStyle: TextStyle(
                          color: Colors.grey,
                          fontSize: 16,
                        ),
                        labelText: "Address 2",
                        labelStyle: TextStyle(color: Colors.grey, fontSize: 16),
                      ),
                    ),
                  ),
                ),
              ),
              DelayedAnimation(
                // this one controls the button animation
                delay: 500,
                child: SizedBox(
                  width: double.infinity,
                  height: 70,
                  // margin: const EdgeInsets.only(bottom: 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: <Widget>[
                      Expanded(
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
                                contentPadding: EdgeInsets.all(10),
                                enabledBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                    color: Colors.grey,
                                  ),
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(6)),
                                ),
                                hintText: "House",
                                hintStyle: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 16,
                                ),
                                labelText: "House",
                                labelStyle:
                                    TextStyle(color: Colors.grey, fontSize: 16),
                              ),
                            ),
                          ),
                        ),
                      ),
                      /* const SizedBox(
                        //Use of SizedBox
                        width: 2,
                      ), */
                      Expanded(
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
                                contentPadding: EdgeInsets.all(10),
                                enabledBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                    color: Colors.grey,
                                  ),
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(6)),
                                ),
                                hintText: "Apartment",
                                hintStyle: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 16,
                                ),
                                labelText: "Apartment",
                                labelStyle:
                                    TextStyle(color: Colors.grey, fontSize: 16),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              DelayedAnimation(
                // this one controls the button animation
                delay: 600,
                child: Container(
                  width: double.infinity,
                  height: 70,
                  margin: const EdgeInsets.only(bottom: 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: <Widget>[
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          child: Theme(
                            data: ThemeData(
                              primaryColor: customColor.whiteColor,
                              primaryColorDark: customColor.dRed,
                            ),
                            child: Column(
                              children: <Widget>[
                                Builder(builder: (context) {
                                  return const Icon(Icons.check_box_rounded,
                                      size: 30, color: Colors.green);
                                }),
                                // alignment: Alignment.TextAlign.right,
                              ],
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
