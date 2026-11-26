// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Spanish Castilian (`es`).
class AppLocalizationsEs extends AppLocalizations {
  AppLocalizationsEs([String locale = 'es']) : super(locale);

  @override
  String get languageId => 'es-ES';

  @override
  String get languageName => 'Español';

  @override
  String get currentDirection => 'ltr';

  @override
  String get sidebarSide => 'left';

  @override
  String get inviteViewWelcomeTo => 'Bienvenido a';

  @override
  String get inviteViewEver => 'Tu-Pedido';

  @override
  String get inviteViewInfoMissing => '¡Falta información!';

  @override
  String get inviteViewYourInviteCode => 'Su código de invitado';

  @override
  String get inviteViewInvitedTextTitle => '¡Gracias por registrarte!';

  @override
  String get inviteViewInvitedTextDetails =>
      'Le enviaremos una notificación con un código de invitación cuando lancemos en:';

  @override
  String get inviteViewNotInvitedByCodeTitle => '¡Código erroneo!';

  @override
  String get inviteViewNotInvitedByCodeDetails =>
      'Asegúrate de estar en el lugar que dice tu código';

  @override
  String get inviteViewCantAccessLocation =>
      'No se puede acceder a tu ubicación';

  @override
  String get inviteViewCantAccessLocationGetInByAddress =>
      'No se puede acceder a tu ubicación, intenta ingresar por dirección';

  @override
  String get inviteViewGetInByAddress => 'Registrarse por dirección';

  @override
  String get inviteViewGetIn => '¡Entrar!';

  @override
  String get inviteViewYourAddress => 'Escribe tu dirección';

  @override
  String get inviteViewLaunchNotification =>
      'Prometemos mostrar solo productos relevantes de acuerdo con su dirección';

  @override
  String get inviteViewByCodeOrWhat => 'Entrar con invitación';

  @override
  String get inviteViewByCodeInvited =>
      'Inicie sesión con el código de invitación';

  @override
  String get inviteViewByCodeLogoDetails =>
      'Entrega de Comida y Comida para Llevar';

  @override
  String get inviteViewByCodeInviteCode => 'Código de invitación';

  @override
  String get inviteViewDetectingLocation =>
      'Estamos intentando detectar tu dirección actual...';

  @override
  String get productsViewTitle => 'Productos';

  @override
  String get productsViewBuyButtonPre => 'Comprar por ';

  @override
  String get productsViewBuyButtonSuf => '';

  @override
  String get productsViewNotAvailable => 'Producto no disponible';

  @override
  String get productsViewMinutes => 'min';

  @override
  String get productsViewDelivery => 'Delivery';

  @override
  String get productsViewTakeaway => 'Para retirar';

  @override
  String get productsViewReadyfor => 'Listo para';

  @override
  String get productsViewDetailsDetails => 'Detalles';

  @override
  String get productsViewDetailsBack => 'Regresar';

  @override
  String get productsViewDetailsIncludes => 'Incluye';

  @override
  String get productsViewDetailsBuyFor => 'Comprar por ';

  @override
  String get helpViewTitle => 'Ayuda';

  @override
  String get orderHistoryViewTitle => 'Historial de Pedidos';

  @override
  String get orderHistoryViewDetails => 'Detalles';

  @override
  String get lastPurchasesViewTitle => 'Ultimas Compras';

  @override
  String get lastPurchasesViewNothingOrdered => 'No existen pedidos todavía';

  @override
  String get lastPurchasesViewToProducts => 'A Prodcutos';

  @override
  String get aboutViewTitle => 'Acerca de';

  @override
  String get termsOfUseViewTitle => 'Términos de uso';

  @override
  String get privacyViewTitle => 'Privacidad';

  @override
  String get languageViewTitle => 'Seleccionar Idioma';

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
  String get buyPopupOrderPaid => 'El pedido cuesta \$';

  @override
  String get buyPopupPaymentFailed =>
      'El pago ha fallado. Por favor, inténtelo de nuevo.';

  @override
  String get buyPopupEmailNotSaved =>
      'No pudimos guardar su correo electrónico, así que no se ha cobrado nada en su tarjeta. Compruebe el correo electrónico o use otro y vuelva a intentarlo.';

