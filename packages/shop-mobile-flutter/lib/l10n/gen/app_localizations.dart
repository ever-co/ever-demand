import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_bg.dart';
import 'app_localizations_en.dart';
import 'app_localizations_es.dart';
import 'app_localizations_fr.dart';
import 'app_localizations_he.dart';
import 'app_localizations_ru.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'gen/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('bg'),
    Locale('en'),
    Locale('es'),
    Locale('fr'),
    Locale('he'),
    Locale('ru'),
  ];

  /// Ionic key LANGUAGE.ID
  ///
  /// In en, this message translates to:
  /// **'en-US'**
  String get languageId;

  /// Ionic key LANGUAGE.NAME
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get languageName;

  /// Ionic key CURRENT_DIRECTION
  ///
  /// In en, this message translates to:
  /// **'ltr'**
  String get currentDirection;

  /// Ionic key SIDEBAR_SIDE
  ///
  /// In en, this message translates to:
  /// **'left'**
  String get sidebarSide;

  /// Ionic key INVITE_VIEW.WELCOME_TO
  ///
  /// In en, this message translates to:
  /// **'Welcome to'**
  String get inviteViewWelcomeTo;

  /// Ionic key INVITE_VIEW.EVER
  ///
  /// In en, this message translates to:
  /// **'Ever'**
  String get inviteViewEver;

  /// Ionic key INVITE_VIEW.INFO_MISSING
  ///
  /// In en, this message translates to:
  /// **'Some of the information missing!'**
  String get inviteViewInfoMissing;

  /// Ionic key INVITE_VIEW.YOUR_INVITE_CODE
  ///
  /// In en, this message translates to:
  /// **'Your invite code'**
  String get inviteViewYourInviteCode;

  /// Ionic key INVITE_VIEW.INVITED_TEXT.TITLE
  ///
  /// In en, this message translates to:
  /// **'Thank you for sign up!'**
  String get inviteViewInvitedTextTitle;

  /// Ionic key INVITE_VIEW.INVITED_TEXT.DETAILS
  ///
  /// In en, this message translates to:
  /// **'We will send you a notification with an invite code when we launch at:'**
  String get inviteViewInvitedTextDetails;

  /// Ionic key INVITE_VIEW.NOT_INVITED_BY_CODE.TITLE
  ///
  /// In en, this message translates to:
  /// **'Wrong code!'**
  String get inviteViewNotInvitedByCodeTitle;

  /// Ionic key INVITE_VIEW.NOT_INVITED_BY_CODE.DETAILS
  ///
  /// In en, this message translates to:
  /// **'Please make sure you at the place that came with your code.'**
  String get inviteViewNotInvitedByCodeDetails;

  /// Ionic key INVITE_VIEW.CANT_ACCESS_LOCATION
  ///
  /// In en, this message translates to:
  /// **'Can\'t access your location.'**
  String get inviteViewCantAccessLocation;

  /// Ionic key INVITE_VIEW.CANT_ACCESS_LOCATION_GET_IN_BY_ADDRESS
  ///
  /// In en, this message translates to:
  /// **'Can\'t access your location, please try to get in by address.'**
  String get inviteViewCantAccessLocationGetInByAddress;

  /// Ionic key INVITE_VIEW.GET_IN_BY_ADDRESS
  ///
  /// In en, this message translates to:
  /// **'Sign up by Address'**
  String get inviteViewGetInByAddress;

  /// Ionic key INVITE_VIEW.GET_IN
  ///
  /// In en, this message translates to:
  /// **'Get inside!'**
  String get inviteViewGetIn;

  /// Ionic key INVITE_VIEW.YOUR_ADDRESS
  ///
  /// In en, this message translates to:
  /// **'Let us know your Address'**
  String get inviteViewYourAddress;

  /// Ionic key INVITE_VIEW.LAUNCH_NOTIFICATION
  ///
  /// In en, this message translates to:
  /// **'We promise to show only relevant products according to your address'**
  String get inviteViewLaunchNotification;

  /// Ionic key INVITE_VIEW.BY_CODE.OR_WHAT
  ///
  /// In en, this message translates to:
  /// **'sign up by Invite'**
  String get inviteViewByCodeOrWhat;

  /// Ionic key INVITE_VIEW.BY_CODE.INVITED
  ///
  /// In en, this message translates to:
  /// **'Sign in with Invite Code'**
  String get inviteViewByCodeInvited;

  /// Ionic key INVITE_VIEW.BY_CODE.LOGO.DETAILS
  ///
  /// In en, this message translates to:
  /// **'Food Delivery & Takeout'**
  String get inviteViewByCodeLogoDetails;

  /// Ionic key INVITE_VIEW.BY_CODE.INVITE_CODE
  ///
  /// In en, this message translates to:
  /// **'Invite Code'**
  String get inviteViewByCodeInviteCode;

  /// Ionic key INVITE_VIEW.DETECTING_LOCATION
  ///
  /// In en, this message translates to:
  /// **'Please wait, we attempting to detect your current address...'**
  String get inviteViewDetectingLocation;

  /// Ionic key PRODUCTS_VIEW.TITLE
  ///
  /// In en, this message translates to:
  /// **'Products'**
  String get productsViewTitle;

  /// Ionic key PRODUCTS_VIEW.BUY_BUTTON.PRE
  ///
  /// In en, this message translates to:
  /// **'Buy for '**
  String get productsViewBuyButtonPre;

  /// Ionic key PRODUCTS_VIEW.BUY_BUTTON.SUF
  ///
  /// In en, this message translates to:
  /// **''**
  String get productsViewBuyButtonSuf;

  /// Ionic key PRODUCTS_VIEW.NOT_AVAILABLE
  ///
  /// In en, this message translates to:
  /// **'Product not available'**
  String get productsViewNotAvailable;

  /// Ionic key PRODUCTS_VIEW.MINUTES
  ///
  /// In en, this message translates to:
  /// **'min'**
  String get productsViewMinutes;

  /// Ionic key PRODUCTS_VIEW.DELIVERY
  ///
  /// In en, this message translates to:
  /// **'Delivery'**
  String get productsViewDelivery;

  /// Ionic key PRODUCTS_VIEW.TAKEAWAY
  ///
  /// In en, this message translates to:
  /// **'Takeout'**
  String get productsViewTakeaway;

  /// Ionic key PRODUCTS_VIEW.READYFOR
  ///
  /// In en, this message translates to:
  /// **'Ready for'**
  String get productsViewReadyfor;

  /// Ionic key PRODUCTS_VIEW.DETAILS.DETAILS
  ///
  /// In en, this message translates to:
  /// **'Details'**
  String get productsViewDetailsDetails;

  /// Ionic key PRODUCTS_VIEW.DETAILS.BACK
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get productsViewDetailsBack;

  /// Ionic key PRODUCTS_VIEW.DETAILS.INCLUDES
  ///
  /// In en, this message translates to:
  /// **'Includes'**
  String get productsViewDetailsIncludes;

  /// Ionic key PRODUCTS_VIEW.DETAILS.BUY_FOR
  ///
  /// In en, this message translates to:
  /// **'Buy for'**
  String get productsViewDetailsBuyFor;

  /// Ionic key HELP_VIEW.TITLE
  ///
  /// In en, this message translates to:
  /// **'Help'**
  String get helpViewTitle;

  /// Ionic key ORDER_HISTORY_VIEW.TITLE
  ///
  /// In en, this message translates to:
  /// **'Order history'**
  String get orderHistoryViewTitle;

  /// Ionic key ORDER_HISTORY_VIEW.DETAILS
  ///
  /// In en, this message translates to:
  /// **'Details'**
  String get orderHistoryViewDetails;

  /// Ionic key LAST_PURCHASES_VIEW.TITLE
  ///
  /// In en, this message translates to:
  /// **'Last Purchases'**
  String get lastPurchasesViewTitle;

  /// Ionic key LAST_PURCHASES_VIEW.NOTHING_ORDERED
  ///
  /// In en, this message translates to:
  /// **'No orders yet'**
  String get lastPurchasesViewNothingOrdered;

  /// Ionic key LAST_PURCHASES_VIEW.TO_PRODUCTS
  ///
  /// In en, this message translates to:
  /// **'To Products'**
  String get lastPurchasesViewToProducts;

  /// Ionic key ABOUT_VIEW.TITLE
  ///
  /// In en, this message translates to:
  /// **'About Us'**
  String get aboutViewTitle;

  /// Ionic key TERMS_OF_USE_VIEW.TITLE
  ///
  /// In en, this message translates to:
  /// **'Terms of Use'**
  String get termsOfUseViewTitle;

  /// Ionic key PRIVACY_VIEW.TITLE
  ///
  /// In en, this message translates to:
  /// **'Privacy'**
  String get privacyViewTitle;

  /// Ionic key LANGUAGE_VIEW.TITLE
  ///
  /// In en, this message translates to:
  /// **'Select Language'**
  String get languageViewTitle;

  /// Ionic key SEARCH_VIEW.VIEW_MORE
  ///
  /// In en, this message translates to:
  /// **'View More'**
  String get searchViewViewMore;

  /// Ionic key SEARCH_VIEW.EMPTY_LIST
  ///
  /// In en, this message translates to:
  /// **'No Products Or Merchants Found ... '**
  String get searchViewEmptyList;

  /// Ionic key SEARCH_VIEW.SEARCH_PLACEHOLDER
  ///
  /// In en, this message translates to:
  /// **'Product Or Restorant Name'**
  String get searchViewSearchPlaceholder;

  /// Ionic key SEARCH_VIEW.OPEN
  ///
  /// In en, this message translates to:
  /// **'Open'**
  String get searchViewOpen;

  /// Ionic key SEARCH_VIEW.CLOSED
  ///
  /// In en, this message translates to:
  /// **'Closed'**
  String get searchViewClosed;

  /// Ionic key BUY_POPUP.ORDER_PAID
  ///
  /// In en, this message translates to:
  /// **'The order is paid \$'**
  String get buyPopupOrderPaid;

  /// Ionic key BUY_POPUP.PAYMENT_FAILED
  ///
  /// In en, this message translates to:
  /// **'Payment failed. Please try again.'**
  String get buyPopupPaymentFailed;

  /// Ionic key BUY_POPUP.EMAIL_NOT_SAVED
  ///
  /// In en, this message translates to:
  /// **'We could not save your email, so your card was not charged. Please check the email or use a different one, then try again.'**
  String get buyPopupEmailNotSaved;

  /// Ionic key BUY_POPUP.CANCEL.STATUSES.0.TITLE
  ///
  /// In en, this message translates to:
  /// **'The order was cancel while Warehouse Preparation!'**
  String get buyPopupCancelStatuses0Title;

  /// Ionic key BUY_POPUP.CANCEL.STATUSES.0.DETAILS
  ///
  /// In en, this message translates to:
  /// **''**
  String get buyPopupCancelStatuses0Details;

  /// Ionic key BUY_POPUP.CANCEL.STATUSES.0.NOT_PAID_NOTE
  ///
  /// In en, this message translates to:
  /// **''**
  String get buyPopupCancelStatuses0NotPaidNote;

  /// Ionic key BUY_POPUP.VIEW_ORDER_PRODUCTS
  ///
  /// In en, this message translates to:
  /// **'View Order Products'**
  String get buyPopupViewOrderProducts;

  /// Ionic key BUY_POPUP.STATUSES.0.TITLE
  ///
  /// In en, this message translates to:
  /// **'We\'re preparing the order!'**
  String get buyPopupStatuses0Title;

  /// Ionic key BUY_POPUP.STATUSES.0.DETAILS
  ///
  /// In en, this message translates to:
  /// **'You will get it in {time} minutes.'**
  String buyPopupStatuses0Details(String time);

  /// Ionic key BUY_POPUP.STATUSES.0.NOT_PAID_NOTE
  ///
  /// In en, this message translates to:
  /// **'Prepare your wallet ({amount} in cash).'**
  String buyPopupStatuses0NotPaidNote(String amount);

  /// Ionic key BUY_POPUP.STATUSES.1.TITLE
  ///
  /// In en, this message translates to:
  /// **'Carrier on the way!'**
  String get buyPopupStatuses1Title;

  /// Ionic key BUY_POPUP.STATUSES.1.DETAILS
  ///
  /// In en, this message translates to:
  /// **'You will get the order in {time} min.'**
  String buyPopupStatuses1Details(String time);

  /// Ionic key BUY_POPUP.STATUSES.1.NOT_PAID_NOTE
  ///
  /// In en, this message translates to:
  /// **'Prepare your wallet ({amount} in cash).'**
  String buyPopupStatuses1NotPaidNote(String amount);

  /// Ionic key BUY_POPUP.STATUSES.2.TITLE
  ///
  /// In en, this message translates to:
  /// **'Check your door!'**
  String get buyPopupStatuses2Title;

  /// Ionic key BUY_POPUP.STATUSES.2.DETAILS
  ///
  /// In en, this message translates to:
  /// **'You will get the order in seconds.'**
  String get buyPopupStatuses2Details;

  /// Ionic key BUY_POPUP.STATUSES.2.NOT_PAID_NOTE
  ///
  /// In en, this message translates to:
  /// **'Prepare your wallet ({amount} in cash).'**
  String buyPopupStatuses2NotPaidNote(String amount);

  /// Ionic key BUY_POPUP.STATUSES.3.TITLE
  ///
  /// In en, this message translates to:
  /// **'Order Completed!'**
  String get buyPopupStatuses3Title;

  /// Ionic key BUY_POPUP.STATUSES.3.DETAILS
  ///
  /// In en, this message translates to:
  /// **'Thanks for using Ever'**
  String get buyPopupStatuses3Details;

  /// Ionic key BUY_POPUP.STATUSES.3.NOT_PAID_NOTE
  ///
  /// In en, this message translates to:
  /// **''**
  String buyPopupStatuses3NotPaidNote(String amount);

  /// Ionic key BUY_POPUP.STATUSES_TAKEAWAY.TITLE
  ///
  /// In en, this message translates to:
  /// **'We\'re preparing the order!'**
  String get buyPopupStatusesTakeawayTitle;

  /// Ionic key BUY_POPUP.STATUSES_TAKEAWAY.DETAILS
  ///
  /// In en, this message translates to:
  /// **'You can get it in {time} minutes.'**
  String buyPopupStatusesTakeawayDetails(String time);

  /// Ionic key BUY_POPUP.STATUSES_TAKEAWAY.NOT_PAID_NOTE
  ///
  /// In en, this message translates to:
  /// **'Prepare your wallet ({amount} in cash).'**
  String buyPopupStatusesTakeawayNotPaidNote(String amount);

  /// Ionic key BUY_POPUP.DELIVERY_STATUS.WE
  ///
  /// In en, this message translates to:
  /// **'We'**
  String get buyPopupDeliveryStatusWe;

  /// Ionic key BUY_POPUP.DELIVERY_STATUS.CARRIER
  ///
  /// In en, this message translates to:
  /// **'Carrier'**
  String get buyPopupDeliveryStatusCarrier;

  /// Ionic key BUY_POPUP.DELIVERY_STATUS.YOU
  ///
  /// In en, this message translates to:
  /// **'You'**
  String get buyPopupDeliveryStatusYou;

  /// Ionic key BUY_POPUP.DELIVERY_WRONG.DELIVERY_WRONG
  ///
  /// In en, this message translates to:
  /// **'The Delivery Went Wrong!'**
  String get buyPopupDeliveryWrongDeliveryWrong;

  /// Ionic key BUY_POPUP.DELIVERY_WRONG.PROCESSING_WRONG
  ///
  /// In en, this message translates to:
  /// **'Processing Went Wrong!'**
  String get buyPopupDeliveryWrongProcessingWrong;

  /// Ionic key BUY_POPUP.DELIVERY_WRONG.TRY_AGAIN
  ///
  /// In en, this message translates to:
  /// **'Please try again.'**
  String get buyPopupDeliveryWrongTryAgain;

  /// Ionic key BUY_POPUP.DELIVERY_WRONG.CALL_FOR_DETAILS
  ///
  /// In en, this message translates to:
  /// **'Call for details'**
  String get buyPopupDeliveryWrongCallForDetails;

  /// Ionic key BUY_POPUP.ELAPSED_TIME.TITLE
  ///
  /// In en, this message translates to:
  /// **'Elapsed time'**
  String get buyPopupElapsedTimeTitle;

  /// Ionic key BUY_POPUP.BUTTONS.UNDO
  ///
  /// In en, this message translates to:
  /// **'Undo'**
  String get buyPopupButtonsUndo;

  /// Ionic key BUY_POPUP.BUTTONS.PAY_NOW
  ///
  /// In en, this message translates to:
  /// **'Pay with Card'**
  String get buyPopupButtonsPayNow;

  /// Ionic key BUY_POPUP.BUTTONS.PAY_X
  ///
  /// In en, this message translates to:
  /// **'Pay {amount}'**
  String buyPopupButtonsPayX(String amount);

  /// Ionic key BUY_POPUP.BUTTONS.PAY_WITH_FIXED_CARD
  ///
  /// In en, this message translates to:
  /// **'Pay with'**
  String get buyPopupButtonsPayWithFixedCard;

  /// Ionic key BUY_POPUP.BUTTONS.PAID
  ///
  /// In en, this message translates to:
  /// **'Paid'**
  String get buyPopupButtonsPaid;

  /// Ionic key BUY_POPUP.BUTTONS.END
  ///
  /// In en, this message translates to:
  /// **'Bon appetit!'**
  String get buyPopupButtonsEnd;

  /// Ionic key BUY_POPUP.BUTTONS.CANCEL
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get buyPopupButtonsCancel;

  /// Ionic key BUY_POPUP.BUTTONS.GOT_IT
  ///
  /// In en, this message translates to:
  /// **'Got It!'**
  String get buyPopupButtonsGotIt;

  /// Ionic key BUY_POPUP.BUTTONS.IM_HERE
  ///
  /// In en, this message translates to:
  /// **'I\'m here'**
  String get buyPopupButtonsImHere;

  /// Ionic key BUY_POPUP.BUTTONS.SHOW_QR_CODE
  ///
  /// In en, this message translates to:
  /// **'Show QR Code'**
  String get buyPopupButtonsShowQrCode;

  /// Ionic key BUY_POPUP.BUTTONS.SHOW_PRODUCTS
  ///
  /// In en, this message translates to:
  /// **'Show Products'**
  String get buyPopupButtonsShowProducts;

  /// Ionic key BUY_POPUP.UNDO_POPUP.TITLE
  ///
  /// In en, this message translates to:
  /// **'Are you sure?'**
  String get buyPopupUndoPopupTitle;

  /// Ionic key BUY_POPUP.UNDO_POPUP.DETAILS.0
  ///
  /// In en, this message translates to:
  /// **'Undo will return you the money, but you will'**
  String get buyPopupUndoPopupDetails0;

  /// Ionic key BUY_POPUP.UNDO_POPUP.DETAILS.1
  ///
  /// In en, this message translates to:
  /// **'lose'**
  String get buyPopupUndoPopupDetails1;

  /// Ionic key BUY_POPUP.UNDO_POPUP.DETAILS.2
  ///
  /// In en, this message translates to:
  /// **'the order!'**
  String get buyPopupUndoPopupDetails2;

  /// Ionic key SIDE_MENU.TITLE
  ///
  /// In en, this message translates to:
  /// **'Ever'**
  String get sideMenuTitle;

  /// Ionic key SIDE_MENU.GROUPS.NO_TITLE.DIVER_TITLE
  ///
  /// In en, this message translates to:
  /// **''**
  String get sideMenuGroupsNoTitleDiverTitle;

  /// Ionic key SIDE_MENU.GROUPS.NO_TITLE.ITEMS.PRODUCTS
  ///
  /// In en, this message translates to:
  /// **'Products'**
  String get sideMenuGroupsNoTitleItemsProducts;

  /// Ionic key SIDE_MENU.GROUPS.NO_TITLE.ITEMS.LAST_PURCHASES
  ///
  /// In en, this message translates to:
  /// **'Last Purchases'**
  String get sideMenuGroupsNoTitleItemsLastPurchases;

  /// Ionic key SIDE_MENU.GROUPS.NO_TITLE.ITEMS.CALL_US
  ///
  /// In en, this message translates to:
  /// **'Call Us'**
  String get sideMenuGroupsNoTitleItemsCallUs;

  /// Ionic key SIDE_MENU.GROUPS.NO_TITLE.ITEMS.ORDER_HISTORY
  ///
  /// In en, this message translates to:
  /// **'Order history'**
  String get sideMenuGroupsNoTitleItemsOrderHistory;

  /// Ionic key SIDE_MENU.GROUPS.STORE.STORE_TITLE
  ///
  /// In en, this message translates to:
  /// **'Store'**
  String get sideMenuGroupsStoreStoreTitle;

  /// Ionic key SIDE_MENU.GROUPS.STORE.ITEMS.CALL_WAITER
  ///
  /// In en, this message translates to:
  /// **'Call Waiter'**
  String get sideMenuGroupsStoreItemsCallWaiter;

  /// Ionic key SIDE_MENU.GROUPS.STORE.ITEMS.ABOUT
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get sideMenuGroupsStoreItemsAbout;

  /// Ionic key SIDE_MENU.GROUPS.SETTINGS.DIVER_TITLE
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get sideMenuGroupsSettingsDiverTitle;

  /// Ionic key SIDE_MENU.GROUPS.SETTINGS.ITEMS.LANGUAGE
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get sideMenuGroupsSettingsItemsLanguage;

  /// Ionic key SIDE_MENU.GROUPS.INFO.DIVER_TITLE
  ///
  /// In en, this message translates to:
  /// **'Information'**
  String get sideMenuGroupsInfoDiverTitle;

  /// Ionic key SIDE_MENU.GROUPS.INFO.ITEMS.FAQ
  ///
  /// In en, this message translates to:
  /// **'Help'**
  String get sideMenuGroupsInfoItemsFaq;

  /// Ionic key SIDE_MENU.GROUPS.INFO.ITEMS.ABOUT_US
  ///
  /// In en, this message translates to:
  /// **'About Us'**
  String get sideMenuGroupsInfoItemsAboutUs;

  /// Ionic key SIDE_MENU.GROUPS.INFO.ITEMS.TERMS_OF_USE
  ///
  /// In en, this message translates to:
  /// **'Terms of Use'**
  String get sideMenuGroupsInfoItemsTermsOfUse;

  /// Ionic key SIDE_MENU.GROUPS.INFO.ITEMS.PRIVACY
  ///
  /// In en, this message translates to:
  /// **'Privacy'**
  String get sideMenuGroupsInfoItemsPrivacy;

  /// Ionic key SIDE_MENU.GROUPS.INFO.CALL.WE_APPOLOGISE
  ///
  /// In en, this message translates to:
  /// **'We Apologise!'**
  String get sideMenuGroupsInfoCallWeAppologise;

  /// Ionic key SIDE_MENU.GROUPS.INFO.CALL.CALL_UNSUCCESSFULL
  ///
  /// In en, this message translates to:
  /// **'Call Was Unsuccessful!'**
  String get sideMenuGroupsInfoCallCallUnsuccessfull;

  /// Ionic key SIDE_MENU.GROUPS.LEGALS.DIVER_TITLE
  ///
  /// In en, this message translates to:
  /// **'LEGAL'**
  String get sideMenuGroupsLegalsDiverTitle;

  /// Ionic key SIDE_MENU.GROUPS.LEGALS.ITEMS.TERMS_OF_USE
  ///
  /// In en, this message translates to:
  /// **'Terms of Use'**
  String get sideMenuGroupsLegalsItemsTermsOfUse;

  /// Ionic key SIDE_MENU.GROUPS.LEGALS.ITEMS.PRIVACY
  ///
  /// In en, this message translates to:
  /// **'Privacy'**
  String get sideMenuGroupsLegalsItemsPrivacy;

  /// Ionic key TIMER.MINUTES
  ///
  /// In en, this message translates to:
  /// **'Minutes'**
  String get timerMinutes;

  /// Ionic key TIMER.SECONDS
  ///
  /// In en, this message translates to:
  /// **'Seconds'**
  String get timerSeconds;

  /// Ionic key CONNECTION_ERROR_VIEW.TITLE
  ///
  /// In en, this message translates to:
  /// **'No connection to Ever'**
  String get connectionErrorViewTitle;

  /// Ionic key CONNECTION_ERROR_VIEW.DESCRIPTION.0
  ///
  /// In en, this message translates to:
  /// **'Please make sure you are'**
  String get connectionErrorViewDescription0;

  /// Ionic key CONNECTION_ERROR_VIEW.DESCRIPTION.1
  ///
  /// In en, this message translates to:
  /// **'connected to the internet'**
  String get connectionErrorViewDescription1;

  /// Ionic key CONNECTION_ERROR_VIEW.DESCRIPTION.2
  ///
  /// In en, this message translates to:
  /// **'or try Ever app later.'**
  String get connectionErrorViewDescription2;

  /// Ionic key MERCHANTS_VIEW.CLOSE_TO_YOU
  ///
  /// In en, this message translates to:
  /// **'Merchants close to you'**
  String get merchantsViewCloseToYou;

  /// Ionic key MERCHANTS_VIEW.NAME
  ///
  /// In en, this message translates to:
  /// **'Merchant name'**
  String get merchantsViewName;

  /// Ionic key MERCHANTS_VIEW.WITH_NAME
  ///
  /// In en, this message translates to:
  /// **'Merchants with name'**
  String get merchantsViewWithName;

  /// Ionic key NO_SERVER_VIEW.NO_SERVER
  ///
  /// In en, this message translates to:
  /// **'Server connection is lost'**
  String get noServerViewNoServer;

  /// Ionic key OR
  ///
  /// In en, this message translates to:
  /// **'Or'**
  String get or;

  /// Ionic key OR_LOWERCASE
  ///
  /// In en, this message translates to:
  /// **'or'**
  String get orLowercase;

  /// Ionic key YES
  ///
  /// In en, this message translates to:
  /// **'Yes'**
  String get yes;

  /// Ionic key NO
  ///
  /// In en, this message translates to:
  /// **'No'**
  String get no;

  /// Ionic key OK
  ///
  /// In en, this message translates to:
  /// **'Ok'**
  String get ok;

  /// Ionic key CITY
  ///
  /// In en, this message translates to:
  /// **'City'**
  String get city;

  /// Ionic key STREET
  ///
  /// In en, this message translates to:
  /// **'Street'**
  String get street;

  /// Ionic key HOUSE
  ///
  /// In en, this message translates to:
  /// **'House'**
  String get house;

  /// Ionic key APARTMENT
  ///
  /// In en, this message translates to:
  /// **'Apartment'**
  String get apartment;

  /// Ionic key BACK
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get back;

  /// Ionic key MORE
  ///
  /// In en, this message translates to:
  /// **'more'**
  String get more;

  /// Ionic key TO
  ///
  /// In en, this message translates to:
  /// **'To'**
  String get to;

  /// Ionic key STORE_INFO
  ///
  /// In en, this message translates to:
  /// **'Store Info'**
  String get storeInfo;

  /// Ionic key MAP
  ///
  /// In en, this message translates to:
  /// **'Map'**
  String get map;

  /// Ionic key ORDER_INFO
  ///
  /// In en, this message translates to:
  /// **'Order Info'**
  String get orderInfo;

  /// Ionic key CLOSE
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// Ionic key SCAN
  ///
  /// In en, this message translates to:
  /// **'Scan'**
  String get scan;

  /// Ionic key MERCHANTS
  ///
  /// In en, this message translates to:
  /// **'Merchants'**
  String get merchants;

  /// Ionic key NOT_FOUND
  ///
  /// In en, this message translates to:
  /// **'Not Found!'**
  String get notFound;

  /// Ionic key IN_STORE
  ///
  /// In en, this message translates to:
  /// **'In Store'**
  String get inStore;

  /// Ionic key EXIT_STORE
  ///
  /// In en, this message translates to:
  /// **'Exit Store'**
  String get exitStore;

  /// Ionic key FAILED
  ///
  /// In en, this message translates to:
  /// **'Failed'**
  String get failed;

  /// Ionic key CANCELED
  ///
  /// In en, this message translates to:
  /// **'Canceled'**
  String get canceled;

  /// Ionic key IN_DELIVERY
  ///
  /// In en, this message translates to:
  /// **'In Delivery'**
  String get inDelivery;

  /// Ionic key PENDING
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get pending;

  /// Ionic key COMPLETED
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get completed;

  /// Ionic key BROWSE
  ///
  /// In en, this message translates to:
  /// **'Browse'**
  String get browse;

  /// Ionic key ENGLISH
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get english;

  /// Ionic key HEBREW
  ///
  /// In en, this message translates to:
  /// **'Hebrew'**
  String get hebrew;

  /// Ionic key RUSSIAN
  ///
  /// In en, this message translates to:
  /// **'Russian'**
  String get russian;

  /// Ionic key BULGARIAN
  ///
  /// In en, this message translates to:
  /// **'Bulgarian'**
  String get bulgarian;

  /// Ionic key SPANISH
  ///
  /// In en, this message translates to:
  /// **'Spanish'**
  String get spanish;

  /// Ionic key FRENCH
  ///
  /// In en, this message translates to:
  /// **'French'**
  String get french;

  /// Ionic key SELECT
  ///
  /// In en, this message translates to:
  /// **'Select'**
  String get select;

  /// Ionic key LOCATION_NOTES
  ///
  /// In en, this message translates to:
  /// **'Location Notes'**
  String get locationNotes;

  /// Ionic key ENTER_NOTES_HERE
  ///
  /// In en, this message translates to:
  /// **'Enter notes here'**
  String get enterNotesHere;

  /// App string (not in the Ionic JSON)
  ///
  /// In en, this message translates to:
  /// **'Order Info'**
  String get orderInfoModalTitle;

  /// App string (not in the Ionic JSON)
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get orderInfoModalConfirm;

  /// App string (not in the Ionic JSON)
  ///
  /// In en, this message translates to:
  /// **'Add More'**
  String get orderInfoModalAddMore;

  /// App string (not in the Ionic JSON)
  ///
  /// In en, this message translates to:
  /// **'Wrong code!'**
  String get wrongCode;

  /// App string (not in the Ionic JSON)
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get cardEmailLabel;

  /// App string (not in the Ionic JSON)
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email'**
  String get cardEmailInvalid;

  /// App string (not in the Ionic JSON)
  ///
  /// In en, this message translates to:
  /// **'Card payments are not set up in this app.'**
  String get cardNoKey;

  /// App string (not in the Ionic JSON)
  ///
  /// In en, this message translates to:
  /// **'Country'**
  String get country;

  /// App string (not in the Ionic JSON)
  ///
  /// In en, this message translates to:
  /// **'No apartment'**
  String get noApartment;

  /// App string (not in the Ionic JSON)
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// App string (not in the Ionic JSON)
  ///
  /// In en, this message translates to:
  /// **'Comment'**
  String get comment;

  /// App string (not in the Ionic JSON)
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get remove;

  /// App string (not in the Ionic JSON)
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>[
    'bg',
    'en',
    'es',
    'fr',
    'he',
    'ru',
  ].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'bg':
      return AppLocalizationsBg();
    case 'en':
      return AppLocalizationsEn();
    case 'es':
      return AppLocalizationsEs();
    case 'fr':
      return AppLocalizationsFr();
    case 'he':
      return AppLocalizationsHe();
    case 'ru':
      return AppLocalizationsRu();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
