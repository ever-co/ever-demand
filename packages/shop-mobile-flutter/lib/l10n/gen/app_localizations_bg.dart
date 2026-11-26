// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Bulgarian (`bg`).
class AppLocalizationsBg extends AppLocalizations {
  AppLocalizationsBg([String locale = 'bg']) : super(locale);

  @override
  String get languageId => 'bg-BG';

  @override
  String get languageName => 'Bulgarian';

  @override
  String get currentDirection => 'ltr';

  @override
  String get sidebarSide => 'left';

  @override
  String get inviteViewWelcomeTo => 'Добре дошли';

  @override
  String get inviteViewEver => 'Евър';

  @override
  String get inviteViewInfoMissing => 'Част от информацията липсва!';

  @override
  String get inviteViewYourInviteCode => 'Вашият поканен код';

  @override
  String get inviteViewInvitedTextTitle => 'Благодарим Ви, че се регистрирате!';

  @override
  String get inviteViewInvitedTextDetails =>
      'Ще ви изпратим известие с код за покана, когато стартираме:';

  @override
  String get inviteViewNotInvitedByCodeTitle => 'Грешен код!';

  @override
  String get inviteViewNotInvitedByCodeDetails =>
      'Моля, уверете се, че сте на мястото, където сте получили кода си.';

  @override
  String get inviteViewCantAccessLocation =>
      'Няма достъп до местоположението ви.';

  @override
  String get inviteViewCantAccessLocationGetInByAddress =>
      'Нямате достъп до местоположението си. Моля, опитайте да влезете по адрес.';

  @override
  String get inviteViewGetInByAddress => 'Регистрирайте се по адрес';

  @override
  String get inviteViewGetIn => 'Влез вътре!';

  @override
  String get inviteViewYourAddress => 'Уведомете Вашия адрес';

  @override
  String get inviteViewLaunchNotification =>
      'Обещаваме да показваме само подходящи продукти според вашия адрес';

  @override
  String get inviteViewByCodeOrWhat => 'Регистрирайте се чрез покана';

  @override
  String get inviteViewByCodeInvited => 'Влезте с Invite Code';

  @override
  String get inviteViewByCodeLogoDetails => 'Доставка и вземане на храна';

  @override
  String get inviteViewByCodeInviteCode => 'Код за покана';

  @override
  String get inviteViewDetectingLocation =>
      'Моля, изчакайте, опитваме се да открием настоящия си адрес ...';

  @override
  String get productsViewTitle => 'Продукти';

  @override
  String get productsViewBuyButtonPre => 'Купи за';

  @override
  String get productsViewBuyButtonSuf => '';

  @override
  String get productsViewNotAvailable => 'Продуктът не е наличен';

  @override
  String get productsViewMinutes => 'мин';

  @override
  String get productsViewDelivery => 'Доставка';

  @override
  String get productsViewTakeaway => 'За вкъщи';

  @override
  String get productsViewReadyfor => 'Готов за';

  @override
  String get productsViewDetailsDetails => 'Детайли';

  @override
  String get productsViewDetailsBack => 'Обратно';

  @override
  String get productsViewDetailsIncludes => 'Включва';

  @override
  String get productsViewDetailsBuyFor => 'Купи за';

  @override
  String get helpViewTitle => 'Помощ';

  @override
  String get orderHistoryViewTitle => 'История на поръчките';

  @override
  String get orderHistoryViewDetails => 'Детайли';

  @override
  String get lastPurchasesViewTitle => 'Последни покупки';

  @override
  String get lastPurchasesViewNothingOrdered => 'Все още няма поръчки';

  @override
  String get lastPurchasesViewToProducts => 'Към продукти';

  @override
  String get aboutViewTitle => 'За нас';

  @override
  String get termsOfUseViewTitle => 'Условия за ползване';

  @override
  String get privacyViewTitle => 'Поверителност';

  @override
  String get languageViewTitle => 'Избери език';

  @override
  String get searchViewViewMore => 'Виж още';

  @override
  String get searchViewEmptyList =>
      'Няма намерени продукти или ресторанти ... ';

  @override
  String get searchViewSearchPlaceholder => 'Продукт или ресторант';

  @override
  String get searchViewOpen => 'Отворено';

  @override
  String get searchViewClosed => 'Затворено';

  @override
  String get buyPopupOrderPaid => 'Поръчката е платена \$';

