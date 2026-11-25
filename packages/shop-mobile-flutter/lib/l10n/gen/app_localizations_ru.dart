// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Russian (`ru`).
class AppLocalizationsRu extends AppLocalizations {
  AppLocalizationsRu([String locale = 'ru']) : super(locale);

  @override
  String get languageId => 'ru-RU';

  @override
  String get languageName => 'Русский';

  @override
  String get currentDirection => 'ltr';

  @override
  String get sidebarSide => 'left';

  @override
  String get inviteViewWelcomeTo => 'Добро Пожаловать в';

  @override
  String get inviteViewEver => 'Ever';

  @override
  String get inviteViewInfoMissing => 'Некоторая информация отсутствует!';

  @override
  String get inviteViewYourInviteCode => 'Ваш код приглашения';

  @override
  String get inviteViewInvitedTextTitle => 'Спасибо за запрос на приглашение!';

  @override
  String get inviteViewInvitedTextDetails =>
      'Мы вышлем Вам уведомление когда мы будем обслуживать Ваш адрес:';

  @override
  String get inviteViewNotInvitedByCodeTitle => 'Неверный код!';

  @override
  String get inviteViewNotInvitedByCodeDetails =>
      'Пожулуйста убедитесь что Вы находитесь по адресу, который был использован для получения Вашего Кода приглашения в наш сервис.';

  @override
  String get inviteViewCantAccessLocation =>
      'Не возможно получить Ваше местонахождение. Попробуйте зарегистрироваться используя Ваш адрес.';

  @override
  String get inviteViewCantAccessLocationGetInByAddress =>
      'Не возможно получить Ваше местонахождение.';

  @override
  String get inviteViewGetInByAddress => 'Зарегистрироваться';

  @override
  String get inviteViewGetIn => 'Зарегистрироваться';

  @override
  String get inviteViewYourAddress => 'Пожалуйста введите Адрес';

  @override
  String get inviteViewLaunchNotification =>
      'Мы обещаем предлагать Вам только продукты, доступные по указанному адресу';

  @override
  String get inviteViewByCodeOrWhat => 'войти по приглашению';

  @override
  String get inviteViewByCodeInvited => 'Войти по приглашению';

  @override
  String get inviteViewByCodeLogoDetails => 'Доставка Еды & Takeaway';

  @override
  String get inviteViewByCodeInviteCode => 'Код приглашения';

  @override
  String get inviteViewDetectingLocation =>
      'Пожалуйста подождите, мы пытаемся определить Ваш текущий адрес...';

  @override
  String get productsViewTitle => 'Наши Продукты';

  @override
  String get productsViewBuyButtonPre => 'Купить за ';

  @override
  String get productsViewBuyButtonSuf => '';

  @override
  String get productsViewNotAvailable => 'Товар недоступен';

  @override
  String get productsViewMinutes => 'мин';

  @override
  String get productsViewDelivery => 'Доставка';

  @override
  String get productsViewTakeaway => 'Takeaway';

  @override
  String get productsViewReadyfor => 'Готово для';

  @override
  String get productsViewDetailsDetails => 'Детали';

  @override
  String get productsViewDetailsBack => 'Назад';

  @override
  String get productsViewDetailsIncludes => 'Включает';

  @override
  String get productsViewDetailsBuyFor => 'Купить для';

  @override
  String get helpViewTitle => 'Помогите';

  @override
  String get orderHistoryViewTitle => 'История заказов';

  @override
  String get orderHistoryViewDetails => 'Детали';

  @override
  String get lastPurchasesViewTitle => 'Недавние Покупки';

  @override
  String get lastPurchasesViewNothingOrdered => 'Вы еще ничего не заказывали';

  @override
  String get lastPurchasesViewToProducts => 'К Продуктам';

  @override
  String get aboutViewTitle => 'О Нас';

  @override
  String get termsOfUseViewTitle => 'Правила Использования';

  @override
  String get privacyViewTitle => 'Конфиденциальность';

  @override
  String get languageViewTitle => 'Выбор Языка';

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
  String get buyPopupOrderPaid => 'Заказ оплачен \$';

  @override
  String get buyPopupPaymentFailed =>
      'Оплата не прошла. Пожалуйста, попробуйте ещё раз.';

  @override
  String get buyPopupEmailNotSaved =>
      'Не удалось сохранить ваш email, поэтому деньги с карты не списаны. Проверьте адрес электронной почты или укажите другой и попробуйте ещё раз.';

