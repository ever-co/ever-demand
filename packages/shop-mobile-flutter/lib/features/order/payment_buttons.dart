import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:material_ui/material_ui.dart';

import '../../core/formatting.dart';
import '../../core/l10n.dart';
import '../../core/product_locale.dart';
import '../../data/models/order.dart';
import '../../platform/platform_services.dart';
import '../../providers.dart';
import '../../services/payment_controller.dart';
import '../../widgets/common.dart';

String paymentMessageText(AppLocalizations l10n, PaymentMessage m) =>
    switch (m) {
      PaymentMessage.paymentFailed => l10n.buyPopupPaymentFailed,
      PaymentMessage.emailNotSaved => l10n.buyPopupEmailNotSaved,
      PaymentMessage.cannotPayInApp => l10n.cardNoKey,
      PaymentMessage.none => '',
    };

/// `e-cu-payment`: "Pay with card", "Pay with *1234" or a disabled "Paid".
class PaymentButtons extends ConsumerStatefulWidget {
  const PaymentButtons({super.key, required this.order});

  final Order order;

  @override
  ConsumerState<PaymentButtons> createState() => _PaymentButtonsState();
}

class _PaymentButtonsState extends ConsumerState<PaymentButtons> {
  late final PaymentController _payment = PaymentController(
    api: ref.read(shopApiProvider),
    store: ref.read(appStoreProvider),
    hasPublishableKey: ref.read(cardTokenizerProvider).isAvailable,
  );

  @override
  void initState() {
    super.initState();
    unawaited(_payment.init());
  }

  @override
  void dispose() {
    _payment.dispose();
    super.dispose();
  }

  Future<void> _tell(PaymentMessage m) async {
    if (m == PaymentMessage.none || !mounted) return;
    await showAppAlert(context, paymentMessageText(context.l10n, m));
  }

  Future<void> _payWithSavedCard() async {
    await _tell(await _payment.payWithSavedCard());
  }

  Future<void> _payWithNewCard() async {
    final ({String? currency, PaymentMessage message}) gate =
        _payment.beginNewCardPayment();
    final String? currency = gate.currency;
    if (currency == null) {
      await _tell(gate.message);
      return;
    }
    final CardEntryResult? entry = await showCardEntrySheet(
      context,
      tokenizer: ref.read(cardTokenizerProvider),
      order: widget.order,
      currency: currency,
      language: ref.read(languageProvider),
    );
    if (entry == null) return;
    await _tell(
      await _payment.payWithNewCard(
        email: entry.email,
        tokenId: entry.tokenId,
        currency: currency,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    return ListenableBuilder(
      listenable: _payment,
      builder: (BuildContext context, _) {
        if (widget.order.isPaid) {
          return FilledButton(
            key: const Key('pay-paid'),
            onPressed: null,
            child: Text(l10n.buyPopupButtonsPaid),
          );
        }
        final bool paying = _payment.paying;
        if (_payment.userCard != null) {
          return FilledButton.icon(
            key: const Key('pay-saved-card'),
            onPressed: paying ? null : () => unawaited(_payWithSavedCard()),
            icon: const FaIcon(FontAwesomeIcons.creditCard, size: 16),
            label: Text(
              '${l10n.buyPopupButtonsPayWithFixedCard} *${_payment.userCard!.last4}',
            ),
          );
        }
        return FilledButton(
          key: const Key('pay-new-card'),
          onPressed: paying || _payment.waitingForStripeCurrency
              ? null
              : () => unawaited(_payWithNewCard()),
          child: Text(l10n.buyPopupButtonsPayNow),
        );
      },
    );
  }
}

typedef CardEntryResult = ({String email, String tokenId});

/// Card entry for a new card (replaces the Stripe Checkout popup): email,
/// card field, "Pay {amount}" for the first order product, as Checkout
/// showed it. Returns the email and the Stripe token, or null if closed.
Future<CardEntryResult?> showCardEntrySheet(
  BuildContext context, {
  required CardTokenizer tokenizer,
  required Order order,
  required String currency,
  required String language,
}) =>
    showModalBottomSheet<CardEntryResult>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (BuildContext context) => _CardEntrySheet(
        tokenizer: tokenizer,
        order: order,
        currency: currency,
        language: language,
      ),
    );

class _CardEntrySheet extends StatefulWidget {
  const _CardEntrySheet({
    required this.tokenizer,
    required this.order,
    required this.currency,
    required this.language,
  });

  final CardTokenizer tokenizer;
  final Order order;
  final String currency;
  final String language;

  @override
  State<_CardEntrySheet> createState() => _CardEntrySheetState();
}

class _CardEntrySheetState extends State<_CardEntrySheet> {
  final TextEditingController _email = TextEditingController();
  bool _complete = false;
  bool _busy = false;
  String? _error;

  static final RegExp _emailPattern = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final AppLocalizations l10n = context.l10n;
    final String email = _email.text.trim();
    if (!_emailPattern.hasMatch(email)) {
      setState(() => _error = l10n.cardEmailInvalid);
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final String token = await widget.tokenizer.createToken(email: email);
      if (mounted) Navigator.of(context).pop((email: email, tokenId: token));
    } on Object catch (e) {
      debugPrint('Card tokenization failed: $e');
      if (mounted) {
        setState(() {
          _busy = false;
          _error = l10n.buyPopupPaymentFailed;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    final OrderProduct? first =
        widget.order.products.isEmpty ? null : widget.order.products.first;
    final String amount =
        '${formatPrice(first?.price ?? 0)} ${widget.currency}';
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.viewInsetsOf(context).bottom + 16,
      ),
      child: Column(
        key: const Key('card-entry-sheet'),
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          if (first != null) ...<Widget>[
            Text(
              localeValue(first.product.title, widget.language),
              style: Theme.of(context).textTheme.titleMedium,
            ),
            Text(localeValue(first.product.description, widget.language)),
            const SizedBox(height: 12),
          ],
          TextField(
            key: const Key('card-email'),
            controller: _email,
            keyboardType: TextInputType.emailAddress,
            autofillHints: const <String>[AutofillHints.email],
            decoration: InputDecoration(labelText: l10n.cardEmailLabel),
          ),
          const SizedBox(height: 12),
          widget.tokenizer.buildCardField(
            onComplete: (bool complete) => setState(() => _complete = complete),
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                _error!,
                key: const Key('card-error'),
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ),
          const SizedBox(height: 16),
          FilledButton(
            key: const Key('card-pay'),
            onPressed: !_complete || _busy ? null : () => unawaited(_submit()),
            child: Text(l10n.buyPopupButtonsPayX(amount)),
          ),
        ],
      ),
    );
  }
}
