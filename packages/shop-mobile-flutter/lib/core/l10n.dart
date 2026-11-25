import 'package:flutter/widgets.dart';

import '../data/models/enums.dart';
import '../l10n/gen/app_localizations.dart';

export '../l10n/gen/app_localizations.dart';

extension L10nContext on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this);
}

/// The `BUY_POPUP.STATUSES.<step>` texts (or `BUY_POPUP.CANCEL.STATUSES.0`
/// for a cancelled order), with `%t` and `%s` filled in.
({String title, String details, String notPaidNote}) orderStatusTexts(
  AppLocalizations l10n, {
  required DeliveryStep step,
  required bool cancelled,
  required String timeRange,
  required String amount,
}) {
  if (cancelled) {
    // The Ionic JSON has only index 0 under CANCEL.STATUSES; other steps
    // render empty there.
    if (step == DeliveryStep.warehouse) {
      return (
        title: l10n.buyPopupCancelStatuses0Title,
        details: l10n.buyPopupCancelStatuses0Details,
        notPaidNote: l10n.buyPopupCancelStatuses0NotPaidNote,
      );
    }
    return (title: '', details: '', notPaidNote: '');
  }
  return switch (step) {
    DeliveryStep.warehouse => (
        title: l10n.buyPopupStatuses0Title,
        details: l10n.buyPopupStatuses0Details(timeRange),
        notPaidNote: l10n.buyPopupStatuses0NotPaidNote(amount),
      ),
    DeliveryStep.carrier => (
        title: l10n.buyPopupStatuses1Title,
        details: l10n.buyPopupStatuses1Details(timeRange),
        notPaidNote: l10n.buyPopupStatuses1NotPaidNote(amount),
      ),
    DeliveryStep.customer => (
        title: l10n.buyPopupStatuses2Title,
        details: l10n.buyPopupStatuses2Details,
        notPaidNote: l10n.buyPopupStatuses2NotPaidNote(amount),
      ),
    DeliveryStep.completed => (
        title: l10n.buyPopupStatuses3Title,
        details: l10n.buyPopupStatuses3Details,
        notPaidNote: l10n.buyPopupStatuses3NotPaidNote,
      ),
  };
}

/// Language names of the language page.
String languageName(AppLocalizations l10n, String language) =>
    switch (language) {
      'en-US' => l10n.english,
      'bg-BG' => l10n.bulgarian,
      'he-IL' => l10n.hebrew,
      'ru-RU' => l10n.russian,
      'es-ES' => l10n.spanish,
      'fr-FR' => l10n.french,
      _ => language,
    };