  @override
  String get buyPopupCancelStatuses0Title =>
      'El pedido se canceló mientras se preparaba el almacén!';

  @override
  String get buyPopupCancelStatuses0Details => '';

  @override
  String get buyPopupCancelStatuses0NotPaidNote => '';

  @override
  String get buyPopupViewOrderProducts => 'Ver productos de pedido';

  @override
  String get buyPopupStatuses0Title => '¡Estamos preparando el pedido!';

  @override
  String buyPopupStatuses0Details(String time) {
    return 'Lo tendrás en $time minutos';
  }

  @override
  String buyPopupStatuses0NotPaidNote(String amount) {
    return 'Ten pronto $amount en efectivo';
  }

  @override
  String get buyPopupStatuses1Title => '¡Delivery en camino!';

  @override
  String buyPopupStatuses1Details(String time) {
    return 'Recibirás el pedido en $time minutos';
  }

  @override
  String buyPopupStatuses1NotPaidNote(String amount) {
    return 'Ten pronto $amount en efectivo';
  }

  @override
  String get buyPopupStatuses2Title => '¡Ya estamos en tu casa!';

  @override
  String get buyPopupStatuses2Details => 'Recibirás el pedido en segundos';

  @override
  String buyPopupStatuses2NotPaidNote(String amount) {
    return 'Ten pronto $amount en efectivo';
  }

  @override
  String get buyPopupStatuses3Title => '¡Pedido Completado!';

  @override
  String get buyPopupStatuses3Details => 'Gracias por usar nuestro servicio';

  @override
  String buyPopupStatuses3NotPaidNote(String amount) {
    return '';
  }

  @override
  String get buyPopupStatusesTakeawayTitle => '¡Estamos preparando el pedido!';

  @override
  String buyPopupStatusesTakeawayDetails(String time) {
    return 'Lo tendrás en $time minutos';
  }

  @override
  String buyPopupStatusesTakeawayNotPaidNote(String amount) {
    return 'Ten pronto $amount en efectivo';
  }

  @override
  String get buyPopupDeliveryStatusWe => 'Nosotros';

  @override
  String get buyPopupDeliveryStatusCarrier => 'Delivery';

  @override
  String get buyPopupDeliveryStatusYou => 'Tú';

  @override
  String get buyPopupDeliveryWrongDeliveryWrong => '¡La entrega salió mal!';

  @override
  String get buyPopupDeliveryWrongProcessingWrong =>
      '¡El procesamiento fue mal!';

  @override
  String get buyPopupDeliveryWrongTryAgain => 'Por favor, intenta de nuevo';

  @override
  String get buyPopupDeliveryWrongCallForDetails => 'Llama por detalles';

  @override
  String get buyPopupElapsedTimeTitle => 'Tiempo transcurrido';

  @override
  String get buyPopupButtonsUndo => 'Deshacer';

  @override
  String get buyPopupButtonsPayNow => 'Pagar con Tarjeta';

  @override
  String buyPopupButtonsPayX(String amount) {
    return 'Pagar $amount';
  }

  @override
  String get buyPopupButtonsPayWithFixedCard => 'Pagar con';

  @override
  String get buyPopupButtonsPaid => 'Pago';

  @override
  String get buyPopupButtonsEnd => '¡Buen apetito!';

  @override
  String get buyPopupButtonsCancel => 'Cancelar';

  @override
  String get buyPopupButtonsGotIt => '¡Lo tengo!';

  @override
  String get buyPopupButtonsImHere => 'Estamos aquí';

  @override
  String get buyPopupButtonsShowQrCode => 'Mostrar código QR';

  @override
  String get buyPopupButtonsShowProducts => 'Mostrar productos';

  @override
  String get buyPopupUndoPopupTitle => 'Estás seguro?';

  @override
  String get buyPopupUndoPopupDetails0 =>
      '¡Deshacer te devolverá el dinero, pero';

  @override
  String get buyPopupUndoPopupDetails1 => 'perderás';

  @override
  String get buyPopupUndoPopupDetails2 => 'el pedido!';

  @override
  String get sideMenuTitle => 'Ever';

  @override
  String get sideMenuGroupsNoTitleDiverTitle => '';

  @override
  String get sideMenuGroupsNoTitleItemsProducts => 'Productos';