  @override
  String get buyPopupCancelStatuses0Title =>
      'Заказ был отменен при подготовке склада!';

  @override
  String get buyPopupCancelStatuses0Details => '';

  @override
  String get buyPopupCancelStatuses0NotPaidNote => '';

  @override
  String get buyPopupViewOrderProducts => 'Посмотреть продукты для заказа';

  @override
  String get buyPopupStatuses0Title => 'Мы готовим Ваш заказ!';

  @override
  String buyPopupStatuses0Details(String time) {
    return 'Вы должны получить его в течении $time минут.';
  }

  @override
  String buyPopupStatuses0NotPaidNote(String amount) {
    return 'Вам будет необходимо оплатить $amount (наличными курьеру).';
  }

  @override
  String get buyPopupStatuses1Title => 'Курьер по дороге к Вам!';

  @override
  String buyPopupStatuses1Details(String time) {
    return 'Вы должны получить заказ в течении $time минут.';
  }

  @override
  String buyPopupStatuses1NotPaidNote(String amount) {
    return 'Вам будет необходимо оплатить $amount (наличными курьеру).';
  }

  @override
  String get buyPopupStatuses2Title => 'Курьер уже практически у Вас!';

  @override
  String get buyPopupStatuses2Details =>
      'Вы получите заказ через несколько секунд.';

  @override
  String buyPopupStatuses2NotPaidNote(String amount) {
    return 'Вам будет необходимо оплатить $amount (наличными курьеру).';
  }

  @override
  String get buyPopupStatuses3Title => 'Заказ доставлен!';

  @override
  String get buyPopupStatuses3Details => 'Спасибо за использование Ever';

  @override
  String buyPopupStatuses3NotPaidNote(String amount) {
    return '';
  }

  @override
  String get buyPopupStatusesTakeawayTitle => 'Мы готовим Ваш заказ!';

  @override
  String buyPopupStatusesTakeawayDetails(String time) {
    return 'Вы можете получить это в течении $time минут.';
  }

  @override
  String buyPopupStatusesTakeawayNotPaidNote(String amount) {
    return 'Вам будет необходимо оплатить $amount (наличными курьеру).';
  }

  @override
  String get buyPopupDeliveryStatusWe => 'Мы';

  @override
  String get buyPopupDeliveryStatusCarrier => 'Курьер';

  @override
  String get buyPopupDeliveryStatusYou => 'Вы';

  @override
  String get buyPopupDeliveryWrongDeliveryWrong =>
      'Доставка прошла неправильно!';

  @override
  String get buyPopupDeliveryWrongProcessingWrong => 'Произошла ошибка!';

  @override
  String get buyPopupDeliveryWrongTryAgain => 'Пожалуйста, попробуйте еще раз.';

  @override
  String get buyPopupDeliveryWrongCallForDetails => 'Призыв к деталям';

  @override
  String get buyPopupElapsedTimeTitle => 'Пройденное время';

  @override
  String get buyPopupButtonsUndo => 'Отменить';

  @override
  String get buyPopupButtonsPayNow => 'Оплатить Кредиткой';

  @override
  String buyPopupButtonsPayX(String amount) {
    return 'Оплатить $amount';
  }

  @override
  String get buyPopupButtonsPayWithFixedCard => 'Оплатить с';

  @override
  String get buyPopupButtonsPaid => 'Оплачено';

  @override
  String get buyPopupButtonsEnd => 'Наслаждайтесь покупкой!';

  @override
  String get buyPopupButtonsCancel => 'Отменить';

  @override
  String get buyPopupButtonsGotIt => 'Понял';

  @override
  String get buyPopupButtonsImHere => 'Я здесь';

  @override
  String get buyPopupButtonsShowQrCode => 'Показать QR-код';

  @override
  String get buyPopupButtonsShowProducts => 'Показать продукты';

  @override
  String get buyPopupUndoPopupTitle => 'Вы уверены?';

  @override
  String get buyPopupUndoPopupDetails0 =>
      'Отмена приведёт в возврату уплаченной суммы, но Вы';

  @override
  String get buyPopupUndoPopupDetails1 => 'не получите';

  @override
  String get buyPopupUndoPopupDetails2 => 'заказ!';

  @override
  String get sideMenuTitle => 'ever.co';

