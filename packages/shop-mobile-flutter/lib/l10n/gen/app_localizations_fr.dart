// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for French (`fr`).
class AppLocalizationsFr extends AppLocalizations {
  AppLocalizationsFr([String locale = 'fr']) : super(locale);

  @override
  String get languageId => 'fr-FR';

  @override
  String get languageName => 'Francais';

  @override
  String get currentDirection => 'ltr';

  @override
  String get sidebarSide => 'gauche';

  @override
  String get inviteViewWelcomeTo => 'Bienvenu(e) à';

  @override
  String get inviteViewEver => 'Ever';

  @override
  String get inviteViewInfoMissing => 'Certaines informations sont manquantes!';

  @override
  String get inviteViewYourInviteCode => 'Votre code d\'invitation';

  @override
  String get inviteViewInvitedTextTitle => 'Merci de votre enregistrement!';

  @override
  String get inviteViewInvitedTextDetails =>
      'Nous allons vous enoyer une notification contenant votre code d\'invitation dès que nous lançons à :';

  @override
  String get inviteViewNotInvitedByCodeTitle => 'Le code est incorrect!';

  @override
  String get inviteViewNotInvitedByCodeDetails =>
      'Rassurez vous que vous êtes bien à l\'endroit d\'où a été reçu votre code';

  @override
  String get inviteViewCantAccessLocation =>
      'Nous n\'arrivons à detecter votre emplacement';

  @override
  String get inviteViewCantAccessLocationGetInByAddress =>
      'Nous n\'arrivons pas à reconnaitre votre emplacement, veuillez essayer de rentrer les informations de votre adresse.';

  @override
  String get inviteViewGetInByAddress =>
      'S\'enregistrement à partir d\'une adresse';

  @override
  String get inviteViewGetIn => 'On y va!';

  @override
  String get inviteViewYourAddress => 'Laissez nous detecter votre adresse';

  @override
  String get inviteViewLaunchNotification =>
      'Nous vous affichons que des produits bien spécifiques à votre adresse';

  @override
  String get inviteViewByCodeOrWhat =>
      'S\'enregistrer avec un code d\'invitation';

  @override
  String get inviteViewByCodeInvited =>
      'Se connecter avec le code d\'invitation';

  @override
  String get inviteViewByCodeLogoDetails =>
      'Livraison express des repas & Take Away';

  @override
  String get inviteViewByCodeInviteCode => 'Code d\'invitation';

  @override
  String get inviteViewDetectingLocation =>
      'Veuillez patienter, le temps de detecter votre adresse actuelle...';

  @override
  String get productsViewTitle => 'Produits';

  @override
  String get productsViewBuyButtonPre => 'Acheter ';

  @override
  String get productsViewBuyButtonSuf => '';

  @override
  String get productsViewNotAvailable => 'Produit non disponible';

  @override
  String get productsViewMinutes => 'min';

  @override
  String get productsViewDelivery => 'Livraisons';

  @override
  String get productsViewTakeaway => 'A emporter';

  @override
  String get productsViewReadyfor => 'Prêt à';

  @override
  String get productsViewDetailsDetails => 'Details';

  @override
  String get productsViewDetailsBack => 'Retour';

  @override
  String get productsViewDetailsIncludes => 'Inclus';

  @override
  String get productsViewDetailsBuyFor => 'Acheter';

  @override
  String get helpViewTitle => 'Aide';

  @override
  String get orderHistoryViewTitle => 'Historique de commandes';

  @override
  String get orderHistoryViewDetails => 'Details';

  @override
  String get lastPurchasesViewTitle => 'Derniers achats';

  @override
  String get lastPurchasesViewNothingOrdered => 'Aucune commande';

  @override
  String get lastPurchasesViewToProducts => 'Aux produits';

  @override
  String get aboutViewTitle => 'A propos de nous';

  @override
  String get termsOfUseViewTitle => 'Conditions d\'utilisation';

  @override
  String get privacyViewTitle => 'Politique de confidentialité';

  @override
  String get languageViewTitle => 'Choisissez votre langue';

  @override
  String get searchViewViewMore => 'Voir plus';

  @override
  String get searchViewEmptyList => 'Aucun produit ou marchand trouvé ... ';

  @override
  String get searchViewSearchPlaceholder => 'Produit ou Nom du restaurant';

  @override
  String get searchViewOpen => 'Ouvert';

  @override
  String get searchViewClosed => 'Fermé';

  @override
  String get buyPopupOrderPaid => 'La commande a été payée \$';

