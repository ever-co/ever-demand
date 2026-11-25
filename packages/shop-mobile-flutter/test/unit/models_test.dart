import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:shop_flutter_mobile/config/app_config.dart';
import 'package:shop_flutter_mobile/core/formatting.dart';
import 'package:shop_flutter_mobile/core/languages.dart';
import 'package:shop_flutter_mobile/core/product_locale.dart';
import 'package:shop_flutter_mobile/data/models/countries.dart';
import 'package:shop_flutter_mobile/data/models/enums.dart';
import 'package:shop_flutter_mobile/data/models/invite.dart';
import 'package:shop_flutter_mobile/data/models/order.dart';
import 'package:shop_flutter_mobile/data/models/product.dart';
import 'package:shop_flutter_mobile/features/products/product_details_screen.dart';

import '../helpers/fixtures.dart';

void main() {
  group('Order (packages/common Order entity rules)', () {
    test('status: payload value wins', () {
      final Order o = Order.fromJson(orderJson(status: OrderStatus.delivered));
      expect(o.status, OrderStatus.delivered);
    });

    test('status computed from carrier and warehouse statuses', () {
      expect(Order.fromJson(orderJson()).status, OrderStatus.warehousePreparation);
      expect(
        Order.fromJson(orderJson(warehouseStatus: 200)).status,
        OrderStatus.warehouseIssue,
      );
      expect(
        Order.fromJson(orderJson(isCancelled: true)).status,
        OrderStatus.canceledWhileWarehousePreparation,
      );
      expect(
        Order.fromJson(orderJson(withCarrier: true, carrierStatus: 3)).status,
        OrderStatus.inDelivery,
      );
      expect(
        Order.fromJson(orderJson(withCarrier: true, carrierStatus: 204)).status,
        OrderStatus.carrierIssue,
      );
      expect(
        Order.fromJson(
          orderJson(withCarrier: true, carrierStatus: 3, isCancelled: true),
        ).status,
        OrderStatus.canceledWhileInDelivery,
      );
      expect(
        Order.fromJson(orderJson(withCarrier: true, carrierStatus: 5, isPaid: true)).status,
        OrderStatus.delivered,
      );
    });

    test('delivery step', () {
      expect(Order.fromJson(orderJson()).deliveryStep, DeliveryStep.warehouse);
      expect(Order.fromJson(orderJson(carrierStatus: 2)).deliveryStep, DeliveryStep.carrier);
      expect(Order.fromJson(orderJson(carrierStatus: 4)).deliveryStep, DeliveryStep.customer);
      expect(
        Order.fromJson(orderJson(carrierStatus: 4, isCompleted: true)).deliveryStep,
        DeliveryStep.completed,
      );
      // A cancelled, completed order is not "completed" for the steps.
      expect(
        Order.fromJson(orderJson(isCompleted: true, isCancelled: true)).deliveryStep,
        DeliveryStep.warehouse,
      );
    });

    test('issues', () {
      final Order delivery = Order.fromJson(orderJson(carrierStatus: 204));
      expect(delivery.issuesDuringDelivery, isTrue);
      expect(delivery.hasIssues, isTrue);
      final Order processing = Order.fromJson(orderJson(warehouseStatus: 201));
      expect(processing.issuesDuringWarehouseProcessing, isTrue);
      expect(Order.fromJson(orderJson()).hasIssues, isFalse);
    });

    test('totalPrice is Σ count × price', () {
      final Order o = Order.fromJson(orderJson(products: <Map<String, dynamic>>[
        orderProductJson(count: 2, price: 3.5),
        orderProductJson(id: 'op2', count: 1, price: 4),
      ]));
      expect(o.totalPrice, 11);
    });

    test('delivery time range', () {
      expect(Order.fromJson(orderJson()).deliveryTimeRange(), '30-60');
      expect(
        Order.fromJson(orderJson(products: <Map<String, dynamic>>[
          orderProductJson(deliveryTimeMin: 10, deliveryTimeMax: 20),
          orderProductJson(id: 'op2', deliveryTimeMin: 15, deliveryTimeMax: 18),
        ])).deliveryTimeRange(),
        '15-20',
      );
      expect(
        Order.fromJson(orderJson(products: <Map<String, dynamic>>[
          orderProductJson(deliveryTimeMin: 25),
        ])).deliveryTimeRange(),
        '25',
      );
      expect(
        Order.fromJson(orderJson()).deliveryTimeRange(defaultMin: 5, defaultMax: 9),
        '5-9',
      );
    });

    test('shortId is ddMMyyyy-orderNumber in local time', () {
      final Order o = Order.fromJson(orderJson(createdAt: '2026-03-04T12:00:00.000Z'));
      final DateTime local = DateTime.utc(2026, 3, 4, 12).toLocal();
      final String dd = local.day.toString().padLeft(2, '0');
      final String mm = local.month.toString().padLeft(2, '0');
      expect(o.shortId, '$dd${mm}2026-7');
    });

    test('statusText per language (Order.getStatusText)', () {
      final Order o = Order.fromJson(orderJson());
      expect(o.statusText('en-US'), 'Preparation');
      expect(o.statusText('bg-BG'), 'Подготовка');
      expect(o.statusText('fr-FR'), 'Preparation');
      expect(o.statusText('xx-XX'), 'BAD_STATUS');
      expect(
        Order.fromJson(orderJson(isCancelled: true)).statusText('es-ES'),
        'Cancelado',
      );
    });

    test('parses pyro (_id, populated refs) and GraphQL (id) shapes', () {
      final Order pyro = Order.fromJson(orderJson());
      expect(pyro.id, 'o1');
      expect(pyro.warehouse?.name, 'Ever Pizza');
      expect(pyro.products.single.id, 'op1');
      expect(pyro.products.single.product.id, 'p1');
      final Order gql = Order.fromJson(<String, dynamic>{
        'id': 'o2',
        'warehouseId': 'w9',
        'warehouse': <String, dynamic>{'id': 'w9', 'logo': 'l.png'},
        'products': <Map<String, dynamic>>[],
        'status': 0,
      });
      expect(gql.id, 'o2');
      expect(gql.warehouse?.logo, 'l.png');
    });
  });

  group('WarehouseProduct', () {
    test('discount floor((1 - price / initial) * 100), 0 without initial', () {
      expect(WarehouseProduct.fromJson(warehouseProductJson(price: 8, initialPrice: 10)).discountPercent, 20);
      expect(WarehouseProduct.fromJson(warehouseProductJson(price: 10, initialPrice: 10)).discountPercent, 0);
      expect(WarehouseProduct.fromJson(warehouseProductJson(initialPrice: null)).discountPercent, 0);
      expect(WarehouseProduct.fromJson(warehouseProductJson(price: 9.99, initialPrice: 15)).discountPercent, 33);
    });
  });

  group('InviteRequest.toAddressString', () {
    test('street house/apartment, city', () {
      expect(InviteRequest.fromJson(inviteRequestJson()).toAddressString(), 'Vitosha 1/5, Sofia');
      expect(const InviteRequest(id: 'x').toAddressString(), isNull);
    });
  });

  group('countries (server Country enum order)', () {
    test('ids', () {
      expect(countryCodes.first, 'AD');
      expect(countryIdFromCode('BG'), 21);
      expect(countryIdFromCode('bg'), 21);
      expect(countryName(21), 'Bulgaria');
      expect(countryIdFromCode('ZZ'), isNull);
      expect(countryName(null), isNull);
      final List<int> sorted = countryIdsByName();
      expect(countryName(sorted.first)!.compareTo(countryName(sorted.last)!), lessThan(0));
    });
  });

  group('product locale', () {
    final List<LocaleMember> members = <LocaleMember>[
      const LocaleMember(locale: 'en-US', value: 'Pasta'),
      const LocaleMember(locale: 'bg-BG', value: 'Паста'),
    ];

    test('current language, else en-US, else first', () {
      expect(localeValue(members, 'bg-BG'), 'Паста');
      expect(localeValue(members, 'fr-FR'), 'Pasta');
      expect(
        localeValue(const <LocaleMember>[LocaleMember(locale: 'ru-RU', value: 'Паста')], 'fr-FR'),
        'Паста',
      );
      expect(localeValue(const <LocaleMember>[], 'en-US'), '');
    });

    test('shorten keeps texts under max, cuts with ...', () {
      expect(shorten('short', 45), 'short');
      final String long = 'x' * 60;
      expect(shorten(long, 45), '${'x' * 42}...');
      expect(shorten(long, 45).length, 45);
    });

    test('details images rule', () {
      ProductImage img(int o, [String url = 'u']) =>
          ProductImage(locale: 'en-US', url: '$url$o', orientation: o);
      expect(detailsImages(<ProductImage>[img(1)], 'en-US').length, 1);
      expect(
        detailsImages(<ProductImage>[img(2), img(1)], 'en-US').single.orientation,
        ImageOrientation.horizontal,
      );
      expect(
        detailsImages(<ProductImage>[img(1, 'a'), img(1, 'b'), img(2)], 'en-US')
            .every((ProductImage i) => i.orientation != ImageOrientation.horizontal),
        isTrue,
      );
      expect(detailsImages(<ProductImage>[img(2, 'a'), img(2, 'b')], 'en-US').length, 2);
    });
  });

  group('formatting', () {
    test('elapsed time mm : ss and h : mm : ss', () {
      expect(formatElapsed(const Duration(seconds: 65)), '01 : 05');
      expect(formatElapsed(const Duration(hours: 1, minutes: 2, seconds: 3)), '1 : 02 : 03');
      expect(formatElapsed(const Duration(seconds: -5)), '00 : 00');
    });

    test('delivery time m:ss min', () {
      final DateTime a = DateTime(2026, 1, 1, 10);
      expect(formatDeliveryTime(a, a.add(const Duration(minutes: 25, seconds: 7))), '25:07 min');
      expect(formatDeliveryTime(a, null), isNull);
    });

    test('price like a JS number', () {
      expect(formatPrice(12), '12');
      expect(formatPrice(12.5), '12.5');
    });
  });

  group('languages', () {
    test('saved, then DEFAULT_LANGUAGE, then device, then en-US', () {
      expect(resolveStartLanguage(saved: 'bg-BG', defaultLanguage: 'en-US'), 'bg-BG');
      expect(resolveStartLanguage(defaultLanguage: 'fr-FR'), 'fr-FR');
      expect(resolveStartLanguage(defaultLanguage: '', deviceLocale: const Locale('he')), 'he-IL');
      expect(resolveStartLanguage(deviceLocale: const Locale('de')), 'en-US');
      expect(isRtl('he-IL'), isTrue);
      expect(localeOf('ru-RU'), const Locale('ru', 'RU'));
    });
  });

  group('AppConfig', () {
    test('Android emulator host', () {
      expect(AppConfig.emulatorHost('http://localhost:5500'), 'http://10.0.2.2:5500');
      expect(
        AppConfig.emulatorHost('ws://127.0.0.1:2086/subscriptions'),
        'ws://10.0.2.2:2086/subscriptions',
      );
      expect(AppConfig.emulatorHost('https://api.ever.co'), 'https://api.ever.co');
    });

    test('defaults match scripts/env.ts', () {
      final AppConfig c = AppConfig.fromEnvironment(platform: TargetPlatform.linux);
      expect(c.gqlEndpoint, 'http://localhost:8443/graphql');
      expect(c.gqlSubscriptionsEndpoint, 'ws://localhost:2086/subscriptions');
      expect(c.servicesEndpoint, 'http://localhost:5500');
      expect(c.productsViewType, 'slides');
      expect(c.orderInfoType, 'page');
      expect(c.hasDefaultLocation, isTrue);
      expect(c.fakeInvite?.code, 8321);
      expect(c.fakeInvite?.countryId, 21);
      expect(c.supportNumber, '0888888888');
      expect(c.merchantIds, isEmpty);
      expect(c.shoppingCart, isFalse);
    });

    test('Android rewrites localhost', () {
      final AppConfig c = AppConfig.fromEnvironment(platform: TargetPlatform.android);
      expect(c.servicesEndpoint, 'http://10.0.2.2:5500');
      expect(c.gqlEndpoint, 'http://10.0.2.2:8443/graphql');
    });
  });
}
