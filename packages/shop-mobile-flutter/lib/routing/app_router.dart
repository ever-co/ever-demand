import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../data/models/enums.dart';
import '../data/store/app_store.dart';
import '../features/errors/connection_lost_screen.dart';
import '../features/errors/maintenance_screen.dart';
import '../features/errors/server_down_screen.dart';
import '../features/info/info_screen.dart';
import '../features/invite/invite_by_code_screen.dart';
import '../features/invite/invite_by_location_screen.dart';
import '../features/language/language_screen.dart';
import '../features/merchants/merchants_screen.dart';
import '../features/order/delivery_order_screen.dart';
import '../features/order/takeaway_order_screen.dart';
import '../features/orders_history/order_details_screen.dart';
import '../features/orders_history/orders_history_screen.dart';
import '../features/products/product_details_screen.dart';
import '../features/products/products_screen.dart';
import '../features/startup/startup_screen.dart';
import '../services/session_service.dart';

/// Route paths, the same as the Ionic app's.
abstract final class Routes {
  static const String startup = '/startup';
  static const String invite = '/invite';
  static const String inviteByCode = '/invite/by-code';
  static const String inviteByLocation = '/invite/by-location';
  static const String products = '/products';
  static const String productDetails = '/products/product-details';
  static const String ordersHistory = '/orders-history';
  static const String orderInfo = '/order-info';
  static const String orderInfoTakeaway = '/order-info-takeaway';
  static const String merchants = '/merchants';
  static const String language = '/language';
  static const String info = '/info';
  static const String connectionLost = '/errors/connection-lost';
  static const String serverDown = '/server-down';
  static const String maintenance = '/maintenance-info';

  static String productDetailsOf(
    String productId, {
    required String warehouseId,
    String backUrl = products,
  }) =>
      Uri(
        path: '$productDetails/$productId',
        queryParameters: <String, String>{
          'backUrl': backUrl,
          'warehouseId': warehouseId,
        },
      ).toString();
}

/// The Ionic guards (docs/latest-stack/shop-mobile-features.md §3.2) as one
/// go_router redirect. [startupDone] gates everything behind the start-up
/// sequence.
class AppGuards {
  AppGuards({
    required this.store,
    required this.session,
    required this.startupDone,
  });

  final AppStore store;
  final SessionService session;
  final bool Function() startupDone;

  FutureOr<String?> redirect(BuildContext context, GoRouterState state) {
    final String path = state.uri.path;
    if (!startupDone()) {
      return path == Routes.startup
          ? null
          : Uri(
              path: Routes.startup,
              queryParameters: <String, String>{'from': state.uri.toString()},
            ).toString();
    }
    if (path == Routes.startup ||
        path == Routes.serverDown ||
        path == Routes.connectionLost) {
      return null;
    }
    if (path == Routes.maintenance) {
      return store.maintenanceMode == null ? '/' : null;
    }
    // PagesModuleGuard
    if (store.maintenanceMode != null) return Routes.maintenance;
    if (store.isServerDown) return Routes.serverDown;

    if (path == '/' || path.isEmpty) return Routes.invite;
    if (path == Routes.invite || path.startsWith('${Routes.invite}/')) {
      return _inviteGuard(path);
    }
    if (path == Routes.products ||
        path == Routes.merchants ||
        path.startsWith('${Routes.info}/')) {
      return _registeredGuard();
    }
    if (path == Routes.ordersHistory ||
        path.startsWith('${Routes.ordersHistory}/')) {
      return _loggedGuard();
    }
    if (path == Routes.orderInfo || path == Routes.orderInfoTakeaway) {
      return _orderInfoGuard(path);
    }
    return null;
  }