  @override
  String get buyPopupPaymentFailed =>
      'Плащането не бе успешно. Моля, опитайте отново.';

  @override
  String get buyPopupEmailNotSaved =>
      'Не успяхме да запазим имейла Ви, затова картата Ви не беше таксувана. Моля, проверете имейла или използвайте друг и опитайте отново.';

  @override
  String get buyPopupCancelStatuses0Title =>
      'Поръчката беше анулирана по време на подготовката на склада!';

  @override
  String get buyPopupCancelStatuses0Details => '';

  @override
  String get buyPopupCancelStatuses0NotPaidNote => '';

  @override
  String get buyPopupViewOrderProducts => 'Преглед на продукти за поръчка';

  @override
  String get buyPopupStatuses0Title => 'Подготвяме поръчката!';

  @override
  String buyPopupStatuses0Details(String time) {
    return 'Ще я получите между $time минути.';
  }

  @override
  String buyPopupStatuses0NotPaidNote(String amount) {
    return 'Подгответе портфейла си ($amount в брой).';
  }

  @override
  String get buyPopupStatuses1Title => 'Доставчика е в движение!';

  @override
  String buyPopupStatuses1Details(String time) {
    return 'Ще получите реда в $time min.';
  }

  @override
  String buyPopupStatuses1NotPaidNote(String amount) {
    return 'Подгответе портфейла си ($amount в брой).';
  }

  @override
  String get buyPopupStatuses2Title => 'Проверете си вратата!';

  @override
  String get buyPopupStatuses2Details => 'Ще получите реда в секунди.';

  @override
  String buyPopupStatuses2NotPaidNote(String amount) {
    return 'Подгответе портфейла си ($amount в брой).';
  }

  @override
  String get buyPopupStatuses3Title => 'Поръчка завършена!';

  @override
  String get buyPopupStatuses3Details => 'Благодарим Ви, че използвате Ever';

  @override
  String buyPopupStatuses3NotPaidNote(String amount) {
    return '';
  }

  @override
  String get buyPopupStatusesTakeawayTitle => 'Подготвяме поръчката!';

  @override
  String buyPopupStatusesTakeawayDetails(String time) {
    return 'Можете да го получите между $time минути.';
  }

  @override
  String buyPopupStatusesTakeawayNotPaidNote(String amount) {
    return 'Подгответе портфейла си ($amount в брой).';
  }

  @override
  String get buyPopupDeliveryStatusWe => 'Ние';

  @override
  String get buyPopupDeliveryStatusCarrier => 'Доставчик';

  @override
  String get buyPopupDeliveryStatusYou => 'Вие';

  @override
  String get buyPopupDeliveryWrongDeliveryWrong =>
      'Доставката не беше правилно!';

  @override
  String get buyPopupDeliveryWrongProcessingWrong =>
      'Обработката не беше правилно!';

  @override
  String get buyPopupDeliveryWrongTryAgain => 'Моля, опитайте отново.';

  @override
  String get buyPopupDeliveryWrongCallForDetails => 'Обадете се за подробности';

  @override
  String get buyPopupElapsedTimeTitle => 'Изминалото време';

  @override
  String get buyPopupButtonsUndo => 'Отмяна';

  @override
  String get buyPopupButtonsPayNow => 'Плащане с карта';

  @override
  String buyPopupButtonsPayX(String amount) {
    return 'Платете $amount';
  }

  @override
  String get buyPopupButtonsPayWithFixedCard => 'Плати с';

  @override
  String get buyPopupButtonsPaid => 'Платено';

  @override
  String get buyPopupButtonsEnd => 'Добър апетит!';

  @override
  String get buyPopupButtonsCancel => 'Отказ';

  @override
  String get buyPopupButtonsGotIt => 'Схванах го';

  @override
  String get buyPopupButtonsImHere => 'Тук съм';

  @override
  String get buyPopupButtonsShowQrCode => 'Показване на QR код';

  @override
  String get buyPopupButtonsShowProducts => 'Показване на продукти';

  @override
  String get buyPopupUndoPopupTitle => 'Сигурни ли сте?';

  @override
  String get buyPopupUndoPopupDetails0 =>
      'Отмяната ще Ви върне парите, но вие ще';

  @override
  String get buyPopupUndoPopupDetails1 => 'загубите';

  @override
  String get buyPopupUndoPopupDetails2 => 'поръчката!';

  @override
  String get sideMenuTitle => 'Ever';

