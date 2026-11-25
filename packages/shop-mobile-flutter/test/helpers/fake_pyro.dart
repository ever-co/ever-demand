import 'dart:async';

import 'package:shop_flutter_mobile/data/network/pyro/pyro_router.dart';
import 'package:shop_flutter_mobile/data/network/pyro/pyro_socket.dart';

typedef RpcHandler = FutureOr<Object?> Function(List<Object?> args);
typedef ObserveHandler = Stream<Object?> Function(List<Object?> args);

/// One recorded emit: namespace, event, arguments (without the ack).
class PyroEmit {
  const PyroEmit(this.namespace, this.event, this.args);

  final String namespace;
  final String event;
  final List<Object?> args;

  String get key => '$namespace.$event';

  @override
  String toString() => '$key$args';
}

/// An in-memory pyro server: one [FakePyroSocket] per namespace, with
/// handlers for one-shot calls (`onCall`) and observable calls
/// (`onObserve`), keyed `namespace.method` (for example `order.get`).
/// It speaks the wire protocol of packages/core/src/@pyro/io exactly:
/// `ack(err, res)`, `${callId}_subscribe`, `${sid}_next|_error`.
class FakePyroBackend {
  final Map<String, RpcHandler> _calls = <String, RpcHandler>{};
  final Map<String, ObserveHandler> _observables = <String, ObserveHandler>{};
  final Map<String, FakePyroSocket> sockets = <String, FakePyroSocket>{};
  final List<PyroEmit> log = <PyroEmit>[];

  /// Sockets start connected unless this is false.
  bool online = true;

  void onCall(String key, RpcHandler handler) => _calls[key] = handler;

  void onObserve(String key, ObserveHandler handler) =>
      _observables[key] = handler;

  /// An observable that emits [value] once and stays open.
  void onValue(String key, Object? value) => onObserve(
        key,
        (_) => Stream<Object?>.multi((MultiStreamController<Object?> c) {
          c.add(value);
        }),
      );

  /// Calls to [key] (one-shot and observable), with their arguments.
  List<List<Object?>> callsTo(String key) => <List<Object?>>[
        for (final PyroEmit e in log)
          if (e.key == key) e.args,
      ];

  PyroSocket socketFor(String url) {
    final String namespace = url.substring(url.lastIndexOf('/') + 1);
    return sockets.putIfAbsent(
      namespace,
      () => FakePyroSocket(this, namespace, connected: online),
    );
  }

  PyroClient client() => PyroClient('http://fake', socketFactory: socketFor);

  RpcHandler? _call(String key) => _calls[key];
  ObserveHandler? _observable(String key) => _observables[key];
}

Map<String, Object?> wireError(Object e) => e is PyroError
    ? <String, Object?>{'__isError__': true, 'name': e.name, 'message': e.message}
    : <String, Object?>{'__isError__': true, 'name': 'Error', 'message': '$e'};

class FakePyroSocket implements PyroSocket {
  FakePyroSocket(this.backend, this.namespace, {this._connected = true});

  final FakePyroBackend backend;
  final String namespace;
  bool _connected;
  final StreamController<PyroConnectionStatus> _status =
      StreamController<PyroConnectionStatus>.broadcast(sync: true);
  final Map<String, List<void Function(Object?)>> _handlers =
      <String, List<void Function(Object?)>>{};
  final Map<String, (String, List<Object?>)> _pending =
      <String, (String, List<Object?>)>{};
  final Map<String, StreamSubscription<Object?>> _subs =
      <String, StreamSubscription<Object?>>{};

  /// Unanswered one-shot calls while [holdAcks] is true.
  final List<void Function()> heldAcks = <void Function()>[];
  bool holdAcks = false;

  @override
  bool get connected => _connected;

  @override
  Stream<PyroConnectionStatus> get statusChanges => _status.stream;

  void simulateConnect() {
    _connected = true;
    _status.add(PyroConnectionStatus.connected);
  }

  void simulateDisconnect() {
    _connected = false;
    for (final StreamSubscription<Object?> s in _subs.values) {
      unawaited(s.cancel());
    }
    _subs.clear();
    _status.add(PyroConnectionStatus.disconnected);
  }

  /// Sends a server event to the registered handlers.
  void deliver(String event, Object? data) {
    for (final void Function(Object?) h
        in List<void Function(Object?)>.of(_handlers[event] ?? const <void Function(Object?)>[])) {
      h(data);
    }
  }

  @override
  void emit(String event, List<Object?> args) {
    backend.log.add(PyroEmit(namespace, event, args));
    if (event.endsWith('_subscribe')) {
      final String callId = event.substring(0, event.length - '_subscribe'.length);
      final (String, List<Object?>)? call = _pending.remove(callId);
      final String sid = '${args.first}';
      if (call == null) return;
      final ObserveHandler? handler = backend._observable('$namespace.${call.$1}');
      if (handler == null) {
        scheduleMicrotask(
          () => deliver('${sid}_error', wireError('No observable $namespace.${call.$1}')),
        );
        return;
      }
      _subs[sid] = handler(call.$2).listen(
        (Object? v) => deliver('${sid}_next', v),
        onError: (Object e) => deliver('${sid}_error', wireError(e)),
        onDone: () => deliver('_${sid}_complete', null),
      );
      return;
    }
    if (event.endsWith('_unsubscribe')) {
      final String sid = event.substring(0, event.length - '_unsubscribe'.length);
      unawaited(_subs.remove(sid)?.cancel());
      return;
    }
    // An observable call: the last argument is the call id.
    _pending['${args.last}'] = (event, args.sublist(0, args.length - 1));
    backend.log.removeLast();
    backend.log.add(PyroEmit(namespace, event, args.sublist(0, args.length - 1)));
  }

  @override
  void emitWithAck(
    String event,
    List<Object?> args,
    void Function(Object? err, Object? res) ack,
  ) {
    backend.log.add(PyroEmit(namespace, event, args));
    final RpcHandler? handler = backend._call('$namespace.$event');
    void answer() {
      if (handler == null) {
        ack(wireError('No handler for $namespace.$event'), null);
        return;
      }
      Future<Object?>.sync(() => handler(args)).then(
        (Object? v) => ack(null, v),
        onError: (Object e) => ack(wireError(e), null),
      );
    }

    if (holdAcks) {
      heldAcks.add(answer);
    } else {
      scheduleMicrotask(answer);
    }
  }

  @override
  void Function() on(String event, void Function(Object? data) handler) {
    _handlers.putIfAbsent(event, () => <void Function(Object?)>[]).add(handler);
    return () => _handlers[event]?.remove(handler);
  }

  @override
  void connect() => simulateConnect();

  @override
  void dispose() {
    for (final StreamSubscription<Object?> s in _subs.values) {
      unawaited(s.cancel());
    }
    _subs.clear();
    unawaited(_status.close());
  }
}
