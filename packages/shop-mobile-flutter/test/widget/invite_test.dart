import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';

import '../helpers/fixtures.dart';
import '../helpers/test_env.dart';

void main() {
  late TestEnv env;

  setUp(() {
    env = TestEnv();
    env.store
      ..registrationSystem = 'enabled'
      ..inviteSystem = true
      ..deviceId = 'd1';
    env.pyro
      ..onCall('user-auth.register', (_) => userJson(id: 'u5'))
      ..onValue('user.get', userJson(id: 'u5'))
      ..onValue('user-products.getPlaceholder', '')
      ..onCall(
        'geo-location.getAddressByCoordinatesUsingArcGIS',
        (_) => <String, Object?>{'locality': 'Sofia', 'thoroughfare': 'Vitosha', 'country': 'BG'},
      );
    env.gql
      ..on('GetCountOfGeoLocationProducts', (_) => <String, dynamic>{'getCountOfGeoLocationProducts': 0})
      ..on('GeoLocationProductsByPaging', (_) => <String, dynamic>{'geoLocationProductsByPaging': <Object?>[]});
  });

  group('invite by code', () {
    testWidgets('3 digits wait; the 4th submits getByCode and registers', (WidgetTester tester) async {
      env.pyro.onValue('invite.getByCode', inviteJson());
      await env.pumpApp(tester, location: '/invite');
      expect(find.byKey(const Key('invite-by-code-screen')), findsOneWidget);
      await tester.enterText(find.byKey(const Key('invite-code-input')), '123');
      await settle(tester);
      expect(env.pyro.callsTo('invite.getByCode'), isEmpty);
      await tester.enterText(find.byKey(const Key('invite-code-input')), '1234');
      await settle(tester);
      expect(env.pyro.callsTo('invite.getByCode'), hasLength(1));
      expect(env.store.userId, 'u5');
      expect(find.byKey(const Key('products-screen')), findsOneWidget);
    });

    testWidgets('wrong code → "Wrong code!"', (WidgetTester tester) async {
      env.pyro.onValue('invite.getByCode', null);
      await env.pumpApp(tester, location: '/invite/by-code');
      await tester.enterText(find.byKey(const Key('invite-code-input')), '1111');
      await settle(tester);
      expect(find.text('Wrong code!'), findsOneWidget);
      expect(env.store.userId, isNull);
    });

    testWidgets('after an invite request: thank-you text with the address', (WidgetTester tester) async {
      env.store
        ..inviteRequestId = 'ir1'
        ..inviteAddress = 'Vitosha 1/5, Sofia';
      await env.pumpApp(tester, location: '/invite/by-code');
      expect(find.text('Thank you for sign up!'), findsOneWidget);
      expect(find.byKey(const Key('invite-address')), findsOneWidget);
      expect(find.text('Vitosha 1/5, Sofia'), findsOneWidget);
      expect(find.byKey(const Key('invite-by-address')), findsNothing);
    });
  });

  group('invite by location', () {
    testWidgets('prefills city / street / country from ArcGIS', (WidgetTester tester) async {
      await env.pumpApp(tester, location: '/invite/by-location');
      expect(find.byKey(const Key('invite-by-location-screen')), findsOneWidget);
      expect(find.widgetWithText(TextField, 'Sofia'), findsOneWidget);
      expect(find.widgetWithText(TextField, 'Vitosha'), findsOneWidget);
      expect(find.text('Bulgaria'), findsOneWidget);
      expect(find.byKey(const Key('detecting-location')), findsNothing);
    });

    testWidgets('no invite yet: invite request saved, back to invite by code', (WidgetTester tester) async {
      env.pyro
        ..onValue('invite.getByLocation', null)
        ..onCall('invite-request.create', (_) => inviteRequestJson());
      await env.pumpApp(tester, location: '/invite/by-location');
      expect(find.byKey(const Key('address-submit')), findsNothing);
      await tester.enterText(find.byKey(const Key('address-house')), '1');
      await tester.enterText(find.byKey(const Key('address-apartment')), '5');
      await settle(tester);
      await tester.ensureVisible(find.byKey(const Key('address-submit')));
      await tapKey(tester, 'address-submit');
      final Map<Object?, Object?> request =
          env.pyro.callsTo('invite-request.create').single.single! as Map<Object?, Object?>;
      expect(request['apartment'], '5');
      expect(request['deviceId'], 'd1');
      expect(env.store.inviteRequestId, 'ir1');
      expect(find.byKey(const Key('invite-by-code-screen')), findsOneWidget);
      expect(find.text('Vitosha 1/5, Sofia'), findsOneWidget);
    });

    testWidgets('"no apartment" sends apartment 0; an invite found registers', (WidgetTester tester) async {
      env.pyro.onValue('invite.getByLocation', inviteJson());
      await env.pumpApp(tester, location: '/invite/by-location');
      await tester.enterText(find.byKey(const Key('address-house')), '7');
      await tapKey(tester, 'address-no-apartment');
      await tester.ensureVisible(find.byKey(const Key('address-submit')));
      await tapKey(tester, 'address-submit');
      final Map<Object?, Object?> info =
          env.pyro.callsTo('invite.getByLocation').single.single! as Map<Object?, Object?>;
      expect(info['apartment'], '0');
      expect(info['house'], '7');
      expect(info['countryId'], 21);
      expect(env.store.userId, 'u5');
      expect(find.byKey(const Key('products-screen')), findsOneWidget);
    });

    testWidgets('missing info → alert', (WidgetTester tester) async {
      env.pyro.onCall('geo-location.getAddressByCoordinatesUsingArcGIS', (_) => null);
      await env.pumpApp(tester, location: '/invite/by-location');
      await tester.enterText(find.byKey(const Key('address-house')), '7');
      await tester.enterText(find.byKey(const Key('address-apartment')), '2');
      await settle(tester);
      await tester.ensureVisible(find.byKey(const Key('address-submit')));
      await tapKey(tester, 'address-submit');
      expect(find.text('Some of the information missing!'), findsOneWidget);
      expect(env.pyro.callsTo('invite.getByLocation'), isEmpty);
    });
  });
}
