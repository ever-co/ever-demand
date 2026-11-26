// Small, forgiving readers for API payloads. The pyro RPC returns raw
// mongoose objects (`_id`, numbers as int or double, dates as ISO strings),
// GraphQL returns `id`; both shapes are accepted.

typedef Json = Map<String, dynamic>;

Json asJson(Object? value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) return value.map((Object? k, Object? v) => MapEntry('$k', v));
  return <String, dynamic>{};
}

Json? asJsonOrNull(Object? value) => value is Map ? asJson(value) : null;

List<Json> asJsonList(Object? value) => value is List
    ? value.whereType<Map<dynamic, dynamic>>().map(asJson).toList()
    : <Json>[];

String? readId(Json json) {
  final Object? id = json['id'] ?? json['_id'];
  return id?.toString();
}

String? readString(Json json, String key) {
  final Object? v = json[key];
  if (v == null) return null;
  return v.toString();
}

int? readInt(Json json, String key) {
  final Object? v = json[key];
  if (v is int) return v;
  if (v is num) return v.toInt();
  if (v is String) return int.tryParse(v);
  return null;
}

double? readDouble(Json json, String key) {
  final Object? v = json[key];
  if (v is num) return v.toDouble();
  if (v is String) return double.tryParse(v);
  return null;
}

bool readBool(Json json, String key, {bool fallback = false}) {
  final Object? v = json[key];
  if (v is bool) return v;
  if (v is num) return v != 0;
  if (v is String) return v == 'true';
  return fallback;
}

DateTime? readDate(Json json, String key) {
  final Object? v = json[key];
  if (v is String) return DateTime.tryParse(v);
  if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
  return null;
}

/// A reference that can be an id or a populated object.
String? readRefId(Json json, String key) {
  final Object? v = json[key];
  if (v == null) return null;
  if (v is Map) return readId(asJson(v));
  return v.toString();
}
