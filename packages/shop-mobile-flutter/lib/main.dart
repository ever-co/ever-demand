import 'package:flutter/material.dart';
//import 'package:shop_flutter_mobile/screens/authentification/login.dart';
//import 'package:shop_flutter_mobile/screens/authentification/signup_address1.dart';
import 'package:shop_flutter_mobile/screens/authentification/signup_thanks.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
//import 'package:shop_flutter_mobile/screens/authentification/login.dart';
// import 'package:shop_flutter_mobile/screens/other/nav.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
/*       localizationsDelegates: AppLocalizations.localizationsDelegates,
     supportedLocales: AppLocalizations.supportedLocales, */
      localizationsDelegates: [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: [
        Locale('en', ''), // English, no country code
        Locale('es', ''), // Spanish, no country code
        Locale('fr', ''), // French, no country code
        Locale('bg', ''), // Bulgarian, no country code
        Locale('ru', ''), // Russian, no country code
        Locale('he', ''), // Hebrew, no country code
      ],
      title: 'Ever',
      debugShowCheckedModeBanner: false,
      home:
          SignupThanks(), // calling the login Page as the first screen, no splashscreen
    );
  }
}
