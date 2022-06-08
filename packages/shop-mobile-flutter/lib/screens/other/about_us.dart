import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/widgets/widgets.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

const customColor = AppColors();

class AboutUs extends StatefulWidget {
  const AboutUs({Key? key}) : super(key: key);

  @override
  _AboutUsState createState() => _AboutUsState();
}

class _AboutUsState extends State<AboutUs> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      //body: getBody,
      backgroundColor: customColor.dRed,
      appBar: AppBar(
        centerTitle: true,
        backgroundColor: customColor.dRed,
        title: Text(
          AppLocalizations.of(context)!.aboutus,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.normal,
          ),
        ),
      ),
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
                              fontSize: 18,
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
                        padding: const EdgeInsets.all(40),
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
                              hintText: "Invite Code",
                              hintStyle: TextStyle(
                                color: Colors.grey,
                                fontSize: 16,
                              ),
                              labelText: "Invite Code",
                              labelStyle:
                                  TextStyle(color: Colors.grey, fontSize: 16),
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
