import 'dart:async';

import 'package:socket_io_client/socket_io_client.dart' as io;

/// Connection status of one router namespace (`ConnectionStatus` in
/// common-angular's socket.service).
enum PyroConnectionStatus { notConnected, connected, disconnected, connectError }

/// The part of a socket.io client socket the pyro RPC needs. An interface so
/// tests can drive it without a server.
abstract interface class PyroSocket {
  bool get connected;

  /// Status changes; a listener first gets nothing, check [connected].
  Stream<PyroConnectionStatus> get statusChanges;

  /// `socket.emit(event, ...args)`.
  void emit(String event, List<Object?> args);

  /// `socket.emit(event, ...args, ack)`; the server answers `ack(err, res)`.
  void emitWithAck(
    String event,
    List<Object?> args,
    void Function(Object? err, Object? res) ack,
  );

  /// Adds a handler for a server event; returns a function that removes it.
  void Function() on(String event, void Function(Object? data) handler);

  void connect();

  void dispose();
}

/// [PyroSocket] on `socket_io_client`, one per namespace, with the Ionic
/// client's manual reconnect: 1 s after a disconnect or a connect error.
class SocketIoPyroSocket implements PyroSocket {
  SocketIoPyroSocket(String url, {Duration reconnectDelay = const Duration(seconds: 1)})
      : _reconnectDelay = reconnectDelay,
        _socket = io.io(
          url,
          io.OptionBuilder()
              .setTransports(<String>['websocket'])
              .disableReconnection()
              .disableAutoConnect()
              .build(),
        ) {
    _socket
      ..onConnect((_) => _status(PyroConnectionStatus.connected))
      ..onDisconnect((_) => _status(PyroConnectionStatus.disconnected))
      ..onConnectError((_) => _status(PyroConnectionStatus.connectError));
    _socket.connect();
  }

  final io.Socket _socket;
  final Duration _reconnectDelay;
  final StreamController<PyroConnectionStatus> _statusController =
      StreamController<PyroConnectionStatus>.broadcast();
  Timer? _reconnectTimer;
  bool _disposed = false;

  void _status(PyroConnectionStatus status) {
    if (_disposed) return;
    _statusController.add(status);
    if (status == PyroConnectionStatus.disconnected ||
        status == PyroConnectionStatus.connectError) {
      _reconnectTimer?.cancel();
      _reconnectTimer = Timer(_reconnectDelay, () {
        if (!_disposed && !_socket.connected) _socket.connect();
      });
    }
  }

  @override
  bool get connected => _socket.connected;

  @override
  Stream<PyroConnectionStatus> get statusChanges => _statusController.stream;

  @override
  void emit(String event, List<Object?> args) =>
      _socket.emit(event, List<dynamic>.of(args));

  @override
  void emitWithAck(
    String event,
    List<Object?> args,
    void Function(Object? err, Object? res) ack,
  ) {
    _socket.emitWithAck(
      event,
      List<dynamic>.of(args),
      ack: (dynamic data) {
        // socket_io_client hands a multi-argument ack over as one List.
        if (data is List) {
          ack(data.isNotEmpty ? data[0] : null, data.length > 1 ? data[1] : null);
        } else {
          ack(data, null);
        }
      },
    );
  }

  @override
  void Function() on(String event, void Function(Object? data) handler) {
    void listener(dynamic data) => handler(data);
    _socket.on(event, listener);
    return () => _socket.off(event, listener);
  }

  @override
  void connect() => _socket.connect();

  @override
  void dispose() {
    _disposed = true;
    _reconnectTimer?.cancel();
    _socket.dispose();
    _statusController.close();
  }
}
