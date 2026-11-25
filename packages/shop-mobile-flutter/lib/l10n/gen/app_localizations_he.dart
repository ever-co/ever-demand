// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Hebrew (`he`).
class AppLocalizationsHe extends AppLocalizations {
  AppLocalizationsHe([String locale = 'he']) : super(locale);

  @override
  String get languageId => 'he-IL';

  @override
  String get languageName => 'עברית';

  @override
  String get currentDirection => 'rtl';

  @override
  String get sidebarSide => 'right';

  @override
  String get inviteViewWelcomeTo => 'ברוך הבא ל-';

  @override
  String get inviteViewEver => 'Ever';

  @override
  String get inviteViewInfoMissing => 'אנא מלא את המידע החסר.';

  @override
  String get inviteViewYourInviteCode => 'קוד ההזמנה שלך';

  @override
  String get inviteViewInvitedTextTitle => 'תודה על ההרשמה!';

  @override
  String get inviteViewInvitedTextDetails =>
      'אנחנו נשלח לך הודעה ברגע שנתחיל לפעול בכתובת שלך:';

  @override
  String get inviteViewNotInvitedByCodeTitle => 'קוד שגוי!';

  @override
  String get inviteViewNotInvitedByCodeDetails =>
      'תוודא בבקשה שאתה במקום שמצורף לקוד שלך!';

  @override
  String get inviteViewCantAccessLocation => 'אין גישה למיקום שלך.';

  @override
  String get inviteViewCantAccessLocationGetInByAddress =>
      'אין גישה למיקום שלך, אנא נסה להיכנס באמצעות הכתובת.';

  @override
  String get inviteViewGetInByAddress => 'הירשם עם כתובת';

  @override
  String get inviteViewGetIn => 'כנס';

  @override
  String get inviteViewYourAddress => 'מה הכתובת שלך?';

  @override
  String get inviteViewLaunchNotification =>
      'אנחנו מבטיחים להראות רק מוצרים רלוונטיים בהתאם לכתובת שהוכנסה';

  @override
  String get inviteViewByCodeOrWhat => 'הירשם באמצעות הזמנה';

  @override
  String get inviteViewByCodeInvited => 'היכנס עם הזמנה לאפליקציה';

  @override
  String get inviteViewByCodeLogoDetails => 'משלוחי אוכל וטייק אווי';

  @override
  String get inviteViewByCodeInviteCode => 'קוד הזמנה';

  @override
  String get inviteViewDetectingLocation =>
      'רק רגע... אנחנו מנסים לזהות את הכתובת שלך.';

  @override
  String get productsViewTitle => 'המוצרים שלנו';

  @override
  String get productsViewBuyButtonPre => '';

  @override
  String get productsViewBuyButtonSuf => '-קנה ב';

  @override
  String get productsViewNotAvailable => 'המוצר אינו זמין';

  @override
  String get productsViewMinutes => 'דקות';

  @override
  String get productsViewDelivery => 'משלוח';

  @override
  String get productsViewTakeaway => 'Takeaway';

  @override
  String get productsViewReadyfor => 'מוכן ל-';

  @override
  String get productsViewDetailsDetails => 'פרטים';

  @override
  String get productsViewDetailsBack => 'חזרה';

  @override
  String get productsViewDetailsIncludes => 'כולל';

  @override
  String get productsViewDetailsBuyFor => 'קנה עבור';

  @override
  String get helpViewTitle => 'עֶזרָה';

  @override
  String get orderHistoryViewTitle => 'היסטוריית הזמנות';

  @override
  String get orderHistoryViewDetails => 'פרטים';

  @override
  String get lastPurchasesViewTitle => 'רכישות אחרונות';

  @override
  String get lastPurchasesViewNothingOrdered => 'עדיין לא הזמנת שום דבר';

  @override
  String get lastPurchasesViewToProducts => 'למוצרים';

  @override
  String get aboutViewTitle => 'עלינו';

  @override
  String get termsOfUseViewTitle => 'תנאי שימוש';

  @override
  String get privacyViewTitle => 'פרטיות';

  @override
  String get languageViewTitle => 'בחירת שפה';

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
  String get buyPopupOrderPaid => 'ההזמנה משולמת \$';

  @override
  String get buyPopupPaymentFailed => 'התשלום נכשל. אנא נסה שוב.';

  @override
  String get buyPopupEmailNotSaved =>
      'לא הצלחנו לשמור את כתובת האימייל שלך, ולכן הכרטיס שלך לא חויב. אנא בדוק את כתובת האימייל או השתמש בכתובת אחרת, ונסה שוב.';

