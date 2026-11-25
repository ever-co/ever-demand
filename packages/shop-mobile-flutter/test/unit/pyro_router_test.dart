import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:shop_flutter_mobile/data/network/pyro/pyro_router.dart';
import 'package:shop_flutter_mobile/data/network/pyro/pyro_socket.dart';

import '../helpers/fake_pyro.dart';

void main() {
  late FakePyroBackend backend;
  late PyroClient client;

  setUp(() {
    backend = FakePyroBackend();
    client = backend.client();
  });

  FakePyroSocket socketOf(String ns) {
    client.router(ns);
    return backend.sockets[ns]!;
  }

  group('run (one-shot call)', () {
    test('emits method(...args, ack) and resolves with res', () async {
      backend.onCall('order.confirm', (List<Object?> a) => <String, Object?>{'_id': a.first});
      final Object? res = await client.router('order').run('confirm', <Object?>['o1']);
      expect(res, <String, Object?>{'_id': 'o1'});
      expect(backend.callsTo('order.confirm'), <List<Object?>>[
        <Object?>['o1'],
      ]);
    });

    test('rebuilds a serialised error { __isError__, name, message }', () async {
      backend.onCall('order.payWithStripe', (_) {
        throw const PyroError('StripeCurrencyChangedError', 'currency changed');
      });
      await expectLater(
        client.router('order').run('payWithStripe', <Object?>['o1', 'c1', 'USD']),
        throwsA(
          isA<PyroError>()
              .having((PyroError e) => e.name, 'name', PyroError.stripeCurrencyChanged)
              .having((PyroError e) => e.message, 'message', 'currency changed'),
        ),
      );
    });

    test('a non-error object is passed through as the message', () {
      final PyroError e = PyroError.fromWire('boom');
      expect(e.name, 'Error');
      expect(e.message, 'boom');
    });

    test('a disconnect after the call went out rejects (never hangs)', () async {
      final FakePyroSocket socket = socketOf('order');
      socket.holdAcks = true;
      final Future<Object?> call = client.router('order').run('payWithStripe', <Object?>['o1', 'c1']);
      socket.simulateDisconnect();
      await expectLater(
        call,
        throwsA(isA<PyroError>().having(
          (PyroError e) => e.name,
          'name',
          PyroError.socketDisconnected,
        )),
      );
    });

    test('a call made offline counts as sent only after the next connect', () async {
      backend.online = false;
      final FakePyroSocket socket = socketOf('user');
      socket.holdAcks = true;
      backend.onCall('user.getCards', (_) => <Object?>[]);
      final Future<Object?> call = client.router('user').run('getCards', <Object?>['u1']);
      // Offline disconnect events before the call is sent do not fail it.
      socket.simulateDisconnect();
      socket.simulateConnect();
      for (final void Function() ack in socket.heldAcks) {
        ack();
      }
      expect(await call, <Object?>[]);
    });
  });

  group('observe (runAndObserve)', () {
    test('emits method(...args, callId), then callId_subscribe(sid), forwards values', () async {
      final StreamController<Object?> server = StreamController<Object?>();
      backend.onObserve('order.get', (_) => server.stream);
      final List<Object?> values = <Object?>[];
      final StreamSubscription<Object?> sub =
          client.router('order').observe('get', <Object?>['o1', <String, bool>{'populateWarehouse': true}]).listen(values.add);
      await pumpEventQueue();
      server
        ..add(<String, Object?>{'_id': 'o1', 'isPaid': false})
        ..add(<String, Object?>{'_id': 'o1', 'isPaid': true});
      await pumpEventQueue();
      expect(values, hasLength(2));
      final List<PyroEmit> emits = backend.log.where((PyroEmit e) => e.namespace == 'order').toList();
      expect(emits.first.event, 'get');
      expect(emits.first.args, <Object?>['o1', <String, bool>{'populateWarehouse': true}]);
      expect(emits[1].event, endsWith('_subscribe'));
      await sub.cancel();
      expect(backend.log.last.event, endsWith('_unsubscribe'));
      await server.close();
    });

    test('errors arrive as PyroError', () async {
      backend.onObserve('invite.getByCode', (_) => Stream<Object?>.error(const PyroError('NotInvited', 'no')));
      await expectLater(
        client.router('invite').observe('getByCode', <Object?>[<String, Object?>{}]).first,
        throwsA(isA<PyroError>().having((PyroError e) => e.name, 'name', 'NotInvited')),
      );
    });

    test(r'the server complete event (`_${sid}_complete`) closes the stream', () async {
      backend.onObserve('user.getHelp', (_) => Stream<Object?>.fromIterable(<Object?>['<p>help</p>']));
      final List<Object?> all = await client.router('user').observe('getHelp', <Object?>['u1', 'd1', 'en-US']).toList();
      expect(all, <Object?>['<p>help</p>']);
    });

    test('waits for connect, and subscribes again after a reconnect', () async {
      backend.online = false;
      int calls = 0;
      backend.onObserve('warehouse.get', (_) {
        calls++;
        final int n = calls;
        // A live observable: one value, never completes.
        return Stream<Object?>.multi(
          (MultiStreamController<Object?> c) => c.add(<String, Object?>{'_id': 'w1', 'n': n}),
        );
      });
      final FakePyroSocket socket = socketOf('warehouse');
      final List<Object?> values = <Object?>[];
      final StreamSubscription<Object?> sub =
          client.router('warehouse').observe('get', <Object?>['w1', true]).listen(values.add);
      await pumpEventQueue();
      expect(values, isEmpty);
      socket.simulateConnect();
      await pumpEventQueue();
      expect(values, hasLength(1));
      socket.simulateDisconnect();
      socket.simulateConnect();
      await pumpEventQueue();
      expect(values, hasLength(2));
      expect(calls, 2);
      await sub.cancel();
    });
  });

  test('one socket per namespace, shared by the client', () {
    final PyroRouter a = client.router('order');
    final PyroRouter b = client.router('order');
    expect(identical(a, b), isTrue);
    client.router('user');
    expect(backend.sockets.keys, containsAll(<String>['order', 'user']));
  });

  test('status enum covers the socket.service states', () {
    expect(PyroConnectionStatus.values, hasLength(4));
  });
}
