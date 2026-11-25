import 'dart:async';

import 'package:flutter/foundation.dart';

import '../data/models/order.dart';
import '../data/models/user.dart';
import '../data/network/pyro/pyro_router.dart';
import '../data/repositories/shop_api.dart';
import '../data/store/app_store.dart';

/// What the payment widget tells the customer after a tap.
enum PaymentMessage {
  /// Nothing to say (paid, or the tap was ignored).
  none,

  /// `BUY_POPUP.PAYMENT_FAILED`.
  paymentFailed,

  /// `BUY_POPUP.EMAIL_NOT_SAVED`.
  emailNotSaved,

  /// No Stripe publishable key ("Can't pay in app").
  cannotPayInApp,
}

/// The rules of the Ionic `PaymentComponent` (fleet fixes #1645-#1654), one
/// controller per payment widget:
///
/// - on start: `user.getCards(_userId)` → saved card, and
///   `order.getStripeCurrency()` → upper-cased currency (a failure only logs);
/// - `paying` is this widget's flag or [AppStore.isPaying] for the open order,
///   so a second widget for the same order stays disabled;
/// - saved card: `order.payWithStripe(orderId, cardId)` (2 args);
/// - new card: `user.updateEmail` → `user.addPaymentMethod(token)` →
///   `order.payWithStripe(orderId, cardId, currency)` (3 args) →
///   `order.confirm(orderId)`; `StripeCurrencyChangedError` reloads the
///   currency;
/// - messages are translated keys, never server text.
class PaymentController extends ChangeNotifier {
  PaymentController({
    required this.api,
    required this.store,
    required this.hasPublishableKey,
  }) {
    store.addListener(_onStoreChanged);
  }

  final ShopApi api;
  final AppStore store;
  final bool hasPublishableKey;

  PaymentCard? userCard;

  /// The currency cards are charged in (e.g. `USD`); null until loaded, so
  /// the card entry never shows another currency than the one charged.
  String? stripeCurrency;
  bool loadingStripeCurrency = false;
  bool _paying = false;
  bool _disposed = false;

  bool get paying => _paying || store.isPaying(store.orderId);

  /// Pay with card waits for the first currency load; after a failed load
  /// it is enabled again, so a tap can tell the customer and load it again.
  bool get waitingForStripeCurrency =>
      stripeCurrency == null && loadingStripeCurrency;

  void _onStoreChanged() => _notify();

  void _notify() {
    if (!_disposed) notifyListeners();
  }

  /// Loads the saved card and the charge currency (never throws).
  Future<void> init() async {
    await Future.wait(<Future<void>>[loadUserCard(), loadStripeCurrency()]);
  }

  Future<void> loadUserCard() async {
    final String? userId = store.userId;
    if (userId == null) return;
    try {
      final List<PaymentCard> cards = await api.user.getCards(userId);
      userCard = cards.isEmpty ? null : cards.first;
      _notify();
    } on Object catch (e) {
      debugPrint('Could not load the saved cards: $e');
    }
  }

  Future<void> loadStripeCurrency() async {
    loadingStripeCurrency = true;
    _notify();
    try {
      final String currency = await api.order.getStripeCurrency();
      stripeCurrency = currency.toUpperCase();
    } on Object catch (e) {
      debugPrint('Could not load the card charge currency: $e');
    } finally {
      loadingStripeCurrency = false;
      _notify();
    }
  }

  void _startPaying(String orderId) {
    _paying = true;
    store.startPaying(orderId);
  }

  void _stopPaying(String orderId) {
    _paying = false;
    store.stopPaying(orderId);
    _notify();
  }

  /// "Pay with *1234".
  Future<PaymentMessage> payWithSavedCard() async {
    final String? orderId = store.orderId;
    if (orderId == null || paying) return PaymentMessage.none;
    if (!hasPublishableKey) return PaymentMessage.cannotPayInApp;
    final PaymentCard? card = userCard;
    if (card == null) return PaymentMessage.paymentFailed;
    _startPaying(orderId);
    try {
      await api.order.payWithStripe(orderId, card.id);
      return PaymentMessage.none;
    } on Object catch (e) {
      // Declined, refused (already paid / cancelled) or the socket dropped.
      debugPrint('Payment failed: $e');
      return PaymentMessage.paymentFailed;
    } finally {
      _stopPaying(orderId);
    }
  }

  /// "Pay with card" tap, before the card entry opens. Returns the currency
  /// to charge in, or the message to show instead (null currency = do not
  /// open). It never waits on the network.
  ({String? currency, PaymentMessage message}) beginNewCardPayment() {
    if (paying) return (currency: null, message: PaymentMessage.none);
    if (!hasPublishableKey) {
      return (currency: null, message: PaymentMessage.cannotPayInApp);
    }
    final String? currency = stripeCurrency;
    if (currency == null) {
      if (!loadingStripeCurrency) {
        unawaited(loadStripeCurrency());
        return (currency: null, message: PaymentMessage.paymentFailed);
      }
      return (currency: null, message: PaymentMessage.none);
    }
    return (currency: currency, message: PaymentMessage.none);
  }

  /// The card entry produced a Stripe token: save the email and the card,
  /// charge in [currency] and confirm the order.
  Future<PaymentMessage> payWithNewCard({
    required String email,
    required String tokenId,
    required String currency,
  }) async {
    final String? orderId = store.orderId;
    final String? userId = store.userId;
    if (orderId == null || userId == null || paying) return PaymentMessage.none;
    // Set before the first await: Pay stays disabled for the whole card
    // save, charge and confirm.
    _startPaying(orderId);
    try {
      final User user;
      try {
        user = await api.user.updateEmail(userId, email);
      } on Object catch (e) {
        // The email may belong to another customer; the message does not
        // say so, so it never tells whether an email has an account.
        debugPrint('Email update failed: $e');
        return PaymentMessage.emailNotSaved;
      }
      final String cardId;
      try {
        cardId = await api.user.addPaymentMethod(user.id, tokenId);
      } on Object catch (e) {
        debugPrint('Payment method creation failed: $e');
        return PaymentMessage.paymentFailed;
      }
      try {
        await api.order.payWithStripe(orderId, cardId, shownCurrency: currency);
      } on Object catch (e) {
        debugPrint('Payment failed: $e');
        if (e is PyroError && e.name == PyroError.stripeCurrencyChanged) {
          stripeCurrency = null;
          unawaited(loadStripeCurrency());
        }
        return PaymentMessage.paymentFailed;
      }
      try {
        await api.order.confirm(orderId);
      } on Object catch (e) {
        debugPrint('Could not confirm the order: $e');
      }
      unawaited(loadUserCard());
      return PaymentMessage.none;
    } finally {
      _stopPaying(orderId);
    }
  }

  /// Name, description and amount shown on the card entry: the first order
  /// product, as the Checkout popup did.
  static double firstProductAmount(Order order) =>
      order.products.isEmpty ? 0 : order.products.first.price;

  @override
  void dispose() {
    _disposed = true;
    store.removeListener(_onStoreChanged);
    super.dispose();
  }
}
