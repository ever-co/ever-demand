import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/app.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // To load the .env file contents into dotenv.
  // NOTE: fileName defaults to .env and can be omitted in this case.
  await dotenv.load(fileName: ".env.template");
  // Initialize Hive - Store module for graphql_flutter
  await initHiveForFlutter();
  runApp(const MyApp());
}
