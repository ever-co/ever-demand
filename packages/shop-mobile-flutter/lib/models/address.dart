import 'package:shop_flutter_mobile/models/country.dart';
import 'package:shop_flutter_mobile/models/geolocation.dart';

class Address {
  final Country? countryId;
  final String? city;
  final String? postcode;
  final String? notes;
  final String? streetAddress;
  final String? house;
  final Location? loc;

  Address({
    this.countryId,
    this.city,
    this.postcode,
    this.notes,
    this.streetAddress,
    this.house,
    this.loc,
  });

  Address getEmptyAddress() {
    return Address(
      countryId: null,
      city: '',
      postcode: '',
      notes: '',
      streetAddress: '',
      house: '',
    );
  }
}

class GeolocationUpdateObject extends Address {}
