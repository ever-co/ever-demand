import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:material_ui/material_ui.dart';
import 'package:url_launcher/url_launcher.dart';

/// `tel:` calls (Cordova `CallNumber.callNumber` in the Ionic app).
abstract interface class PhoneDialer {
  /// True when the dialer opened.
  Future<bool> call(String number);
}

class UrlLauncherDialer implements PhoneDialer {
  const UrlLauncherDialer();

  @override
  Future<bool> call(String number) async {
    try {
      return await launchUrl(Uri(scheme: 'tel', path: number));
    } on Object {
      return false;
    }
  }
}

/// Network reachability (Cordova `Network` in the Ionic app).
abstract interface class ConnectivityWatcher {
  /// Emits `false` when the device goes offline and `true` when it is back.
  Stream<bool> onlineChanges();
}

class ConnectivityPlusWatcher implements ConnectivityWatcher {
  ConnectivityPlusWatcher([Connectivity? connectivity])
      : _connectivity = connectivity ?? Connectivity();

  final Connectivity _connectivity;

  static bool _online(List<ConnectivityResult> r) =>
      r.any((ConnectivityResult c) => c != ConnectivityResult.none);

  @override
  Stream<bool> onlineChanges() =>
      _connectivity.onConnectivityChanged.map(_online).distinct();
}

/// Card entry for a new card. Replaces the Ionic app's Stripe Checkout popup:
/// it collects the card in the app and returns a Stripe card token id, which
/// goes to `user.addPaymentMethod` exactly as the Checkout token did.
abstract interface class CardTokenizer {
  /// False without a Stripe publishable key ("Can't pay in app").
  bool get isAvailable;

  /// The card input; [onComplete] reports whether the card is complete.
  Widget buildCardField({required ValueChanged<bool> onComplete});

  /// Tokenizes the card currently in the field.
  Future<String> createToken({String? email});
}

class StripeCardTokenizer implements CardTokenizer {
  StripeCardTokenizer(this.publishableKey);

  final String publishableKey;
  bool _initialised = false;

  @override
  bool get isAvailable => publishableKey.isNotEmpty;

  Future<void> ensureInitialised() async {
    if (_initialised || !isAvailable) return;
    Stripe.publishableKey = publishableKey;
    await Stripe.instance.applySettings();
    _initialised = true;
  }

  @override
  Widget buildCardField({required ValueChanged<bool> onComplete}) => CardField(
        onCardChanged: (CardFieldInputDetails? details) =>
            onComplete(details?.complete ?? false),
      );

  @override
  Future<String> createToken({String? email}) async {
    await ensureInitialised();
    final TokenData token = await Stripe.instance.createToken(
      const CreateTokenParams.card(
        params: CardTokenParams(type: TokenType.Card),
      ),
    );
    return token.id;
  }
}
