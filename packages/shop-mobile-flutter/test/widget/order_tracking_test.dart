import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:shop_flutter_mobile/config/app_config.dart';
import 'package:shop_flutter_mobile/data/models/enums.dart';

import '../helpers/fixtures.dart';
import '../helpers/test_env.dart';

void main() {
  late TestEnv env;
  late StreamController<Object?> order;

  setUp(() {
    env = TestEnv();
    env.loggedIn();
    env.store
      ..orderId = 'o1'
      ..orderWarehouseId = 'w1';
    order = StreamController<Object?>.broadcast();
    env.pyro
      ..onObserve('order.get', (_) => order.stream)
      ..onValue('warehouse.get', warehouseJson())
      ..onCall('user.getCards', (_) => <Object?>[])
      ..onCall('order.getStripeCurrency', (_) => 'usd')
      ..onCall('warehouse-orders.cancel', (_) => orderJson(isCancelled: true, isPaid: true))
      ..onCall('order.refundWithStripe', (_) => orderJson())
      ..onValue('user-products.getPlaceholder', '');
    env.gql
      ..on('GetCountOfGeoLocationProducts', (_) => <String, dynamic>{'getCountOfGeoLocationProducts': 0})
      ..on('GeoLocationProductsByPaging', (_) => <String, dynamic>{'geoLocationProductsByPaging': <Object?>[]})
      ..on('GetOrder', (_) => <String, dynamic>{'getOrder': <String, dynamic>{'status': 0, 'totalPrice': 10}});
  });

  tearDown(() => order.close());

  Future<void> open(WidgetTester tester, Map<String, dynamic> json, {String location = '/order-info'}) async {
    await env.pumpApp(tester, location: location);
    order.add(json);
    await settle(tester);
  }

  group('delivery (/order-info)', () {
    testWidgets('status texts, steps, elapsed time, start date stored', (WidgetTester tester) async {
      await open(tester, orderJson());
      expect(find.byKey(const Key('delivery-order-screen')), findsOneWidget);
      expect(find.text("We're preparing the order!"), findsOneWidget);
      expect(find.text('You will get it in 30-60 minutes.'), findsOneWidget);
      expect(find.text(r'Prepare your wallet (10.00$ in cash).'), findsOneWidget);
      expect(find.byKey(const Key('delivery-steps')), findsOneWidget);
      expect(find.text('We'), findsOneWidget);
      expect(find.text('Carrier'), findsOneWidget);
      expect(find.text('You'), findsOneWidget);
      expect(find.byKey(const Key('elapsed-time-value')), findsOneWidget);
      expect(env.store.startOrderDate, isNotNull);
      expect(find.byKey(const Key('pay-new-card')), findsOneWidget);
    });

    testWidgets('live updates: carrier on the way, then at the door', (WidgetTester tester) async {
      await open(tester, orderJson());
      order.add(orderJson(withCarrier: true, carrierStatus: OrderCarrierStatus.carrierStartDelivery));
      await settle(tester);
      expect(find.text('Carrier on the way!'), findsOneWidget);
      order.add(orderJson(withCarrier: true, carrierStatus: OrderCarrierStatus.carrierArrivedToCustomer));
      await settle(tester);
      expect(find.text('Check your door!'), findsOneWidget);
      order.add(orderJson(
        withCarrier: true,
        carrierStatus: OrderCarrierStatus.deliveryCompleted,
        isCompleted: true,
        isPaid: true,
      ));
      await settle(tester);
      expect(find.text('Order Completed!'), findsOneWidget);
      expect(env.store.endOrderTime, isNotNull, reason: 'elapsed time frozen');
      await tapKey(tester, 'order-end');
      expect(env.store.orderId, isNull);
      expect(find.byKey(const Key('products-screen')), findsOneWidget);
    });

    testWidgets('undo: confirm → cancel + refund (paid) → products', (WidgetTester tester) async {
      await open(tester, orderJson());
      await tapKey(tester, 'order-undo');
      expect(find.byKey(const Key('cancel-order-dialog')), findsOneWidget);
      expect(find.text('Are you sure?'), findsOneWidget);
      await tapKey(tester, 'cancel-order-yes');
      expect(env.pyro.callsTo('warehouse-orders.cancel').single, <Object?>['o1']);
      expect(env.pyro.callsTo('order.refundWithStripe').single, <Object?>['o1']);
      expect(env.store.orderId, isNull);
      expect(find.byKey(const Key('products-screen')), findsOneWidget);
    });

    testWidgets('undo: No keeps the order', (WidgetTester tester) async {
      await open(tester, orderJson());
      await tapKey(tester, 'order-undo');
      await tapKey(tester, 'cancel-order-no');
      expect(env.pyro.callsTo('warehouse-orders.cancel'), isEmpty);
      expect(env.store.orderId, 'o1');
    });

    testWidgets('delivery issue: issue modal once, OK cancels (no refund unpaid)', (WidgetTester tester) async {
      await open(tester, orderJson(withCarrier: true, carrierStatus: OrderCarrierStatus.issuesDuringDelivery));
      expect(find.byKey(const Key('order-issue-dialog')), findsOneWidget);
      expect(find.text('The Delivery Went Wrong!'), findsOneWidget);
      order.add(orderJson(withCarrier: true, carrierStatus: OrderCarrierStatus.issuesDuringDelivery));
      await settle(tester);
      expect(find.byKey(const Key('order-issue-dialog')), findsOneWidget);
      await tapKey(tester, 'order-issue-ok');
      expect(env.pyro.callsTo('warehouse-orders.cancel').single, <Object?>['o1']);
      expect(env.pyro.callsTo('order.refundWithStripe'), isEmpty);
      expect(env.store.orderId, isNull);
      expect(find.byKey(const Key('products-screen')), findsOneWidget);
    });

    testWidgets('warehouse issue text', (WidgetTester tester) async {
      await open(tester, orderJson(warehouseStatus: OrderWarehouseStatus.allocationFailed));
      expect(find.text('Processing Went Wrong!'), findsOneWidget);
    });

    testWidgets('payments off at the merchant: no payment buttons', (WidgetTester tester) async {
      env.pyro.onValue('warehouse.get', warehouseJson(isPaymentEnabled: false));
      await open(tester, orderJson());
      expect(find.byKey(const Key('pay-new-card')), findsNothing);
      expect(find.byKey(const Key('order-undo')), findsOneWidget);
    });

    testWidgets('saved card: Pay with *4242 → payWithStripe(orderId, cardId)', (WidgetTester tester) async {
      env.pyro
        ..onCall('user.getCards', (_) => <Object?>[
              <String, Object?>{'id': 'card_1', 'last4': '4242'},
            ])
        ..onCall('order.payWithStripe', (_) => orderJson(isPaid: true));
      await open(tester, orderJson());
      expect(find.text('Pay with *4242'), findsOneWidget);
      await tapKey(tester, 'pay-saved-card');
      expect(env.pyro.callsTo('order.payWithStripe').single, <Object?>['o1', 'card_1']);
      order.add(orderJson(isPaid: true));
      await settle(tester);
      expect(find.byKey(const Key('pay-paid')), findsOneWidget);
      expect(find.text('Paid'), findsOneWidget);
    });

    testWidgets('saved card declined: translated PAYMENT_FAILED alert', (WidgetTester tester) async {
      env.pyro
        ..onCall('user.getCards', (_) => <Object?>[
              <String, Object?>{'id': 'card_1', 'last4': '4242'},
            ])
        ..onCall('order.payWithStripe', (_) => throw StateError('card_declined: insufficient funds'));
      await open(tester, orderJson());
      await tapKey(tester, 'pay-saved-card');
      expect(find.text('Payment failed. Please try again.'), findsOneWidget);
      expect(find.textContaining('insufficient'), findsNothing);
    });

    testWidgets('new card: email + card → token → save, charge in USD, confirm', (WidgetTester tester) async {
      env.pyro
        ..onCall('user.updateEmail', (_) => userJson(email: 'a@b.co'))
        ..onCall('user.addPaymentMethod', (_) => 'card_new')
        ..onCall('order.payWithStripe', (_) => orderJson(isPaid: true))
        ..onCall('order.confirm', (_) => orderJson(isPaid: true));
      await open(tester, orderJson());
      await tapKey(tester, 'pay-new-card');
      expect(find.byKey(const Key('card-entry-sheet')), findsOneWidget);
      expect(find.text('Pay 10 USD'), findsOneWidget);
      await tester.enterText(find.byKey(const Key('card-email')), 'a@b.co');
      await tester.tap(find.byKey(const Key('fake-card-field')));
      await tester.pump();
      await tapKey(tester, 'card-pay');
      expect(env.tokenizer.created, 1);
      expect(env.pyro.callsTo('user.updateEmail').single, <Object?>['u1', 'a@b.co']);
      expect(env.pyro.callsTo('user.addPaymentMethod').single, <Object?>['u1', 'tok_test']);
      expect(env.pyro.callsTo('order.payWithStripe').single, <Object?>['o1', 'card_new', 'USD']);
      expect(env.pyro.callsTo('order.confirm').single, <Object?>['o1']);
    });

    testWidgets('new card: invalid email is caught before tokenizing', (WidgetTester tester) async {
      await open(tester, orderJson());
      await tapKey(tester, 'pay-new-card');
      await tester.enterText(find.byKey(const Key('card-email')), 'nope');
      await tester.tap(find.byKey(const Key('fake-card-field')));
      await tester.pump();
      await tapKey(tester, 'card-pay');
      expect(find.text('Enter a valid email'), findsOneWidget);
      expect(env.tokenizer.created, 0);
    });

    testWidgets('new card: taken email → EMAIL_NOT_SAVED alert', (WidgetTester tester) async {
      env.pyro.onCall('user.updateEmail', (_) => throw StateError('E11000 duplicate key'));
      await open(tester, orderJson());
      await tapKey(tester, 'pay-new-card');
      await tester.enterText(find.byKey(const Key('card-email')), 'taken@b.co');
      await tester.tap(find.byKey(const Key('fake-card-field')));
      await tester.pump();
      await tapKey(tester, 'card-pay');
      expect(find.textContaining('We could not save your email'), findsOneWidget);
      expect(env.pyro.callsTo('order.payWithStripe'), isEmpty);
    });

    testWidgets('view order products opens the order modal', (WidgetTester tester) async {
      await open(tester, orderJson());
      await tapKey(tester, 'view-order-products');
      expect(find.byKey(const Key('order-info-modal')), findsOneWidget);
      expect(find.byKey(const Key('order-card-o1')), findsOneWidget);
    });
  });

  group('takeaway (/order-info-takeaway)', () {
    setUp(() => env.store.deliveryType = DeliveryType.takeaway);

    testWidgets('store info, phone call, order code, I\'m here → products view', (WidgetTester tester) async {
      await open(
        tester,
        orderJson(products: <Map<String, dynamic>>[orderProductJson(isTakeaway: true)]),
        location: '/order-info-takeaway',
      );
      expect(find.byKey(const Key('takeaway-order-screen')), findsOneWidget);
      expect(find.text("We're preparing the order!"), findsOneWidget);
      expect(find.text('You can get it in 30-60 minutes.'), findsOneWidget);
      expect(find.byKey(const Key('store-name')), findsOneWidget);
      expect(find.text('Sofia, Simeonovsko shose 104, 1700, Bulgaria'), findsOneWidget);
      expect(find.byKey(const Key('order-code')), findsOneWidget);
      final DateTime local = DateTime.utc(2026, 11, 25, 10).toLocal();
      expect(find.text('#${local.day.toString().padLeft(2, '0')}112026-7'), findsOneWidget);
      await tapKey(tester, 'store-call');
      expect(env.dialer.calls, <String>['0888123456']);

      await tapKey(tester, 'takeaway-im-here');
      expect(find.byKey(const Key('order-cancel')), findsOneWidget);
      expect(find.byKey(const Key('takeaway-got-it')), findsNothing);
      order.add(orderJson(warehouseStatus: OrderWarehouseStatus.packagingFinished));
      await settle(tester);
      await tapKey(tester, 'takeaway-got-it');
      expect(env.store.orderId, isNull);
      expect(find.byKey(const Key('products-screen')), findsOneWidget);
    });

    testWidgets('paid banner', (WidgetTester tester) async {
      await open(tester, orderJson(isPaid: true), location: '/order-info-takeaway');
      expect(find.text(r'The order is paid $10!'), findsOneWidget);
      expect(find.byKey(const Key('pay-new-card')), findsNothing);
    });

    testWidgets('in store: "Got it!" completes straight away', (WidgetTester tester) async {
      env.store.inStore = 'w1';
      await open(tester, orderJson(), location: '/order-info-takeaway');
      expect(find.text('Got It!'), findsOneWidget);
      expect(find.byKey(const Key('store-address')), findsNothing);
      await tapKey(tester, 'takeaway-im-here');
      expect(env.store.orderId, isNull);
    });
  });

  group('popup mode (ORDER_INFO_TYPE=popup)', () {
    testWidgets('the feed opens the order modal when an order is open', (WidgetTester tester) async {
      env.config = const AppConfig(orderInfoType: 'popup', mapsEnabled: false);
      await env.pumpApp(tester);
      order.add(orderJson());
      await settle(tester);
      expect(find.byKey(const Key('order-popup')), findsOneWidget);
      expect(find.byKey(const Key('delivery-order-view')), findsOneWidget);
      await tapKey(tester, 'order-popup-close');
      expect(find.byKey(const Key('order-popup')), findsNothing);
      expect(env.store.orderId, 'o1');
    });
  });
}
