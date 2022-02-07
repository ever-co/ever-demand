import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop_flutter_mobile/screens/authentification/login.dart';

void main() {
  testWidgets('Test Login Page loading', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const LoginPage());

    var button = find.text("Food Delivery & Takeout");
    expect(button, findsOneWidget);

    await tester.tap(button);
    await tester.pump();
  });
}