  @override
  String get sideMenuGroupsNoTitleDiverTitle => '';

  @override
  String get sideMenuGroupsNoTitleItemsProducts => 'Продукты';

  @override
  String get sideMenuGroupsNoTitleItemsLastPurchases => 'Недавние Покупки';

  @override
  String get sideMenuGroupsNoTitleItemsCallUs => 'Позвонить Клиенту';

  @override
  String get sideMenuGroupsNoTitleItemsOrderHistory => 'История заказов';

  @override
  String get sideMenuGroupsStoreStoreTitle => 'Хранить';

  @override
  String get sideMenuGroupsStoreItemsCallWaiter => 'Вызов официанта';

  @override
  String get sideMenuGroupsStoreItemsAbout => 'Около';

  @override
  String get sideMenuGroupsSettingsDiverTitle => 'Настройки';

  @override
  String get sideMenuGroupsSettingsItemsLanguage => 'Язык';

  @override
  String get sideMenuGroupsInfoDiverTitle => 'Информация';

  @override
  String get sideMenuGroupsInfoItemsFaq => 'Помощь';

  @override
  String get sideMenuGroupsInfoItemsAboutUs => 'О Нас';

  @override
  String get sideMenuGroupsInfoItemsTermsOfUse => 'Правила Использования';

  @override
  String get sideMenuGroupsInfoItemsPrivacy => 'Конфиденциальность';

  @override
  String get sideMenuGroupsInfoCallWeAppologise =>
      'Мы приносим свои извинения!';

  @override
  String get sideMenuGroupsInfoCallCallUnsuccessfull => 'Вызов был неудачным!';

  @override
  String get sideMenuGroupsLegalsDiverTitle => 'Юридические дела';

  @override
  String get sideMenuGroupsLegalsItemsTermsOfUse => 'Правила Использования';

  @override
  String get sideMenuGroupsLegalsItemsPrivacy => 'Конфиденциальность';

  @override
  String get timerMinutes => 'Минут';

  @override
  String get timerSeconds => 'Секунд';

  @override
  String get connectionErrorViewTitle => 'Не удалось подключиться к Ever';

  @override
  String get connectionErrorViewDescription0 => 'Проверьте подключение к';

  @override
  String get connectionErrorViewDescription1 =>
      'Интернету и повторите попытку.';

  @override
  String get connectionErrorViewDescription2 => '';

  @override
  String get merchantsViewCloseToYou => 'Торговцы рядом с вами';

  @override
  String get merchantsViewName => 'Имя продавца';

  @override
  String get merchantsViewWithName => 'Торговцы с именем';

  @override
  String get noServerViewNoServer => 'Сервер упал';

  @override
  String get or => 'Или';

  @override
  String get orLowercase => 'или';

  @override
  String get yes => 'Да';

  @override
  String get no => 'Нет';

  @override
  String get ok => 'Ok';

  @override
  String get city => 'Город';

  @override
  String get street => 'Улица';

  @override
  String get house => 'Дом';

  @override
  String get apartment => 'Квартира';

  @override
  String get back => 'Назад';

  @override
  String get more => 'Больше';

  @override
  String get to => 'До';

  @override
  String get storeInfo => 'Информация о магазине';

  @override
  String get map => 'Карта';

  @override
  String get orderInfo => 'Информация о заказе';

  @override
  String get close => 'заканчиваться';

  @override
  String get scan => 'Поиск';

  @override
  String get merchants => 'Купечество';

  @override
  String get notFound => 'Нет результатов!';

  @override
  String get inStore => 'В магазине';

  @override
  String get exitStore => 'Выход из магазина';

  @override
  String get failed => 'Не удалось';

  @override
  String get canceled => 'Отменен';

  @override
  String get inDelivery => 'В доставке';

  @override
  String get pending => 'В ожидании';

  @override
  String get completed => 'Завершенный';

  @override
  String get browse => 'ПРОСМАТРИВАТЬ';

  @override
  String get english => 'Английский';

  @override
  String get hebrew => 'Иврит';

  @override
  String get russian => 'Русский';

  @override
  String get bulgarian => 'Болгарский';

  @override
  String get spanish => 'Испанский';

  @override
  String get french => 'Французский';

  @override
  String get select => 'Выбрать';

  @override
  String get locationNotes => 'Примечания о местонахождении';

  @override
  String get enterNotesHere => 'Введите примечания здесь';

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
