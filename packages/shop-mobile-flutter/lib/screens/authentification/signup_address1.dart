import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/colors.dart';

const customColor = AppColors();

class SignupAdress extends StatefulWidget {
  const SignupAdress({Key? key}) : super(key: key);

  @override
  _SignupAdressState createState() => _SignupAdressState();
}

class _SignupAdressState extends State<SignupAdress> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      //body: getBody,
      backgroundColor: customColor.dRed,
    );
  }
}