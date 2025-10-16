import 'package:flutter/material.dart';

class ErrorsConnectionLostScreen extends StatefulWidget {
  const ErrorsConnectionLostScreen({Key? key}) : super(key: key);

  @override
  State<ErrorsConnectionLostScreen> createState() =>
      _ErrorsConnectionLostScreenState();
}

class _ErrorsConnectionLostScreenState
    extends State<ErrorsConnectionLostScreen> {
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: SingleChildScrollView(),
    );
  }
}
