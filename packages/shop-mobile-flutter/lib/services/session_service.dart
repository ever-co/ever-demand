import 'dart:async';

import '../data/models/enums.dart';
import '../data/models/user.dart';
import '../data/repositories/shop_api.dart';
import '../data/store/app_store.dart';

/// `Store.isLogged()` and the guard rules built on it.
class SessionService {
  SessionService(this.store, this.api, {this.timeout = const Duration(seconds: 15)});

  final AppStore store;
  final ShopApi api;
  final Duration timeout;

  /// With a `_userId`: `user.get(userId)` first value; a user → true; an
  /// error or no user → clear `_userId` and false. No `_userId` → false.
  Future<bool> isLogged() async {
    final String? userId = store.userId;
    if (userId == null) return false;
    try {
      final User? user = await api.user.get(userId).first.timeout(timeout);
      if (user != null) return true;
      store.userId = null;
      return false;
    } on TimeoutException {
      // No answer is not "user gone": keep the id, as the Ionic client would
      // still be waiting. Let the customer in.
      return true;
    } on Object {
      store.userId = null;
      return false;
    }
  }

  /// Products, merchants and info pages: blocked only when not logged in and
  /// registration is required on start.
  Future<bool> mustRegister() async {
    if (store.registrationSystem != RegistrationSystem.enabled) return false;
    return !await isLogged();
  }
}
