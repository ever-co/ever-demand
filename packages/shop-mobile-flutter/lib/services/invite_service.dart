import 'dart:async';

import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../data/models/countries.dart';
import '../data/models/geo.dart';
import '../data/models/invite.dart';
import '../data/models/json.dart';
import '../data/models/user.dart';
import '../data/repositories/location_repository.dart';
import '../data/repositories/orders_repository.dart';
import '../data/repositories/shop_api.dart';
import '../data/store/app_store.dart';

/// What the invite pages do after a submit.
sealed class InviteOutcome {
  const InviteOutcome();
}

/// Registered; go to [location] (products, or back to product details).
class InviteRegistered extends InviteOutcome {
  const InviteRegistered(this.location);
  final String location;
}

/// `invite.getByCode` found nothing: "Wrong code!".
class InviteWrongCode extends InviteOutcome {
  const InviteWrongCode();
}

/// The address form is incomplete: "Some of the information missing!".
class InviteInfoMissing extends InviteOutcome {
  const InviteInfoMissing();
}

/// An invite request was saved; wait for a code on invite by code.
class InviteRequested extends InviteOutcome {
  const InviteRequested();
}

/// The request failed (no coordinates, server error).
class InviteFailed extends InviteOutcome {
  const InviteFailed(this.error);
  final Object error;
}

/// Invite by location form values.
class AddressForm {
  const AddressForm({
    this.city = '',
    this.streetAddress = '',
    this.house,
    this.apartment,
    this.isApartment = true,
    this.countryId,
    this.notes,
  });

  final String city;
  final String streetAddress;
  final int? house;
  final int? apartment;
  final bool isApartment;
  final int? countryId;
  final String? notes;

  /// `ByLocationPage.isValid`: city and street non-empty, house and country
  /// non-zero numbers, apartment a non-zero number unless "no apartment".
  bool get isValid =>
      city.isNotEmpty &&
      streetAddress.isNotEmpty &&
      (house ?? 0) != 0 &&
      (countryId ?? 0) != 0 &&
      (!isApartment || (apartment ?? 0) != 0);

  /// `'0'` means a single-apartment house.
  String get apartmentValue => isApartment ? '${apartment ?? 0}' : '0';
}

/// Address found for the device position (invite by location prefill).
typedef AddressPrefill = ({String? city, String? streetAddress, int? countryId});

/// The two first-run flows: invite by code and invite by location.
class InviteService {
  InviteService({
    required this.config,
    required this.store,
    required this.api,
    required this.location,
    required this.orders,
  });

  final AppConfig config;
  final AppStore store;
  final ShopApi api;
  final LocationRepository location;
  final OrdersRepository orders;

  /// Number of demo orders seeded for the fake invite code.
  static const int fakeInviteOrders = 40;

  /// A 4-digit code was typed (1000-9999).
  Future<InviteOutcome> submitCode(int code) async {
    final FakeInvite? fake = config.fakeInvite;
    try {
      if (fake != null && code == fake.code) {
        final InviteOutcome outcome = await register(_fakeInvite(fake));
        final String? userId = store.userId;
        if (userId != null) {
          unawaited(
            orders
                .generateOrdersByCustomerId(fakeInviteOrders, userId)
                .catchError((Object e) {
              debugPrint('Could not seed the demo orders: $e');
            }),
          );
        }
        return outcome;
      }
      Loc? loc;
      try {
        loc = await location.deviceOrDefaultLoc();
      } on Object catch (e) {
        debugPrint('Error getting location: $e');
      }
      final Invite? invite = await api.invite.getByCode(
        inviteCode: '$code',
        location: loc,
      );
      if (invite == null) return const InviteWrongCode();
      return await register(invite);
    } on Object catch (e) {
      return InviteFailed(e);
    }
  }

  /// `user-auth.register` with the invite's apartment and geoLocation, then
  /// back to product details (`_backToDetails`) or to the products.
  Future<InviteOutcome> register(Invite invite) async {
    final User user = await api.userAuth.register(
      apartment: invite.apartment,
      geoLocation: invite.rawGeoLocation,
    );
    store.userId = user.id;
    final String? backToDetails = store.backToDetails;
    if (backToDetails != null) {
      store.backToDetails = null;
      final String warehouseId = store.warehouseId ?? '';
      return InviteRegistered(
        Uri(
          path: '/products/product-details/$backToDetails',
          queryParameters: <String, String>{
            'backUrl': '/products',
            'warehouseId': warehouseId,
          },
        ).toString(),
      );
    }
    return const InviteRegistered('/products');
  }

  /// Invite by location submit.
  Future<InviteOutcome> submitAddress(AddressForm form) async {
    if (!form.isValid) return const InviteInfoMissing();
    try {
      final Invite? invite = await api.invite.getByLocation(
        apartment: form.apartmentValue,
        house: '${form.house}',
        streetAddress: form.streetAddress,
        city: form.city,
        countryId: form.countryId!,
        notes: form.notes,
      );
      if (invite != null) return await register(invite);

      // No invite here yet: ask for one. The Ionic app first tries a Google
      // forward geocode of the address; without Google Maps this uses the
      // device (or default) coordinates, its second choice.
      final Loc? loc = await location.deviceOrDefaultLoc();
      if (loc == null) {
        return const InviteFailed(
          LocationUnavailableException(
            "Can't get coordinates for the creation of invite request!",
          ),
        );
      }
      final InviteRequest request = await api.inviteRequest.create(
        geoLocation: GeoLocation(
          loc: loc,
          countryId: form.countryId,
          city: form.city,
          streetAddress: form.streetAddress,
          house: '${form.house}',
          notes: form.notes,
        ),
        apartment: form.apartmentValue,
        deviceId: store.deviceId,
      );
      if (store.inviteSystem) {
        store.inviteRequestId = request.id;
        store.inviteAddress = request.toAddressString();
        return const InviteRequested();
      }
      final Invite created = await api.invite.create(request.raw);
      return await register(created);
    } on Object catch (e) {
      return InviteFailed(e);
    }
  }

  /// Reverse geocode of the device (or default) position with
  /// `geo-location.getAddressByCoordinatesUsingArcGIS`.
  Future<AddressPrefill?> prefillAddress() async {
    try {
      final Loc? loc = await location.deviceOrDefaultLoc();
      if (loc == null) return null;
      final ReverseGeocodedAddress? address = await api.geoLocation
          .getAddressByCoordinatesUsingArcGIS(loc.lat, loc.lng);
      if (address == null) return null;
      return (
        city: address.locality,
        streetAddress: address.thoroughfare,
        countryId: countryIdFromCode(address.country),
      );
    } on Object catch (e) {
      debugPrint("Can't detect location: $e");
      return null;
    }
  }

  Invite _fakeInvite(FakeInvite f) {
    final Json geo = <String, dynamic>{
      '_id': f.id,
      'loc': <String, dynamic>{
        'type': 'Point',
        'coordinates': <double>[
          config.defaultLongitude ?? 0,
          config.defaultLatitude ?? 0,
        ],
      },
      'city': f.city,
      'postcode': f.postcode,
      'streetAddress': f.address,
      'house': f.house,
      'countryId': f.countryId,
      '_createdAt': f.createdAt,
      '_updatedAt': f.updatedAt,
    };
    return Invite.fromJson(<String, dynamic>{
      '_id': f.id,
      'geoLocation': geo,
      'apartment': f.apartment,
      'code': '${f.code}',
      '_createdAt': f.createdAt,
      '_updatedAt': f.updatedAt,
    });
  }
}
