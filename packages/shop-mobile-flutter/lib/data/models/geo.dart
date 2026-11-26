import 'countries.dart' as countries;
import 'json.dart';

/// GeoJSON point: `coordinates` is `[lng, lat]`, as the API stores it.
class Loc {
  const Loc({required this.lng, required this.lat});

  factory Loc.fromJson(Json json) {
    final Object? c = json['coordinates'];
    if (c is List && c.length >= 2) {
      return Loc(
        lng: (c[0] as num).toDouble(),
        lat: (c[1] as num).toDouble(),
      );
    }
    return const Loc(lng: 0, lat: 0);
  }

  final double lng;
  final double lat;

  Json toJson() => <String, dynamic>{
        'type': 'Point',
        'coordinates': <double>[lng, lat],
      };

  @override
  bool operator ==(Object other) =>
      other is Loc && other.lng == lng && other.lat == lat;

  @override
  int get hashCode => Object.hash(lng, lat);

  @override
  String toString() => 'Loc($lat, $lng)';
}

class GeoLocation {
  const GeoLocation({
    this.id,
    this.countryId,
    this.countryName,
    this.city,
    this.streetAddress,
    this.house,
    this.postcode,
    this.notes,
    this.loc,
  });

  factory GeoLocation.fromJson(Json json) => GeoLocation(
        id: readId(json),
        countryId: readInt(json, 'countryId'),
        countryName: readString(json, 'countryName'),
        city: readString(json, 'city'),
        streetAddress: readString(json, 'streetAddress'),
        house: readString(json, 'house'),
        postcode: readString(json, 'postcode'),
        notes: readString(json, 'notes'),
        loc: json['loc'] is Map ? Loc.fromJson(asJson(json['loc'])) : null,
      );

  final String? id;
  final int? countryId;
  final String? countryName;
  final String? city;
  final String? streetAddress;
  final String? house;
  final String? postcode;
  final String? notes;
  final Loc? loc;

  /// Name from the payload, else from the shared country table.
  String? get resolvedCountryName =>
      countryName ?? countries.countryName(countryId);

  /// The create / find object the API expects (`IGeoLocationCreateObject`).
  Json toJson() => <String, dynamic>{
        'countryId': countryId,
        'city': city,
        'streetAddress': streetAddress,
        'house': house,
        if (postcode != null) 'postcode': postcode,
        if (notes != null) 'notes': notes,
        if (loc != null) 'loc': loc!.toJson(),
      };
}