  @override
  String get buyPopupCancelStatuses0Title => 'ההזמנה בוטלה תוך כדי הכנת מחסן!';

  @override
  String get buyPopupCancelStatuses0Details => '';

  @override
  String get buyPopupCancelStatuses0NotPaidNote => '';

  @override
  String get buyPopupViewOrderProducts => 'צפו במוצרי הזמנה';

  @override
  String get buyPopupStatuses0Title => 'אנחנו מכינים את ההזמנה!';

  @override
  String buyPopupStatuses0Details(String time) {
    return 'ההזמנה תהיה בידך בעוד $time דקות.';
  }

  @override
  String buyPopupStatuses0NotPaidNote(String amount) {
    return 'תכין/י את הארנק ($amount במזומן).';
  }

  @override
  String get buyPopupStatuses1Title => 'השליח בדרך!';

  @override
  String buyPopupStatuses1Details(String time) {
    return 'ההזמנה תהיה בידך בעוד $time דקות.';
  }

  @override
  String buyPopupStatuses1NotPaidNote(String amount) {
    return 'תכין/י את הארנק ($amount במזומן).';
  }

  @override
  String get buyPopupStatuses2Title => 'בדוק את הדלת שלך!';

  @override
  String get buyPopupStatuses2Details => 'ההזמנה תהיה בידך בעוד רגע.';

  @override
  String buyPopupStatuses2NotPaidNote(String amount) {
    return 'תכין/י את הארנק ($amount במזומן).';
  }

  @override
  String get buyPopupStatuses3Title => 'ההזמנה הושלמה!';

  @override
  String get buyPopupStatuses3Details => 'תודה על השימוש ב-Ever';

  @override
  String buyPopupStatuses3NotPaidNote(String amount) {
    return 'תכין/י את הארנק ($amount במזומן).';
  }

  @override
  String get buyPopupStatusesTakeawayTitle => 'אנחנו מכינים את ההזמנה!';

  @override
  String buyPopupStatusesTakeawayDetails(String time) {
    return 'אתה יכול להכניס אותו $time דקות.';
  }

  @override
  String buyPopupStatusesTakeawayNotPaidNote(String amount) {
    return 'תכין/י את הארנק ($amount במזומן).';
  }

  @override
  String get buyPopupDeliveryStatusWe => 'אנחנו';

  @override
  String get buyPopupDeliveryStatusCarrier => 'השליח';

  @override
  String get buyPopupDeliveryStatusYou => 'אתה';

  @override
  String get buyPopupDeliveryWrongDeliveryWrong => 'המסירה השתבשה!';

  @override
  String get buyPopupDeliveryWrongProcessingWrong => 'עיבוד התבצעה טעות!';

  @override
  String get buyPopupDeliveryWrongTryAgain => 'בבקשה נסה שוב.';

  @override
  String get buyPopupDeliveryWrongCallForDetails => 'התקשר לקבלת פרטים';

  @override
  String get buyPopupElapsedTimeTitle => 'הזמן שחלף';

  @override
  String get buyPopupButtonsUndo => 'ביטול';

  @override
  String get buyPopupButtonsPayNow => 'תשלום באשראי';

  @override
  String buyPopupButtonsPayX(String amount) {
    return 'לשלם $amount';
  }

  @override
  String get buyPopupButtonsPayWithFixedCard => 'שלם בעזרת';

  @override
  String get buyPopupButtonsPaid => 'שולם באשראי';

  @override
  String get buyPopupButtonsEnd => 'בתאבון!';

  @override
  String get buyPopupButtonsCancel => 'בטל';

  @override
  String get buyPopupButtonsGotIt => 'הבנתי';

  @override
  String get buyPopupButtonsImHere => 'אני כאן';

  @override
  String get buyPopupButtonsShowQrCode => 'הצג קוד QR';

  @override
  String get buyPopupButtonsShowProducts => 'הצג מוצרים';

  @override
  String get buyPopupUndoPopupTitle => 'אתה בטוח?';

  @override
  String get buyPopupUndoPopupDetails0 =>
      'החזרת הכסף אולי תחזיר לך את כספך, אבל תנפץ את';

  @override
  String get buyPopupUndoPopupDetails1 => 'ההזמנה שלך!';

  @override
  String get buyPopupUndoPopupDetails2 => '';

  @override
  String get sideMenuTitle => 'Ever';