  @override
  String get buyPopupPaymentFailed =>
      'Le paiement a échoué. Veuillez réessayer.';

  @override
  String get buyPopupEmailNotSaved =>
      'Nous n\'avons pas pu enregistrer votre adresse e-mail, votre carte n\'a donc pas été débitée. Vérifiez l\'adresse e-mail ou utilisez-en une autre, puis réessayez.';

  @override
  String get buyPopupCancelStatuses0Title =>
      'La commande a été annulée lors de la synchronisation de l\'entrepôt!';

  @override
  String get buyPopupCancelStatuses0Details => '';

  @override
  String get buyPopupCancelStatuses0NotPaidNote => '';

  @override
  String get buyPopupViewOrderProducts => 'Voir les produits commandés';

  @override
  String get buyPopupStatuses0Title => 'En préparation de votre commande!';

  @override
  String buyPopupStatuses0Details(String time) {
    return 'Nous y serons dans $time minutes.';
  }

  @override
  String buyPopupStatuses0NotPaidNote(String amount) {
    return 'Préparez votre portefeuille ($amount en cash).';
  }

  @override
  String get buyPopupStatuses1Title => 'Le livreur est en route!';

  @override
  String buyPopupStatuses1Details(String time) {
    return 'Vous allez recevoir votre commande dans $time min.';
  }

  @override
  String buyPopupStatuses1NotPaidNote(String amount) {
    return 'Préparez votre portefeuille ($amount en cash)..';
  }

  @override
  String get buyPopupStatuses2Title => 'Checkez à votre porte!';

  @override
  String get buyPopupStatuses2Details =>
      'Votre commande sera la dans quelques seconds.';

  @override
  String buyPopupStatuses2NotPaidNote(String amount) {
    return 'Préparez votre portefeuille ($amount en cash)';
  }

  @override
  String get buyPopupStatuses3Title => 'Commande complète!';

  @override
  String get buyPopupStatuses3Details => 'Merci d\'utiliser Ever';

  @override
  String buyPopupStatuses3NotPaidNote(Object amount) {
    return '';
  }

  @override
  String get buyPopupStatusesTakeawayTitle =>
      'En préparation de votre commande!';

  @override
  String buyPopupStatusesTakeawayDetails(String time) {
    return 'Nous y serons dans $time minutes.';
  }

  @override
  String buyPopupStatusesTakeawayNotPaidNote(String amount) {
    return 'Préparez votre portefeuille ($amount en cash).';
  }

  @override
  String get buyPopupDeliveryStatusWe => 'Nous';

  @override
  String get buyPopupDeliveryStatusCarrier => 'Livreur';

  @override
  String get buyPopupDeliveryStatusYou => 'Vous';

  @override
  String get buyPopupDeliveryWrongDeliveryWrong =>
      'La livraison n\'a pas été correcte!';

  @override
  String get buyPopupDeliveryWrongProcessingWrong =>
      'La livraison n\'a pas abouti!';

  @override
  String get buyPopupDeliveryWrongTryAgain => 'SVP Réessayez.';

  @override
  String get buyPopupDeliveryWrongCallForDetails => 'Details';

  @override
  String get buyPopupElapsedTimeTitle => 'Temps écoulé';

  @override
  String get buyPopupButtonsUndo => 'Annuler';

  @override
  String get buyPopupButtonsPayNow => 'Payer avec une carte';

  @override
  String buyPopupButtonsPayX(String amount) {
    return 'Paiement $amount';
  }

  @override
  String get buyPopupButtonsPayWithFixedCard => 'Payer avec';

  @override
  String get buyPopupButtonsPaid => 'Payé';

  @override
  String get buyPopupButtonsEnd => 'Bon appetit!';

  @override
  String get buyPopupButtonsCancel => 'Annuler';

  @override
  String get buyPopupButtonsGotIt => 'J\'ai compris!';

  @override
  String get buyPopupButtonsImHere => 'Je suis ici';

  @override
  String get buyPopupButtonsShowQrCode => 'Montrez votre QR Code';

  @override
  String get buyPopupButtonsShowProducts => 'Voir les produits';

  @override
  String get buyPopupUndoPopupTitle => 'Etes vous sure?';

  @override
  String get buyPopupUndoPopupDetails0 =>
      'En cas d\'annulation le montant payé vous est retourné, mais vous';

  @override
  String get buyPopupUndoPopupDetails1 => 'perdez';

  @override
  String get buyPopupUndoPopupDetails2 => 'votre commande!';

  @override
  String get sideMenuTitle => 'Ever';