  @override
  String get sideMenuGroupsNoTitleDiverTitle => '';

  @override
  String get sideMenuGroupsNoTitleItemsProducts => 'Продукти';

  @override
  String get sideMenuGroupsNoTitleItemsLastPurchases => 'Последни покупки';

  @override
  String get sideMenuGroupsNoTitleItemsCallUs => 'Обадете ни се';

  @override
  String get sideMenuGroupsNoTitleItemsOrderHistory => 'История на поръчките';

  @override
  String get sideMenuGroupsStoreStoreTitle => 'Магазин';

  @override
  String get sideMenuGroupsStoreItemsCallWaiter => 'Обадете се на сервитьор';

  @override
  String get sideMenuGroupsStoreItemsAbout => 'Относно';

  @override
  String get sideMenuGroupsSettingsDiverTitle => 'Настройки';

  @override
  String get sideMenuGroupsSettingsItemsLanguage => 'Език';

  @override
  String get sideMenuGroupsInfoDiverTitle => 'Информация';

  @override
  String get sideMenuGroupsInfoItemsFaq => 'Помогне';

  @override
  String get sideMenuGroupsInfoItemsAboutUs => 'За нас';

  @override
  String get sideMenuGroupsInfoItemsTermsOfUse => 'Условия за ползване';

  @override
  String get sideMenuGroupsInfoItemsPrivacy => 'Поверителност';

  @override
  String get sideMenuGroupsInfoCallWeAppologise => 'Извиняваме се!';

  @override
  String get sideMenuGroupsInfoCallCallUnsuccessfull =>
      'Обаждането беше неуспешно!';

  @override
  String get sideMenuGroupsLegalsDiverTitle => 'Юридически';

  @override
  String get sideMenuGroupsLegalsItemsTermsOfUse => 'Условия за ползване';

  @override
  String get sideMenuGroupsLegalsItemsPrivacy => 'Поверителност';

  @override
  String get timerMinutes => 'Минути';

  @override
  String get timerSeconds => 'Секунди';

  @override
  String get connectionErrorViewTitle => 'Няма връзка с Ever';

  @override
  String get connectionErrorViewDescription0 => 'Моля, уверете се, че сте';

  @override
  String get connectionErrorViewDescription1 => 'свързани с интернет';

  @override
  String get connectionErrorViewDescription2 => 'или опитайте по-късно.';

  @override
  String get merchantsViewCloseToYou => 'Търговци близо до вас';

  @override
  String get merchantsViewName => 'Име на търговеца';

  @override
  String get merchantsViewWithName => 'Търговци с име';

  @override
  String get noServerViewNoServer => 'Няма връзка със сървъра';

  @override
  String get or => 'Или';

  @override
  String get orLowercase => 'или';

  @override
  String get yes => 'Да';

  @override
  String get no => 'Не';

  @override
  String get ok => 'Добре';

  @override
  String get city => 'Сити';

  @override
  String get street => 'Улица';

  @override
  String get house => 'Къща';

  @override
  String get apartment => 'Апартамент';

  @override
  String get back => 'Обратно';

  @override
  String get more => 'повече';

  @override
  String get to => 'До';

  @override
  String get storeInfo => 'Информация за магазина';

  @override
  String get map => 'Карта';

  @override
  String get orderInfo => 'Информация за поръчката';

  @override
  String get close => 'Затворен';

  @override
  String get scan => 'Търсене';

  @override
  String get merchants => 'Купечество';

  @override
  String get notFound => 'Няма резултати!';

  @override
  String get inStore => 'В магазина';

  @override
  String get exitStore => 'Излезте от магазина';

  @override
  String get failed => 'Се провали';

  @override
  String get canceled => 'Отменен';

  @override
  String get inDelivery => 'При доставка';

  @override
  String get pending => 'В очакване';

  @override
  String get completed => 'Завършен';

  @override
  String get browse => 'РАЗГЛЕДАЙ';

  @override
  String get english => 'Английски';

  @override
  String get hebrew => 'Иврит';

  @override
  String get russian => 'Руски';

  @override
  String get bulgarian => 'Български';

  @override
  String get spanish => 'испански';

  @override
  String get french => 'Френски';

  @override
  String get select => 'Изберете';

  @override
  String get locationNotes => 'Бележки за местоположението';

  @override
  String get enterNotesHere => 'Въведете бележки тук';

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
