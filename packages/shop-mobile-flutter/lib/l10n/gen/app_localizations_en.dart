// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get languageId => 'en-US';

  @override
  String get languageName => 'English';

  @override
  String get currentDirection => 'ltr';

  @override
  String get sidebarSide => 'left';

  @override
  String get inviteViewWelcomeTo => 'Welcome to';

  @override
  String get inviteViewEver => 'Ever';

  @override
  String get inviteViewInfoMissing => 'Some of the information missing!';

  @override
  String get inviteViewYourInviteCode => 'Your invite code';

  @override
  String get inviteViewInvitedTextTitle => 'Thank you for sign up!';

  @override
  String get inviteViewInvitedTextDetails =>
      'We will send you a notification with an invite code when we launch at:';

  @override
  String get inviteViewNotInvitedByCodeTitle => 'Wrong code!';

  @override
  String get inviteViewNotInvitedByCodeDetails =>
      'Please make sure you at the place that came with your code.';

  @override
  String get inviteViewCantAccessLocation => 'Can\'t access your location.';

  @override
  String get inviteViewCantAccessLocationGetInByAddress =>
      'Can\'t access your location, please try to get in by address.';

  @override
  String get inviteViewGetInByAddress => 'Sign up by Address';

  @override
  String get inviteViewGetIn => 'Get inside!';

  @override
  String get inviteViewYourAddress => 'Let us know your Address';

  @override
  String get inviteViewLaunchNotification =>
      'We promise to show only relevant products according to your address';

  @override
  String get inviteViewByCodeOrWhat => 'sign up by Invite';

  @override
  String get inviteViewByCodeInvited => 'Sign in with Invite Code';

  @override
  String get inviteViewByCodeLogoDetails => 'Food Delivery & Takeout';

  @override
  String get inviteViewByCodeInviteCode => 'Invite Code';

  @override
  String get inviteViewDetectingLocation =>
      'Please wait, we attempting to detect your current address...';

  @override
  String get productsViewTitle => 'Products';

  @override
  String get productsViewBuyButtonPre => 'Buy for ';

  @override
  String get productsViewBuyButtonSuf => '';

  @override
  String get productsViewNotAvailable => 'Product not available';

  @override
  String get productsViewMinutes => 'min';

  @override
  String get productsViewDelivery => 'Delivery';

  @override
  String get productsViewTakeaway => 'Takeout';

  @override
  String get productsViewReadyfor => 'Ready for';

  @override
  String get productsViewDetailsDetails => 'Details';

  @override
  String get productsViewDetailsBack => 'Back';

  @override
  String get productsViewDetailsIncludes => 'Includes';

  @override
  String get productsViewDetailsBuyFor => 'Buy for';

  @override
  String get helpViewTitle => 'Help';

  @override
  String get orderHistoryViewTitle => 'Order history';

  @override
  String get orderHistoryViewDetails => 'Details';

  @override
  String get lastPurchasesViewTitle => 'Last Purchases';

  @override
  String get lastPurchasesViewNothingOrdered => 'No orders yet';

  @override
  String get lastPurchasesViewToProducts => 'To Products';

  @override
  String get aboutViewTitle => 'About Us';

  @override
  String get termsOfUseViewTitle => 'Terms of Use';

  @override
  String get privacyViewTitle => 'Privacy';

  @override
  String get languageViewTitle => 'Select Language';

  @override
  String get searchViewViewMore => 'View More';

  @override
  String get searchViewEmptyList => 'No Products Or Merchants Found ... ';

  @override
  String get searchViewSearchPlaceholder => 'Product Or Restorant Name';

  @override
  String get searchViewOpen => 'Open';

  @override
  String get searchViewClosed => 'Closed';

  @override
  String get buyPopupOrderPaid => 'The order is paid \$';

  @override
  String get buyPopupPaymentFailed => 'Payment failed. Please try again.';

  @override
  String get buyPopupEmailNotSaved =>
      'We could not save your email, so your card was not charged. Please check the email or use a different one, then try again.';

  @override
  String get buyPopupCancelStatuses0Title =>
      'The order was cancel while Warehouse Preparation!';

  @override
  String get buyPopupCancelStatuses0Details => '';

  @override
  String get buyPopupCancelStatuses0NotPaidNote => '';

  @override
  String get buyPopupViewOrderProducts => 'View Order Products';

  @override
  String get buyPopupStatuses0Title => 'We\'re preparing the order!';

  @override
  String buyPopupStatuses0Details(String time) {
    return 'You will get it in $time minutes.';
  }

  @override
  String buyPopupStatuses0NotPaidNote(String amount) {
    return 'Prepare your wallet ($amount in cash).';
  }

  @override
  String get buyPopupStatuses1Title => 'Carrier on the way!';

  @override
  String buyPopupStatuses1Details(String time) {
    return 'You will get the order in $time min.';
  }

  @override
  String buyPopupStatuses1NotPaidNote(String amount) {
    return 'Prepare your wallet ($amount in cash).';
  }

  @override
  String get buyPopupStatuses2Title => 'Check your door!';

  @override
  String get buyPopupStatuses2Details => 'You will get the order in seconds.';

  @override
  String buyPopupStatuses2NotPaidNote(String amount) {
    return 'Prepare your wallet ($amount in cash).';
  }

  @override
  String get buyPopupStatuses3Title => 'Order Completed!';

  @override
  String get buyPopupStatuses3Details => 'Thanks for using Ever';

  @override
  String buyPopupStatuses3NotPaidNote(String amount) {
    return '';
  }

  @override
  String get buyPopupStatusesTakeawayTitle => 'We\'re preparing the order!';

  @override
  String buyPopupStatusesTakeawayDetails(String time) {
    return 'You can get it in $time minutes.';
  }

  @override
  String buyPopupStatusesTakeawayNotPaidNote(String amount) {
    return 'Prepare your wallet ($amount in cash).';
  }

  @override
  String get buyPopupDeliveryStatusWe => 'We';

  @override
  String get buyPopupDeliveryStatusCarrier => 'Carrier';

  @override
  String get buyPopupDeliveryStatusYou => 'You';

  @override
  String get buyPopupDeliveryWrongDeliveryWrong => 'The Delivery Went Wrong!';

  @override
  String get buyPopupDeliveryWrongProcessingWrong => 'Processing Went Wrong!';

  @override
  String get buyPopupDeliveryWrongTryAgain => 'Please try again.';

  @override
  String get buyPopupDeliveryWrongCallForDetails => 'Call for details';

  @override
  String get buyPopupElapsedTimeTitle => 'Elapsed time';

  @override
  String get buyPopupButtonsUndo => 'Undo';

  @override
  String get buyPopupButtonsPayNow => 'Pay with Card';

  @override
  String buyPopupButtonsPayX(String amount) {
    return 'Pay $amount';
  }

  @override
  String get buyPopupButtonsPayWithFixedCard => 'Pay with';

  @override
  String get buyPopupButtonsPaid => 'Paid';

  @override
  String get buyPopupButtonsEnd => 'Bon appetit!';

  @override
  String get buyPopupButtonsCancel => 'Cancel';

  @override
  String get buyPopupButtonsGotIt => 'Got It!';

  @override
  String get buyPopupButtonsImHere => 'I\'m here';

  @override
  String get buyPopupButtonsShowQrCode => 'Show QR Code';

  @override
  String get buyPopupButtonsShowProducts => 'Show Products';

  @override
  String get buyPopupUndoPopupTitle => 'Are you sure?';

  @override
  String get buyPopupUndoPopupDetails0 =>
      'Undo will return you the money, but you will';

  @override
  String get buyPopupUndoPopupDetails1 => 'lose';

  @override
  String get buyPopupUndoPopupDetails2 => 'the order!';

  @override
  String get sideMenuTitle => 'Ever';

  @override
  String get sideMenuGroupsNoTitleDiverTitle => '';

  @override
  String get sideMenuGroupsNoTitleItemsProducts => 'Products';

  @override
  String get sideMenuGroupsNoTitleItemsLastPurchases => 'Last Purchases';

  @override
  String get sideMenuGroupsNoTitleItemsCallUs => 'Call Us';

  @override
  String get sideMenuGroupsNoTitleItemsOrderHistory => 'Order history';

  @override
  String get sideMenuGroupsStoreStoreTitle => 'Store';

  @override
  String get sideMenuGroupsStoreItemsCallWaiter => 'Call Waiter';

  @override
  String get sideMenuGroupsStoreItemsAbout => 'About';

  @override
  String get sideMenuGroupsSettingsDiverTitle => 'Settings';

  @override
  String get sideMenuGroupsSettingsItemsLanguage => 'Language';

  @override
  String get sideMenuGroupsInfoDiverTitle => 'Information';

  @override
  String get sideMenuGroupsInfoItemsFaq => 'Help';

  @override
  String get sideMenuGroupsInfoItemsAboutUs => 'About Us';

  @override
  String get sideMenuGroupsInfoItemsTermsOfUse => 'Terms of Use';

  @override
  String get sideMenuGroupsInfoItemsPrivacy => 'Privacy';

  @override
  String get sideMenuGroupsInfoCallWeAppologise => 'We Apologise!';

  @override
  String get sideMenuGroupsInfoCallCallUnsuccessfull =>
      'Call Was Unsuccessful!';

  @override
  String get sideMenuGroupsLegalsDiverTitle => 'LEGAL';

  @override
  String get sideMenuGroupsLegalsItemsTermsOfUse => 'Terms of Use';

  @override
  String get sideMenuGroupsLegalsItemsPrivacy => 'Privacy';

  @override
  String get timerMinutes => 'Minutes';

  @override
  String get timerSeconds => 'Seconds';

  @override
  String get connectionErrorViewTitle => 'No connection to Ever';

  @override
  String get connectionErrorViewDescription0 => 'Please make sure you are';

  @override
  String get connectionErrorViewDescription1 => 'connected to the internet';

  @override
  String get connectionErrorViewDescription2 => 'or try Ever app later.';

  @override
  String get merchantsViewCloseToYou => 'Merchants close to you';

  @override
  String get merchantsViewName => 'Merchant name';

  @override
  String get merchantsViewWithName => 'Merchants with name';

  @override
  String get noServerViewNoServer => 'Server connection is lost';

  @override
  String get or => 'Or';

  @override
  String get orLowercase => 'or';

  @override
  String get yes => 'Yes';

  @override
  String get no => 'No';

  @override
  String get ok => 'Ok';

  @override
  String get city => 'City';

  @override
  String get street => 'Street';

  @override
  String get house => 'House';

  @override
  String get apartment => 'Apartment';

  @override
  String get back => 'Back';

  @override
  String get more => 'more';

  @override
  String get to => 'To';

  @override
  String get storeInfo => 'Store Info';

  @override
  String get map => 'Map';

  @override
  String get orderInfo => 'Order Info';

  @override
  String get close => 'Close';

  @override
  String get scan => 'Scan';

  @override
  String get merchants => 'Merchants';

  @override
  String get notFound => 'Not Found!';

  @override
  String get inStore => 'In Store';

  @override
  String get exitStore => 'Exit Store';

  @override
  String get failed => 'Failed';

  @override
  String get canceled => 'Canceled';

  @override
  String get inDelivery => 'In Delivery';

  @override
  String get pending => 'Pending';

  @override
  String get completed => 'Completed';

  @override
  String get browse => 'Browse';

  @override
  String get english => 'English';

  @override
  String get hebrew => 'Hebrew';

  @override
  String get russian => 'Russian';

  @override
  String get bulgarian => 'Bulgarian';

  @override
  String get spanish => 'Spanish';

  @override
  String get french => 'French';

  @override
  String get select => 'Select';

  @override
  String get locationNotes => 'Location Notes';

  @override
  String get enterNotesHere => 'Enter notes here';

  @override
  String get orderInfoModalTitle => 'Order Info';

  @override
  String get orderInfoModalConfirm => 'Confirm';

  @override
  String get orderInfoModalAddMore => 'Add More';

  @override
  String get wrongCode => 'Wrong code!';

  @override
  String get cardEmailLabel => 'Email';

  @override
  String get cardEmailInvalid => 'Enter a valid email';

  @override
  String get cardNoKey => 'Card payments are not set up in this app.';

  @override
  String get country => 'Country';

  @override
  String get noApartment => 'No apartment';

  @override
  String get retry => 'Retry';

  @override
  String get comment => 'Comment';

  @override
  String get remove => 'Remove';

  @override
  String get save => 'Save';
}