  @override
  String get sideMenuGroupsNoTitleDiverTitle => '';

  @override
  String get sideMenuGroupsNoTitleItemsProducts => 'Produits';

  @override
  String get sideMenuGroupsNoTitleItemsLastPurchases => 'Derniers achats';

  @override
  String get sideMenuGroupsNoTitleItemsCallUs => 'Appelez-nous';

  @override
  String get sideMenuGroupsNoTitleItemsOrderHistory =>
      'Historique de commandes';

  @override
  String get sideMenuGroupsStoreStoreTitle => 'Magasin';

  @override
  String get sideMenuGroupsStoreItemsCallWaiter => 'Appelez le serveur';

  @override
  String get sideMenuGroupsStoreItemsAbout => 'A propos de nous';

  @override
  String get sideMenuGroupsSettingsDiverTitle => 'Paramètres';

  @override
  String get sideMenuGroupsSettingsItemsLanguage => 'Langue';

  @override
  String get sideMenuGroupsInfoDiverTitle => 'Information';

  @override
  String get sideMenuGroupsInfoItemsFaq => 'Aide';

  @override
  String get sideMenuGroupsInfoItemsAboutUs => 'A propos de nous';

  @override
  String get sideMenuGroupsInfoItemsTermsOfUse => 'Conditions d\'utilisation';

  @override
  String get sideMenuGroupsInfoItemsPrivacy => 'Politique de confidentialité';

  @override
  String get sideMenuGroupsInfoCallWeAppologise =>
      'Nous nous excusons pour la gêne occasionnée.';

  @override
  String get sideMenuGroupsInfoCallCallUnsuccessfull =>
      'L\'appel n\'a pas abouti.';

  @override
  String get sideMenuGroupsLegalsDiverTitle => 'LEGAL';

  @override
  String get sideMenuGroupsLegalsItemsTermsOfUse => 'Conditions d\'utilisation';

  @override
  String get sideMenuGroupsLegalsItemsPrivacy => 'Politique de confidentialité';

  @override
  String get timerMinutes => 'Minutes';

  @override
  String get timerSeconds => 'Seconds';

  @override
  String get connectionErrorViewTitle => 'Aucune connexion à Ever';

  @override
  String get connectionErrorViewDescription0 => 'Assurez vous que vous êtes';

  @override
  String get connectionErrorViewDescription1 => 'connecté à internet';

  @override
  String get connectionErrorViewDescription2 =>
      'ou essayer de relancer Ever app';

  @override
  String get merchantsViewCloseToYou => 'Vendeurs proches de vous';

  @override
  String get merchantsViewName => 'Nom du vendeur';

  @override
  String get merchantsViewWithName => 'Vendeur avec noms';

  @override
  String get noServerViewNoServer => 'La connexion au serveur a été perdue';

  @override
  String get or => 'Ou';

  @override
  String get orLowercase => 'ou';

  @override
  String get yes => 'Oui';

  @override
  String get no => 'Non';

  @override
  String get ok => 'Ok';

  @override
  String get city => 'Ville ou Cité';

  @override
  String get street => 'Avenue, Rue';

  @override
  String get house => 'Numéro de maison';

  @override
  String get apartment => 'Numéro d\'appartement';

  @override
  String get back => 'Retour';

  @override
  String get more => 'Plus';

  @override
  String get to => 'à';

  @override
  String get storeInfo => 'Magasin';

  @override
  String get map => 'Carte';

  @override
  String get orderInfo => 'Commande';

  @override
  String get close => 'Fermer';

  @override
  String get scan => 'Scanner';

  @override
  String get merchants => 'Vendeurs';

  @override
  String get notFound => 'Non trouvé!';

  @override
  String get inStore => 'Dans le magasin';

  @override
  String get exitStore => 'Sortir du magasin';

  @override
  String get failed => 'Échec';

  @override
  String get canceled => 'Annulé';

  @override
  String get inDelivery => 'En livraison';

  @override
  String get pending => 'En attente';

  @override
  String get completed => 'Terminé';

  @override
  String get browse => 'Parcourir';

  @override
  String get english => 'Anglais';

  @override
  String get hebrew => 'Hébreu';

  @override
  String get russian => 'Russe';

  @override
  String get bulgarian => '';

  @override
  String get spanish => 'Espagnol';

  @override
  String get french => 'French';

  @override
  String get select => 'Sélectionner';

  @override
  String get locationNotes => 'Notes de localisation';

  @override
  String get enterNotesHere => 'Entrez ici vos notes';

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
