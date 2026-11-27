import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:graphql/client.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shop_flutter_mobile/config/app_config.dart';
import 'package:shop_flutter_mobile/config/tenant.dart';
import 'package:shop_flutter_mobile/data/network/graphql/graphql_service.dart';
import 'package:shop_flutter_mobile/data/network/pyro/pyro_socket.dart';
import 'package:shop_flutter_mobile/data/store/app_store.dart';
import 'package:shop_flutter_mobile/data/store/key_value_store.dart';
import 'package:shop_flutter_mobile/providers.dart';

const String tenantId = '5f1a2b3c4d5e6f7a8b9c0d1e';

/// An unsigned JWT with these claims (the client only reads them).
String jwt(Map<String, Object?> claims) {
  String part(Map<String, Object?> v) =>
      base64Url.encode(utf8.encode(jsonEncode(v))).replaceAll('=', '');
  return '${part(<String, Object?>{'alg': 'HS256', 'typ': 'JWT'})}.${part(claims)}.signature';
}

void main() {
  group('tenantFromHost', () {
    test('the <slug> of <slug>.<base domain>', () {
      expect(tenantFromHost('acme.everdemand.co', 'everdemand.co'), 'acme');
      expect(tenantFromHost('ACME.EverDemand.co.', '.everdemand.co'), 'acme');
      expect(tenantFromHost('my-shop-2.everdemand.co', 'everdemand.co'), 'my-shop-2');
    });

    test('ignores platform hosts, other domains and invalid labels', () {
      for (final String host in <String>[
        'app.everdemand.co',
        'api.everdemand.co',
        'www.everdemand.co',
        'admin.everdemand.co',
        'everdemand.co',
        'a.b.everdemand.co',
        'acme.example.com',
        'acme.noteverdemand.co',
        'a.everdemand.co',
        'acme-.everdemand.co',
        '${'a' * 41}.everdemand.co',
      ]) {
        expect(tenantFromHost(host, 'everdemand.co'), isNull, reason: host);
      }
    });

    test('needs a base domain', () {
      expect(tenantFromHost('acme.everdemand.co', ''), isNull);
      expect(tenantFromHost('acme.everdemand.co', null), isNull);
    });
  });

  group('resolveClientTenant: build-time, then host, then ?tenant=, then kept', () {
    const String base = 'everdemand.co';
    final List<String> kept = <String>[];

    setUp(kept.clear);

    String? resolve({
      String? build,
      String? location,
      String? stored,
    }) =>
        resolveClientTenant(
          buildTenant: build,
          baseDomain: base,
          location: location == null ? null : Uri.parse(location),
          kept: stored,
          keep: kept.add,
        );

    test('1. a white-label build-time slug or id wins over everything', () {
      const String page = 'https://acme.everdemand.co/?tenant=other';
      expect(resolve(build: ' Brand ', location: page, stored: 'kept'), 'brand');
      expect(
        resolve(build: tenantId.toUpperCase(), location: page, stored: 'kept'),
        tenantId,
      );
      expect(kept, isEmpty);
    });

    test('an invalid build-time value is ignored', () {
      expect(
        resolve(build: 'Not a slug!', location: 'https://acme.everdemand.co/'),
        'acme',
      );
    });

    test('2. the page host wins over the query and the kept tenant', () {
      expect(
        resolve(location: 'https://acme.everdemand.co/?tenant=other', stored: 'kept'),
        'acme',
      );
      expect(kept, isEmpty);
    });

    test('3. a ?tenant= query wins over the kept tenant and is kept', () {
      expect(
        resolve(location: 'http://localhost:8080/?lang=en&tenant=Acme', stored: 'kept'),
        'acme',
      );
      expect(kept, <String>['acme']);
      // the default hash URL strategy: the query inside the fragment
      expect(resolve(location: 'http://localhost:8080/#/products?tenant=shop-b'), 'shop-b');
      // a platform host is no tenant host: the query applies there too
      expect(resolve(location: 'https://www.everdemand.co/?tenant=shop-c'), 'shop-c');
      expect(kept, <String>['acme', 'shop-b', 'shop-c']);
    });

    test('the kept tenant is written only when it changes', () {
      expect(resolve(location: 'http://localhost/?tenant=acme', stored: 'acme'), 'acme');
      expect(kept, isEmpty);
    });

    test('an invalid ?tenant= is ignored', () {
      expect(resolve(location: 'http://localhost/?tenant=-bad-'), isNull);
      expect(kept, isEmpty);
    });

    test('4. the tenant kept from an earlier visit', () {
      expect(resolve(location: 'http://localhost/#/products', stored: 'Acme'), 'acme');
      expect(resolve(stored: 'acme'), 'acme');
      expect(resolve(location: 'http://localhost/', stored: 'NOT VALID'), isNull);
    });

    test('nothing known: null (the API decides)', () {
      expect(resolve(location: 'http://localhost/'), isNull);
      expect(resolveClientTenant(), isNull);
    });

    test('native (no page URL): only the build-time tenant applies', () {
      expect(resolve(build: 'brand'), 'brand');
      expect(resolve(), isNull);
    });
  });

  group('login tokens: never a Tenant-Id other than the token tenant', () {
    final String token = jwt(<String, Object?>{'id': 'u1', 'role': 'user', 'tenantId': tenantId});
    final String oldToken = jwt(<String, Object?>{'id': 'u1', 'role': 'user'});

    test('reads the tenantId claim of a token', () {
      expect(tokenTenantId(token), tenantId);
      expect(tokenTenantId('Bearer $token'), tenantId);
      expect(tokenTenantId(oldToken), isNull);
      expect(tokenTenantId('opaque'), isNull);
      expect(tokenTenantId('a.%%%.c'), isNull);
      expect(tokenTenantId(null), isNull);
    });

    test('sends the resolved tenant without a token, the token tenant (or none) with one', () {
      expect(tenantToSend('acme', null), 'acme');
      expect(tenantToSend('acme', ''), 'acme');
      expect(tenantToSend('acme', token), tenantId);
      expect(tenantToSend('acme', oldToken), isNull);
    });

    test('socket handshake auth', () {
      expect(socketAuth('acme'), <String, dynamic>{'tenant': 'acme'});
      expect(socketAuth(null), <String, dynamic>{});
      expect(socketAuth('acme', token), <String, dynamic>{'tenant': tenantId, 'token': token});
    });

    test('graphql-ws connectionParams', () {
      expect(wsConnectionParams(null, 'acme'), <String, dynamic>{'tenant': 'acme'});
      expect(wsConnectionParams(null, null), <String, dynamic>{});
      expect(
        wsConnectionParams(token, 'acme'),
        <String, dynamic>{'authorization': 'Bearer $token', 'tenant': tenantId},
      );
    });
  });

  group('config: --dart-define=TENANT / TENANT_BASE_DOMAIN', () {
    test('default to empty', () {
      expect(const AppConfig().tenant, '');
      expect(const AppConfig().tenantBaseDomain, '');
      expect(AppConfig.fromEnvironment().tenant, '');
      expect(AppConfig.fromEnvironment().tenantBaseDomain, '');
    });

    test('copyWith keeps and replaces them', () {
      final AppConfig c = const AppConfig().copyWith(
        tenant: 'brand',
        tenantBaseDomain: 'everdemand.co',
      );
      expect(c.tenant, 'brand');
      expect(c.tenantBaseDomain, 'everdemand.co');
      expect(c.copyWith(shoppingCart: true).tenant, 'brand');
    });
  });

  group('tenantProvider', () {
    ProviderContainer containerFor(AppConfig config, AppStore store, Uri? page) {
      final ProviderContainer c = ProviderContainer(
        overrides: [
          appConfigProvider.overrideWithValue(config),
          appStoreProvider.overrideWithValue(store),
          pageLocationProvider.overrideWithValue(() => page),
        ],
      );
      addTearDown(c.dispose);
      return c;
    }

    test('white-label build: the build-time tenant', () {
      final ProviderContainer c = containerFor(
        const AppConfig(tenant: 'brand', tenantBaseDomain: 'everdemand.co'),
        AppStore(MemoryStore()),
        Uri.parse('https://acme.everdemand.co/'),
      );
      expect(c.read(tenantProvider)(), 'brand');
    });

    test('web build: the page host, else a ?tenant= link kept in the store', () {
      final MemoryStore kv = MemoryStore();
      final AppStore store = AppStore(kv);
      const AppConfig config = AppConfig(tenantBaseDomain: 'everdemand.co');

      expect(
        containerFor(config, store, Uri.parse('https://acme.everdemand.co/')).read(tenantProvider)(),
        'acme',
      );
      expect(
        containerFor(config, store, Uri.parse('http://localhost/?tenant=shop-b')).read(tenantProvider)(),
        'shop-b',
      );
      expect(kv.values[AppStore.kTenant], 'shop-b');
      expect(
        containerFor(config, store, Uri.parse('http://localhost/#/products')).read(tenantProvider)(),
        'shop-b',
      );
    });

    test('native build without TENANT: none', () {
      final ProviderContainer c = containerFor(
        const AppConfig(),
        AppStore(MemoryStore()),
        null,
      );
      expect(c.read(tenantProvider)(), isNull);
    });
  });

  group('the tenant reaches the API', () {
    test('socket.io: the handshake auth callback is read again at every (re)connect', () {
      String tenant = 'acme';
      final Map<String, dynamic> opts =
          SocketIoPyroSocket.options(auth: () => socketAuth(tenant));
      final void Function(void Function(Map<dynamic, dynamic>)) authFn =
          opts['auth'] as void Function(void Function(Map<dynamic, dynamic>));
      final List<Map<dynamic, dynamic>> sent = <Map<dynamic, dynamic>>[];

      authFn(sent.add);
      tenant = 'shop-b';
      authFn(sent.add);

      expect(sent, <Map<dynamic, dynamic>>[
        <String, dynamic>{'tenant': 'acme'},
        <String, dynamic>{'tenant': 'shop-b'},
      ]);
      expect(opts['transports'], <String>['websocket']);
      expect(opts['reconnection'], isFalse);
      expect(opts['autoConnect'], isFalse);
    });

    test('socket.io without an auth provider: an empty handshake auth', () {
      final Map<String, dynamic> opts = SocketIoPyroSocket.options();
      final void Function(void Function(Map<dynamic, dynamic>)) authFn =
          opts['auth'] as void Function(void Function(Map<dynamic, dynamic>));
      final List<Map<dynamic, dynamic>> sent = <Map<dynamic, dynamic>>[];
      authFn(sent.add);
      expect(sent, <Map<dynamic, dynamic>>[<String, dynamic>{}]);
    });

    Future<Map<String, String>> headersOf({String? tenant, String? token}) async {
      http.BaseRequest? request;
      final GraphQLClient client = GraphQLClientService.createClient(
        httpEndpoint: 'http://api.test/graphql',
        subscriptionsEndpoint: 'ws://api.test/subscriptions',
        token: () => token,
        tenant: () => tenant,
        httpClient: MockClient((http.Request r) async {
          request = r;
          return http.Response(
            '{"data":{"ping":"pong"}}',
            200,
            headers: <String, String>{'content-type': 'application/json'},
          );
        }),
      );
      final QueryResult<Object?> result = await client.query(
        QueryOptions<Object?>(
          document: gql('query Ping { ping }'),
          fetchPolicy: FetchPolicy.noCache,
        ),
      );
      expect(result.hasException, isFalse, reason: '${result.exception}');
      return <String, String>{
        for (final MapEntry<String, String> e in request!.headers.entries)
          e.key.toLowerCase(): e.value,
      };
    }

    test('GraphQL over HTTP: a Tenant-Id header when the shop knows its tenant', () async {
      expect((await headersOf(tenant: 'acme'))['tenant-id'], 'acme');
      expect((await headersOf()).containsKey('tenant-id'), isFalse);
    });

    test('GraphQL over HTTP with a token: the token tenant, never another', () async {
      final String token =
          jwt(<String, Object?>{'id': 'u1', 'role': 'user', 'tenantId': tenantId});
      final Map<String, String> headers = await headersOf(tenant: 'acme', token: token);
      expect(headers['tenant-id'], tenantId);
      expect(headers['authorization'], 'Bearer $token');
    });
  });
}
