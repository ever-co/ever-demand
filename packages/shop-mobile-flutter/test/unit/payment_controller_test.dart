import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:shop_flutter_mobile/data/models/order.dart';
import 'package:shop_flutter_mobile/data/network/pyro/pyro_router.dart';
import 'package:shop_flutter_mobile/services/payment_controller.dart';

import '../helpers/fixtures.dart';
import '../helpers/test_env.dart';

/// The payment rules of the Ionic PaymentComponent (fleet fixes
/// #1645-#1654, docs/latest-stack/shop-mobile-features.md §4.9).
void main() {
  late TestEnv env;

  PaymentController controller({bool key = true}) => PaymentController(
        api: env.api,
        store: env.store,
        hasPublishableKey: key,
      );

  setUp(() {
    env = TestEnv();
    env.loggedIn();
    env.store.orderId = 'o1';
    env.pyro
      ..onCall('user.getCards', (_) => <Object?>[])
      ..onCall('order.getStripeCurrency', (_) => 'usd')
      ..onCall('user.updateEmail', (_) => userJson(email: 'a@b.co'))
      ..onCall('user.addPaymentMethod', (_) => 'card_new')
      ..onCall('order.payWithStripe', (_) => orderJson(isPaid: true))
      ..onCall('order.confirm', (_) => orderJson(isPaid: true));
  });

  test('init loads the saved card and the upper-cased currency', () async {
    env.pyro.onCall('user.getCards', (_) => <Object?>[
          <String, Object?>{'id': 'card_1', 'last4': '4242'},
          <String, Object?>{'id': 'card_2', 'last4': '1111'},
        ]);
    final PaymentController p = controller();
    await p.init();
    expect(p.userCard?.id, 'card_1');
    expect(p.stripeCurrency, 'USD');
    expect(p.loadingStripeCurrency, isFalse);
    p.dispose();
  });

  test('a failed currency load only logs; Pay with card then tells and reloads', () async {
    env.pyro.onCall('order.getStripeCurrency', (_) => throw const PyroError('Error', 'down'));
    final PaymentController p = controller();
    await p.init();
    expect(p.stripeCurrency, isNull);
    expect(p.waitingForStripeCurrency, isFalse);
    final ({String? currency, PaymentMessage message}) gate = p.beginNewCardPayment();
    expect(gate.currency, isNull);
    expect(gate.message, PaymentMessage.paymentFailed);
    expect(env.pyro.callsTo('order.getStripeCurrency'), hasLength(2));
    p.dispose();
  });

  test('while the currency loads, Pay with card waits silently', () async {
    final Completer<Object?> currency = Completer<Object?>();
    env.pyro.onCall('order.getStripeCurrency', (_) => currency.future);
    final PaymentController p = controller();
    unawaited(p.init());
    await pumpEventQueue();
    expect(p.waitingForStripeCurrency, isTrue);
    expect(p.beginNewCardPayment().message, PaymentMessage.none);
    currency.complete('eur');
    await pumpEventQueue();
    expect(p.beginNewCardPayment().currency, 'EUR');
    p.dispose();
  });

  test('no publishable key: cannot pay in app', () async {
    final PaymentController p = controller(key: false);
    expect(p.beginNewCardPayment().message, PaymentMessage.cannotPayInApp);
    expect(await p.payWithSavedCard(), PaymentMessage.cannotPayInApp);
    p.dispose();
  });

  test('saved card: payWithStripe(orderId, cardId) with 2 arguments', () async {
    env.pyro.onCall('user.getCards', (_) => <Object?>[
          <String, Object?>{'id': 'card_1', 'last4': '4242'},
        ]);
    final PaymentController p = controller();
    await p.init();
    expect(await p.payWithSavedCard(), PaymentMessage.none);
    expect(env.pyro.callsTo('order.payWithStripe').single, <Object?>['o1', 'card_1']);
    expect(p.paying, isFalse);
    p.dispose();
  });

  test('saved card declined: PAYMENT_FAILED, never the server text, flags cleared', () async {
    env.pyro
      ..onCall('user.getCards', (_) => <Object?>[
            <String, Object?>{'id': 'card_1', 'last4': '4242'},
          ])
      ..onCall('order.payWithStripe', (_) => throw const PyroError('StripeCardError', 'Your card was declined'));
    final PaymentController p = controller();
    await p.init();
    expect(await p.payWithSavedCard(), PaymentMessage.paymentFailed);
    expect(p.paying, isFalse);
    expect(env.store.isPaying('o1'), isFalse);
    p.dispose();
  });

  test('double tap sends one payment; a second widget for the order is disabled', () async {
    final Completer<Object?> pay = Completer<Object?>();
    env.pyro
      ..onCall('user.getCards', (_) => <Object?>[
            <String, Object?>{'id': 'card_1', 'last4': '4242'},
          ])
      ..onCall('order.payWithStripe', (_) => pay.future);
    final PaymentController a = controller();
    final PaymentController b = controller();
    await a.init();
    await b.init();
    final Future<PaymentMessage> first = a.payWithSavedCard();
    await pumpEventQueue();
    expect(a.paying, isTrue);
    expect(b.paying, isTrue, reason: 'Store.isPaying covers other widgets');
    expect(await a.payWithSavedCard(), PaymentMessage.none);
    expect(await b.payWithSavedCard(), PaymentMessage.none);
    pay.complete(orderJson(isPaid: true));
    expect(await first, PaymentMessage.none);
    expect(env.pyro.callsTo('order.payWithStripe'), hasLength(1));
    expect(b.paying, isFalse);
    a.dispose();
    b.dispose();
  });

  test('new card: email → card → payWithStripe(orderId, cardId, currency) → confirm', () async {
    final PaymentController p = controller();
    await p.init();
    final String currency = p.beginNewCardPayment().currency!;
    expect(
      await p.payWithNewCard(email: 'a@b.co', tokenId: 'tok_1', currency: currency),
      PaymentMessage.none,
    );
    expect(env.pyro.callsTo('user.updateEmail').single, <Object?>['u1', 'a@b.co']);
    expect(env.pyro.callsTo('user.addPaymentMethod').single, <Object?>['u1', 'tok_1']);
    expect(env.pyro.callsTo('order.payWithStripe').single, <Object?>['o1', 'card_new', 'USD']);
    expect(env.pyro.callsTo('order.confirm').single, <Object?>['o1']);
    p.dispose();
  });

  test('new card: paying is set before the first await', () async {
    final Completer<Object?> email = Completer<Object?>();
    env.pyro.onCall('user.updateEmail', (_) => email.future);
    final PaymentController p = controller();
    await p.init();
    final Future<PaymentMessage> run = p.payWithNewCard(email: 'a@b.co', tokenId: 't', currency: 'USD');
    expect(p.paying, isTrue);
    expect(await p.payWithNewCard(email: 'a@b.co', tokenId: 't', currency: 'USD'), PaymentMessage.none);
    email.complete(userJson());
    await run;
    expect(env.pyro.callsTo('user.updateEmail'), hasLength(1));
    p.dispose();
  });

  test('new card: email taken → EMAIL_NOT_SAVED, no card saved, no charge', () async {
    env.pyro.onCall('user.updateEmail', (_) => throw const PyroError('Error', 'email exists'));
    final PaymentController p = controller();
    await p.init();
    expect(
      await p.payWithNewCard(email: 'x@y.co', tokenId: 't', currency: 'USD'),
      PaymentMessage.emailNotSaved,
    );
    expect(env.pyro.callsTo('user.addPaymentMethod'), isEmpty);
    expect(env.pyro.callsTo('order.payWithStripe'), isEmpty);
    p.dispose();
  });

  test('new card: card save fails → PAYMENT_FAILED, no charge', () async {
    env.pyro.onCall('user.addPaymentMethod', (_) => throw const PyroError('Error', 'bad token'));
    final PaymentController p = controller();
    await p.init();
    expect(await p.payWithNewCard(email: 'a@b.co', tokenId: 't', currency: 'USD'), PaymentMessage.paymentFailed);
    expect(env.pyro.callsTo('order.payWithStripe'), isEmpty);
    p.dispose();
  });

  test('new card: currency changed → PAYMENT_FAILED and the currency reloads', () async {
    int loads = 0;
    env.pyro
      ..onCall('order.getStripeCurrency', (_) => ++loads == 1 ? 'usd' : 'eur')
      ..onCall('order.payWithStripe', (_) => throw const PyroError('StripeCurrencyChangedError', 'changed'));
    final PaymentController p = controller();
    await p.init();
    expect(await p.payWithNewCard(email: 'a@b.co', tokenId: 't', currency: 'USD'), PaymentMessage.paymentFailed);
    await pumpEventQueue();
    expect(p.stripeCurrency, 'EUR');
    expect(env.pyro.callsTo('order.confirm'), isEmpty);
    p.dispose();
  });

  test('new card: confirm failure only logs', () async {
    env.pyro.onCall('order.confirm', (_) => throw const PyroError('Error', 'x'));
    final PaymentController p = controller();
    await p.init();
    expect(await p.payWithNewCard(email: 'a@b.co', tokenId: 't', currency: 'USD'), PaymentMessage.none);
    p.dispose();
  });

  test('first product amount (Checkout showed products[0].price)', () {
    expect(PaymentController.firstProductAmount(Order.fromJson(orderJson())), 10);
  });
}
