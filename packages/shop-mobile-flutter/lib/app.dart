import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:shop_flutter_mobile/utils/navigations.dart';

const customColor = AppColors();

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ever',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: customColor.primaryColor,
        scaffoldBackgroundColor: customColor.scaffoldBackgroundColor,
        appBarTheme: AppBarTheme(
          backgroundColor: customColor.appBarColor,
          elevation: 0,
          centerTitle: true,
          systemOverlayStyle: SystemUiOverlayStyle(
            statusBarColor: customColor.appBarColor,
          ),
        ),
      ),
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en', ''), // English, no country code
        Locale('es', ''), // Spanish, no country code
        Locale('fr', ''), // French, no country code
        Locale('bg', ''), // Bulgarian, no country code
        Locale('ru', ''), // Russian, no country code
        Locale('he', ''), // Hebrew, no country code
      ],
      initialRoute: "/login",
      routes: routeNavigations,
      //   home:
      //       const MenuBar(), // calling the login Page as the first screen, no splashscreen
    );
  }
}
