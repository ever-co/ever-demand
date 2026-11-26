/// Client side of tenant resolution (docs/multi-tenant/DESIGN.md §3.3), the
/// Dart port of `packages/common-angular/src/lib/tenant.ts`. One API serves
/// many tenants (businesses), so the shop always tells it which one it is
/// for. The first match wins:
///
/// 1. the build-time tenant (white-label build: `--dart-define=TENANT=...`,
///    a slug or a 24-hex id);
/// 2. web build: the `<slug>` of a `<slug>.<TENANT_BASE_DOMAIN>` page host;
/// 3. web build: a `?tenant=<slug>` query (kept in storage, for dev and links);
/// 4. the tenant kept from an earlier visit.
///
/// Native builds have no page host or query: only the build-time tenant
/// applies there. With none, nothing is sent and the API decides
/// (single-tenant installs use their default tenant).
library;

import 'dart:convert';

/// HTTP header the API reads the tenant from (GraphQL and REST).
const String tenantHeader = 'Tenant-Id';

final RegExp _slug = RegExp(r'^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$');
final RegExp _objectId = RegExp(r'^[0-9a-fA-F]{24}$');
const Set<String> _platformHosts = <String>{'app', 'api', 'www', 'admin'};

/// A tenant slug or a 24-hex tenant id.
bool isTenantKey(String? value) =>
    value != null &&
    value.isNotEmpty &&
    (_slug.hasMatch(value) || _objectId.hasMatch(value));

/// `<slug>` of `<slug>.<baseDomain>` (one label, not a platform host), else
/// null.
String? tenantFromHost(String? hostname, String? baseDomain) {
  final String host =
      (hostname ?? '').toLowerCase().replaceFirst(RegExp(r'\.$'), '');
  final String base = (baseDomain ?? '')
      .toLowerCase()
      .replaceFirst(RegExp(r'^\.'), '')
      .replaceFirst(RegExp(r'\.$'), '');

  if (host.isEmpty || base.isEmpty || !host.endsWith('.$base')) return null;

  final String label = host.substring(0, host.length - base.length - 1);

  if (label.contains('.') ||
      _platformHosts.contains(label) ||
      !_slug.hasMatch(label)) {
    return null;
  }
  return label;
}

/// `tenant` of the page query: `/?tenant=x`, or `/#/route?tenant=x` with the
/// default hash URL strategy of Flutter web.
String? _queryTenant(Uri location) {
  String? value = location.queryParameters['tenant'];
  final int q = location.fragment.indexOf('?');
  if (value == null && q >= 0) {
    try {
      value = Uri.splitQueryString(
        location.fragment.substring(q + 1),
      )['tenant'];
    } on FormatException {
      value = null;
    }
  }
  return value?.trim().toLowerCase();
}

/// The tenant this shop runs for, or null (then the API decides).
///
/// [location] is the page URL on the web build (`Uri.base`), null on native.
/// [kept] is the tenant kept from an earlier visit; [keep] stores the tenant
/// of a `?tenant=` query (called only when it changes).
String? resolveClientTenant({
  String? buildTenant,
  String? baseDomain,
  Uri? location,
  String? kept,
  void Function(String tenant)? keep,
}) {
  final String build = (buildTenant ?? '').trim().toLowerCase();
  if (isTenantKey(build)) return build;

  final String? fromHost =
      location == null ? null : tenantFromHost(location.host, baseDomain);
  if (fromHost != null) return fromHost;

  final String? fromQuery = location == null ? null : _queryTenant(location);
  if (isTenantKey(fromQuery)) {
    if (fromQuery != kept) keep?.call(fromQuery!);
    return fromQuery;
  }

  final String? stored = kept?.trim().toLowerCase();
  return isTenantKey(stored) ? stored : null;
}

/// The `tenantId` claim of a login token (read, not verified: the API
/// verifies it), or null when it has none (tokens issued before tenants
/// existed belong to the default tenant).
String? tokenTenantId(String? token) {
  final List<String> parts = (token ?? '')
      .replaceFirst(RegExp(r'^bearer\s+', caseSensitive: false), '')
      .split('.');
  if (parts.length < 2 || parts[1].isEmpty) return null;
  try {
    final Object? claims = jsonDecode(
      utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
    );
    final Object? tenantId =
        claims is Map<String, dynamic> ? claims['tenantId'] : null;
    return tenantId is String && isTenantKey(tenantId) ? tenantId : null;
  } on FormatException {
    return null;
  }
}

/// The tenant to send next to a login token. A token carries its tenant and
/// wins on the server, which refuses (403) a `Tenant-Id` naming another one:
/// with a token, send the token's own tenant (or none for an old token
/// without the claim), never the resolved one.
String? tenantToSend(String? tenant, String? token) =>
    token == null || token.isEmpty ? tenant : tokenTenantId(token);

/// socket.io handshake `auth` (`{ tenant?, token? }`), read at every
/// (re)connect.
Map<String, dynamic> socketAuth(String? tenant, [String? token]) {
  final String? sent = tenantToSend(tenant, token);
  return <String, dynamic>{
    'tenant': ?sent,
    if (token != null && token.isNotEmpty) 'token': token,
  };
}

/// graphql-ws `connection_init` payload: `authorization` with a token,
/// `tenant` when known.
Map<String, dynamic> wsConnectionParams(String? token, String? tenant) {
  final String? sent = tenantToSend(tenant, token);
  return <String, dynamic>{
    if (token != null && token.isNotEmpty) 'authorization': 'Bearer $token',
    'tenant': ?sent,
  };
}