  @override
  String get sideMenuGroupsNoTitleItemsLastPurchases => 'Ultimas Compras';

  @override
  String get sideMenuGroupsNoTitleItemsCallUs => 'Llámanos';

  @override
  String get sideMenuGroupsNoTitleItemsOrderHistory => 'Historial de pedidos';

  @override
  String get sideMenuGroupsStoreStoreTitle => 'Comercio';

  @override
  String get sideMenuGroupsStoreItemsCallWaiter => 'Llámanos';

  @override
  String get sideMenuGroupsStoreItemsAbout => 'Acerca de';

  @override
  String get sideMenuGroupsSettingsDiverTitle => 'Configuraciones';

  @override
  String get sideMenuGroupsSettingsItemsLanguage => 'Idioma';

  @override
  String get sideMenuGroupsInfoDiverTitle => 'Información';

  @override
  String get sideMenuGroupsInfoItemsFaq => 'Ayuda';

  @override
  String get sideMenuGroupsInfoItemsAboutUs => 'Acerca de';

  @override
  String get sideMenuGroupsInfoItemsTermsOfUse => 'Condiciones de uso';

  @override
  String get sideMenuGroupsInfoItemsPrivacy => 'Privacidad';

  @override
  String get sideMenuGroupsInfoCallWeAppologise => 'Pedimos perdón!';

  @override
  String get sideMenuGroupsInfoCallCallUnsuccessfull =>
      'La llamada no fue exitosa!';

  @override
  String get sideMenuGroupsLegalsDiverTitle => 'LEGAL';

  @override
  String get sideMenuGroupsLegalsItemsTermsOfUse => 'Condiciones de uso';

  @override
  String get sideMenuGroupsLegalsItemsPrivacy => 'Privacidad';

  @override
  String get timerMinutes => 'Minutos';

  @override
  String get timerSeconds => 'Segundos';

  @override
  String get connectionErrorViewTitle => 'No hay conexión al Servidor';

  @override
  String get connectionErrorViewDescription0 =>
      'Por favor asegúrate de que estás';

  @override
  String get connectionErrorViewDescription1 => 'conectado a Internet';

  @override
  String get connectionErrorViewDescription2 => 'o inténtalo mas tarde';

  @override
  String get merchantsViewCloseToYou => 'Comerciantes cerca de ti';

  @override
  String get merchantsViewName => 'Nombre del Comercio';

  @override
  String get merchantsViewWithName => 'Comercios';

  @override
  String get noServerViewNoServer => 'Se perdió la conexión con el servidor';

  @override
  String get or => 'O';

  @override
  String get orLowercase => 'o';

  @override
  String get yes => 'Si';

  @override
  String get no => 'No';

  @override
  String get ok => 'Ok';

  @override
  String get city => 'Ciudad';

  @override
  String get street => 'Calle';

  @override
  String get house => 'Número de puerta';

  @override
  String get apartment => 'Apartmento';

  @override
  String get back => 'Volver';

  @override
  String get more => 'Más';

  @override
  String get to => 'Hacia';

  @override
  String get storeInfo => 'Información del Comercio';

  @override
  String get map => 'Mapa';

  @override
  String get orderInfo => 'Información del Pedido';

  @override
  String get close => 'Cerrar';

  @override
  String get scan => 'Escanear';

  @override
  String get merchants => 'Comercios';

  @override
  String get notFound => '¡No hay resultados!';

  @override
  String get inStore => 'En el comercio';

  @override
  String get exitStore => 'Salir del comercio';

  @override
  String get failed => 'Error';

  @override
  String get canceled => 'Cancelado';

  @override
  String get inDelivery => 'En viaje';

  @override
  String get pending => 'Pendiente';

  @override
  String get completed => 'Completado';

  @override
  String get browse => 'Vistazo';

  @override
  String get english => 'Inglés';

  @override
  String get hebrew => 'Hebreo';

  @override
  String get russian => 'Ruso';

  @override
  String get bulgarian => 'Búlgaro';

  @override
  String get spanish => 'Español';

  @override
  String get french => 'Francés';

  @override
  String get select => 'Seleccione';

  @override
  String get locationNotes => 'Notas de ubicación';

  @override
  String get enterNotesHere => 'Introduce notas aquí';

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