  @override
  String get sideMenuGroupsNoTitleDiverTitle => '';

  @override
  String get sideMenuGroupsNoTitleItemsProducts => 'מוצרים';

  @override
  String get sideMenuGroupsNoTitleItemsLastPurchases => 'רכישות אחרונות';

  @override
  String get sideMenuGroupsNoTitleItemsCallUs => 'התקשר אלינו';

  @override
  String get sideMenuGroupsNoTitleItemsOrderHistory => 'היסטוריית הזמנות';

  @override
  String get sideMenuGroupsStoreStoreTitle => 'חנות';

  @override
  String get sideMenuGroupsStoreItemsCallWaiter => 'התקשר למלצר';

  @override
  String get sideMenuGroupsStoreItemsAbout => 'על אודות';

  @override
  String get sideMenuGroupsSettingsDiverTitle => 'הגדרות';

  @override
  String get sideMenuGroupsSettingsItemsLanguage => '(Language) שפה';

  @override
  String get sideMenuGroupsInfoDiverTitle => 'מידע';

  @override
  String get sideMenuGroupsInfoItemsFaq => 'עזרה';

  @override
  String get sideMenuGroupsInfoItemsAboutUs => 'עלינו';

  @override
  String get sideMenuGroupsInfoItemsTermsOfUse => 'תנאי שימוש';

  @override
  String get sideMenuGroupsInfoItemsPrivacy => 'פרטיות';

  @override
  String get sideMenuGroupsInfoCallWeAppologise => 'אנו מתנצלים';

  @override
  String get sideMenuGroupsInfoCallCallUnsuccessfull => 'השיחה לא הצליחה';

  @override
  String get sideMenuGroupsLegalsDiverTitle => 'אלמוגים';

  @override
  String get sideMenuGroupsLegalsItemsTermsOfUse => 'תנאי שימוש';

  @override
  String get sideMenuGroupsLegalsItemsPrivacy => 'פרטיות';

  @override
  String get timerMinutes => 'דקות';

  @override
  String get timerSeconds => 'שניות';

  @override
  String get connectionErrorViewTitle => 'אין חיבור ל-Ever';

  @override
  String get connectionErrorViewDescription0 => 'בבקשה תוודא שאתה';

  @override
  String get connectionErrorViewDescription1 => 'מחובר לאינטרנט או תנסה';

  @override
  String get connectionErrorViewDescription2 => 'את האפליקציה מאוחר יותר.';

  @override
  String get merchantsViewCloseToYou => 'סוחרים קרובים אליך';

  @override
  String get merchantsViewName => 'שם סוחר';

  @override
  String get merchantsViewWithName => 'סוחרים עם שם';

  @override
  String get noServerViewNoServer => 'השרת נפל';

  @override
  String get or => 'או';

  @override
  String get orLowercase => 'או';

  @override
  String get yes => 'כן';

  @override
  String get no => 'לא';

  @override
  String get ok => 'אוקי';

  @override
  String get city => 'עיר';

  @override
  String get street => 'רחוב';

  @override
  String get house => 'בית';

  @override
  String get apartment => 'דירה';

  @override
  String get back => 'לחזור';

  @override
  String get more => 'יותר';

  @override
  String get to => 'ל';

  @override
  String get storeInfo => 'מידע חנות';

  @override
  String get map => 'מפה';

  @override
  String get orderInfo => 'פרטי הזמנה';

  @override
  String get close => 'סגור';

  @override
  String get scan => 'סרוק';

  @override
  String get merchants => 'סוחרים';

  @override
  String get notFound => 'אין תוצאות!';

  @override
  String get inStore => 'בחנות';

  @override
  String get exitStore => 'צא מהחנות';

  @override
  String get failed => 'נכשל';

  @override
  String get canceled => 'מבוטל';

  @override
  String get inDelivery => 'במשלוח';

  @override
  String get pending => 'ממתין ל';

  @override
  String get completed => 'הושלם';

  @override
  String get browse => 'לְדַפדֵף';

  @override
  String get english => 'אנגלית';

  @override
  String get hebrew => 'עִברִית';

  @override
  String get russian => 'רוּסִי';

  @override
  String get bulgarian => 'בולגרית';

  @override
  String get spanish => 'ספרדית';

  @override
  String get french => 'צָרְפָתִית';

  @override
  String get select => 'בחר';

  @override
  String get locationNotes => 'הערות מיקום';

  @override
  String get enterNotesHere => 'הזן הערות כאן';

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
