import 'dart:async';

import 'package:uuid/uuid.dart';

import 'pyro_socket.dart';

/// An error the server sent as `{ __isError__: true, name, message }`, or a
/// client-side failure of the call itself.
class PyroError implements Exception {
  const PyroError(this.name, this.message, {this.raw});

  /// Rebuilds the error the way common-angular's `deserializeError` does.
  factory PyroError.fromWire(Object? error) {
    if (error is Map && error['__isError__'] == true) {
      return PyroError(
        '${error['name'] ?? 'Error'}',
        '${error['message'] ?? ''}',
        raw: error,
      );
    }
    return PyroError('Error', '$error', raw: error);
  }

  /// The socket dropped after the request went out: it may or may not have
  /// run on the server (fleet fix in common-angular `Request.ts`).
  static const String socketDisconnected = 'SocketDisconnectedError';

  /// `payWithStripe` refused: the charge currency changed since it was shown.
  static const String stripeCurrencyChanged = 'StripeCurrencyChangedError';

  final String name;
  final String message;
  final Object? raw;

  @override
  String toString() => '$name: $message';
}

/// One pyro router (= one socket.io namespace `${servicesEndpoint}/$name`).
/// Mirrors packages/common-angular/src/lib/router: [run] is `router.run`,
/// [observe] is `router.runAndObserve`.
class PyroRouter {
  PyroRouter(this.name, this.socket, {Uuid uuid = const Uuid()}) : _uuid = uuid;

  final String name;
  final PyroSocket socket;
  final Uuid _uuid;

  /// One-shot call: `emit(method, ...args, ack)`; resolves with `res`, fails
  /// with [PyroError] when `err` is set. A call emitted while offline waits in
  /// the socket.io buffer and counts as sent from the next connect; once sent,
  /// a disconnect fails it with [PyroError.socketDisconnected].
  Future<Object?> run(String method, [List<Object?> args = const <Object?>[]]) {
    final Completer<Object?> completer = Completer<Object?>();
    bool sent = socket.connected;
    late final StreamSubscription<PyroConnectionStatus> statusSub;

    void finish() => statusSub.cancel();

    statusSub = socket.statusChanges.listen((PyroConnectionStatus status) {
      if (status == PyroConnectionStatus.connected) {
        sent = true;
      } else if (status == PyroConnectionStatus.disconnected && sent) {
        finish();
        if (!completer.isCompleted) {
          completer.completeError(PyroError(
            PyroError.socketDisconnected,
            'Connection lost before the server answered "$method"; '
            'it may or may not have run.',
          ));
        }
      }
    });

    socket.emitWithAck(method, args, (Object? err, Object? res) {
      finish();
      if (completer.isCompleted) return;
      if (err != null) {
        completer.completeError(PyroError.fromWire(err));
      } else {
        completer.complete(res);
      }
    });

    return completer.future;
  }

  /// Observable call. On listen (and again on every reconnect, because the
  /// server keeps its subscriptions per connection) it emits
  /// `method(...args, callId)` and `${callId}_subscribe(subscriptionId)`, then
  /// forwards `${subscriptionId}_next` values and `${subscriptionId}_error`
  /// errors. The stream closes on `${subscriptionId}_complete` (the server
  /// actually sends `_${subscriptionId}_complete`; both are handled).
  /// Cancelling emits `${subscriptionId}_unsubscribe`.
  Stream<Object?> observe(
    String method, [
    List<Object?> args = const <Object?>[],
  ]) {
    late final StreamController<Object?> controller;
    final List<void Function()> offs = <void Function()>[];
    StreamSubscription<PyroConnectionStatus>? statusSub;
    String? subscriptionId;

    void detach() {
      for (final void Function() off in offs) {
        off();
      }
      offs.clear();
    }

    void subscribe() {
      detach();
      final String callId = _uuid.v4();
      final String sid = _uuid.v4();
      subscriptionId = sid;
      offs
        ..add(socket.on('${sid}_next', (Object? value) {
          if (!controller.isClosed) controller.add(value);
        }))
        ..add(socket.on('${sid}_error', (Object? error) {
          if (!controller.isClosed) {
            controller.addError(PyroError.fromWire(error));
          }
        }))
        ..add(socket.on('${sid}_complete', (_) => controller.close()))
        ..add(socket.on('_${sid}_complete', (_) => controller.close()));
      socket
        ..emit(method, <Object?>[...args, callId])
        ..emit('${callId}_subscribe', <Object?>[sid]);
    }

    controller = StreamController<Object?>(
      onListen: () {
        statusSub = socket.statusChanges.listen((PyroConnectionStatus s) {
          if (s == PyroConnectionStatus.connected) subscribe();
        });
        if (socket.connected) subscribe();
      },
      onCancel: () async {
        await statusSub?.cancel();
        final String? sid = subscriptionId;
        if (sid != null && socket.connected) {
          socket.emit('${sid}_unsubscribe', const <Object?>[]);
        }
        detach();
      },
    );
    return controller.stream;
  }
}

/// Creates the routers, one socket (namespace) per router name, shared.
class PyroClient {
  PyroClient(
    this.servicesEndpoint, {
    PyroSocket Function(String url)? socketFactory,
  }) : _socketFactory = socketFactory ?? SocketIoPyroSocket.new;

  final String servicesEndpoint;
  final PyroSocket Function(String url) _socketFactory;
  final Map<String, PyroRouter> _routers = <String, PyroRouter>{};

  PyroRouter router(String name) => _routers.putIfAbsent(
        name,
        () => PyroRouter(name, _socketFactory('$servicesEndpoint/$name')),
      );

  void dispose() {
    for (final PyroRouter r in _routers.values) {
      r.socket.dispose();
    }
    _routers.clear();
  }
}
