import 'geo.dart';
import 'json.dart';

/// An invite (`Invite`). [raw] is the object as the API sent it: the Ionic
/// app hands `invite.geoLocation` to `user-auth.register` unchanged, and
/// `invite.create(inviteRequest)` gets the whole invite request back.
class Invite {
  const Invite({
    required this.id,
    required this.geoLocation,
    this.apartment,
    this.code,
    this.raw = const <String, dynamic>{},
  });

  factory Invite.fromJson(Json json) => Invite(
        id: readId(json) ?? '',
        geoLocation: GeoLocation.fromJson(asJson(json['geoLocation'])),
        apartment: readString(json, 'apartment'),
        code: readString(json, 'code'),
        raw: json,
      );

  final String id;
  final GeoLocation geoLocation;
  final String? apartment;
  final String? code;
  final Json raw;

  Json get rawGeoLocation => asJson(raw['geoLocation']);
}

class InviteRequest {
  const InviteRequest({
    required this.id,
    this.geoLocation,
    this.apartment,
    this.raw = const <String, dynamic>{},
  });

  factory InviteRequest.fromJson(Json json) => InviteRequest(
        id: readId(json) ?? '',
        geoLocation: json['geoLocation'] is Map
            ? GeoLocation.fromJson(asJson(json['geoLocation']))
            : null,
        apartment: readString(json, 'apartment'),
        raw: json,
      );

  final String id;
  final GeoLocation? geoLocation;
  final String? apartment;
  final Json raw;

  /// `InviteRequest.toAddressString()`: "street house[/apartment], city".
  String? toAddressString() {
    final GeoLocation? g = geoLocation;
    if (g == null) return null;
    final StringBuffer b = StringBuffer('${g.streetAddress} ${g.house}');
    final String? apt = apartment;
    if (apt != null && apt.isNotEmpty) b.write('/$apt');
    b.write(', ${g.city}');
    return b.toString();
  }
}