  String? _inviteGuard(String path) {
    if (store.userId != null ||
        store.registrationSystem == RegistrationSystem.disabled) {
      return Routes.products;
    }
    if (path == Routes.invite) {
      return store.inviteSystem ? Routes.inviteByCode : Routes.inviteByLocation;
    }
    if (path == Routes.inviteByCode && !store.inviteSystem) {
      return Routes.inviteByLocation;
    }
    if (path == Routes.inviteByLocation &&
        store.inviteRequestId != null &&
        store.inviteSystem) {
      return Routes.inviteByCode;
    }
    return null;
  }

  Future<String?> _registeredGuard() async =>
      await session.mustRegister() ? Routes.invite : null;

  Future<String?> _loggedGuard() async =>
      await session.isLogged() ? null : Routes.invite;

  Future<String?> _orderInfoGuard(String path) async {
    if (!await session.isLogged()) return Routes.invite;
    if (store.orderId == null) return Routes.products;
    if (path == Routes.orderInfo && !store.isDelivery) {
      return Routes.orderInfoTakeaway;
    }
    if (path == Routes.orderInfoTakeaway && store.isDelivery) {
      return Routes.orderInfo;
    }
    return null;
  }
}

GoRouter buildRouter({
  required AppGuards guards,
  String initialLocation = Routes.startup,
  List<NavigatorObserver> observers = const <NavigatorObserver>[],
  GlobalKey<NavigatorState>? navigatorKey,
}) {
  return GoRouter(
    navigatorKey: navigatorKey,
    initialLocation: initialLocation,
    observers: observers,
    redirect: guards.redirect,
    routes: <RouteBase>[
      GoRoute(path: '/', redirect: (_, _) => Routes.invite),
      GoRoute(
        path: Routes.startup,
        builder: (_, GoRouterState s) =>
            StartupScreen(from: s.uri.queryParameters['from']),
      ),
      GoRoute(path: Routes.invite, redirect: (_, _) => Routes.inviteByCode),
      GoRoute(
        path: Routes.inviteByCode,
        builder: (_, _) => const InviteByCodeScreen(),
      ),
      GoRoute(
        path: Routes.inviteByLocation,
        builder: (_, _) => const InviteByLocationScreen(),
      ),
      GoRoute(
        path: Routes.products,
        builder: (_, _) => const ProductsScreen(),
      ),
      GoRoute(
        path: '${Routes.productDetails}/:id',
        builder: (_, GoRouterState s) => ProductDetailsScreen(
          productId: s.pathParameters['id']!,
          warehouseId: s.uri.queryParameters['warehouseId'] ?? '',
          backUrl: s.uri.queryParameters['backUrl'] ?? Routes.products,
        ),
      ),
      GoRoute(
        path: Routes.ordersHistory,
        builder: (_, _) => const OrdersHistoryScreen(),
        routes: <RouteBase>[
          GoRoute(
            path: ':id',
            builder: (_, GoRouterState s) =>
                OrderDetailsScreen(orderId: s.pathParameters['id']!),
          ),
        ],
      ),
      GoRoute(
        path: Routes.orderInfo,
        builder: (_, _) => const DeliveryOrderScreen(),
      ),
      GoRoute(
        path: Routes.orderInfoTakeaway,
        builder: (_, _) => const TakeawayOrderScreen(),
      ),
      GoRoute(
        path: Routes.merchants,
        builder: (_, _) => const MerchantsScreen(),
      ),
      GoRoute(
        path: Routes.language,
        builder: (_, _) => const LanguageScreen(),
      ),
      GoRoute(
        path: '${Routes.info}/:page',
        builder: (_, GoRouterState s) =>
            InfoScreen(page: InfoPage.fromPath(s.pathParameters['page'])),
      ),
      GoRoute(
        path: Routes.connectionLost,
        builder: (_, _) => const ConnectionLostScreen(),
      ),
      GoRoute(
        path: Routes.serverDown,
        builder: (_, _) => const ServerDownScreen(),
      ),
      GoRoute(
        path: Routes.maintenance,
        builder: (_, _) => const MaintenanceScreen(),
      ),
    ],
    errorBuilder: (_, _) => const ProductsScreen(),
  );
}
