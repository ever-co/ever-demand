class Location {
  final String type;
  final List<double> coordinates;

  const Location({
    required this.type,
    required this.coordinates,
  });
}

class GeoLocationCoordinates {
  final double lng;
  final double lat;

  const GeoLocationCoordinates({
    required this.lng,
    required this.lat,
  });
}

class GeoLocation {
  final String? typename;
  final String? id;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final int countryId;
  final String? countryName;
  final String city;
  final String streetAddress;
  final String house;
  final String postcode;
  final String? notes;
  final Location loc;
  final GeoLocationCoordinates? coordinates;

  const GeoLocation({
    this.typename,
    this.id,
    this.createdAt,
    this.updatedAt,
    required this.countryId,
    this.countryName,
    required this.city,
    required this.streetAddress,
    required this.house,
    required this.postcode,
    this.notes,
    required this.loc,
    this.coordinates,
  });

  factory GeoLocation.fromJson(Map<String, dynamic> json) {
    return GeoLocation(
      typename: json['__typename'],
      id: json['_id'],
      createdAt: json['_createdAt'],
      updatedAt: json['_updatedAt'],
      countryId: json['countryId'],
      countryName: json['countryName'],
      city: json['city'],
      streetAddress: json['streetAddress'],
      house: json['house'],
      postcode: json['postcode'],
      notes: json['notes'],
      loc: json['loc'],
      coordinates: json['coordinates'],
    );
  }
}
