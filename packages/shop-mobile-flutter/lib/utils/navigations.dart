import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/screens/screens.dart';

final Map<String, WidgetBuilder> routeNavigations = {
  "/": (context) => const ProductsScreen(),
  /*
	* Authentication Screens
	*/
  "/login": (context) => const LoginScreen(),
  "/signup-address1": (context) => const SignupAdressScreen(),
  "/signup-address2": (context) => const SignupAdress2Screen(),
  "/signup-thanks": (context) => const SignupThanksScreen(),
  /*
	* Error Screens
	*/
  "/connection-lost": (context) => const ErrorsConnectionLostScreen(),
  /*
	* Info Screens
	*/
  "/info-about": (context) => const InfoAboutScreen(),
  "/info-help": (context) => const InfoHelpScreen(),
  "/info-privacy": (context) => const InfoPrivacyScreen(),
  "/info-terms-of-use": (context) => const InfoTermsOfUseScreen(),
  /*
	* Invite Screens
	*/
  "/invite-by-code": (context) => const InviteByCodeScreen(),
  "/invite-by-location": (context) => const InviteByLocationScreen(),
  "/invite": (context) => const InviteScreen(),
  /*
	* Language Screens
	*/
  "/language": (context) => const LanguageScreen(),
  /*
	* Merchant Screens
	*/
  "/merchants": (context) => const MerchantsScreen(),
  /*
	* Order Screens
	*/
  "/order-card": (context) => const OrderCardScreen(),
  "/order-details": (context) => const OrderDetailsScreen(),
  "/order-history": (context) => const OrdersHistoryScreen(),
  /*
	* Order Screens
	*/
  "/products": (context) => const ProductsScreen(),
  "/product-details": (context) => const ProductDetailsScreen(),
};
