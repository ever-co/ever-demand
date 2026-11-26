import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:shop_flutter_mobile/data/models/enums.dart';
import 'package:shop_flutter_mobile/data/store/app_store.dart';
import 'package:shop_flutter_mobile/data/store/key_value_store.dart';

void main() {
  late MemoryStore kv;
  late AppStore store;

  setUp(() {
    kv = MemoryStore();
    store = AppStore(kv);
  });

  test('uses the Ionic localStorage keys', () {
    store
      ..userId = 'u1'
      ..deviceId = 'd1'
      ..orderId = 'o1'
      ..orderWarehouseId = 'w1'
      ..inviteRequestId = 'ir1'
      ..inviteAddress = 'Vitosha 1, Sofia'
      ..inStore = 'w2'
      ..buyProduct = 'wp1'
      ..warehouseId = 'w3'
      ..backToDetails = 'p1'
      ..language = 'bg-BG'
      ..registrationSystem = RegistrationSystem.once
      ..inviteSystem = true
      ..deliveryType = DeliveryType.takeaway
      ..serverConnection = 0
      ..maintenanceMode = 'api';
    expect(kv.values, <String, String>{
      '_userId': 'u1',
      '_deviceId': 'd1',
      '_orderId': 'o1',
      '_currOrderWarehouseId': 'w1',
      '_inviteRequestId': 'ir1',
      'inviteAddress': 'Vitosha 1, Sofia',
      'inStore': 'w2',
      '_buyProduct': 'wp1',
      '_warehouseId': 'w3',
      '_backToDetails': 'p1',
      '_language': 'bg-BG',
      '_registrationSystem': 'once',
      '_inviteSystem': 'enabled',
      'deliveryType': '1',
      'serverConnection': '0',
      'maintenanceMode': 'api',
    });
    expect(store.isServerDown, isTrue);
    expect(store.isDelivery, isFalse);
  });

  test('null or empty removes a key', () {
    store.userId = 'u1';
    store.userId = null;
    expect(kv.values.containsKey('_userId'), isFalse);
    store.inStore = 'w';
    store.clearInStore();
    expect(store.inStore, isNull);
  });

  test('deliveryType defaults to delivery (Number(null) = 0)', () {
    expect(store.deliveryType, DeliveryType.delivery);
    expect(store.isDelivery, isTrue);
  });

  test('startDate is a JSON string, endTime a { timePassed } object', () {
    final DateTime start = DateTime.utc(2026, 11, 25, 10);
    store.startOrderDate = start;
    expect(jsonDecode(kv.values['startDate']!), start.toIso8601String());
    expect(store.startOrderDate, start);
    store.endOrderTime = '12 : 30';
    expect(jsonDecode(kv.values['endTime']!), <String, String>{'timePassed': '12 : 30'});
    expect(store.endOrderTime, '12 : 30');
    // The Ionic app stores JSON.stringify(new Date().toString()).
    kv.values['startDate'] = jsonEncode('not a date');
    expect(store.startOrderDate, isNull);
  });

  test('clearOrder drops the order and its times', () {
    store
      ..orderId = 'o1'
      ..startOrderDate = DateTime.now()
      ..endOrderTime = '01 : 00';
    store.clearOrder();
    expect(store.orderId, isNull);
    expect(store.startOrderDate, isNull);
    expect(store.endOrderTime, isNull);
  });

  test('paying set is memory only and notifies', () async {
    int notified = 0;
    store.addListener(() => notified++);
    store.startPaying('o1');
    expect(store.isPaying('o1'), isTrue);
    expect(store.isPaying(null), isFalse);
    expect(kv.values, isEmpty);
    await pumpEventQueue();
    store.stopPaying('o1');
    expect(store.isPaying('o1'), isFalse);
    await pumpEventQueue();
    expect(notified, 2);
  });

  test('writes in one turn notify once, after the turn', () async {
    int notified = 0;
    store.addListener(() => notified++);
    store
      ..userId = 'u1'
      ..deviceId = 'd1'
      ..orderId = 'o1';
    expect(notified, 0);
    await pumpEventQueue();
    expect(notified, 1);
  });
}
