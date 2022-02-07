import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/assets/fonts/mainColors.dart';
import 'package:shop_flutter_mobile/screens/authentification/animations/delayed_animation.dart';
// import 'package:flutter_localizations/flutter_localizations.dart';

const Color dRed = Color(0xFF252836);
const Color everSubtitle = Color(0xFF64656C);
const Color everSignin = Color(0xFFBD4742);

class LoginPage extends StatelessWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: dRed,
      body: SingleChildScrollView(
        child: Container(
          margin: const EdgeInsets.symmetric(
            vertical: 60,
            horizontal: 30,
          ),
          child: Column(children: [
            DelayedAnimation(
              // this one controls the logo animation
              delay: 1500,
              child: Container(
                alignment: Alignment.center,
                height: 300,
                margin: const EdgeInsets.only(top: 50, bottom: 20),
                child: Image.asset('imgs/icon.png'),
              ),
            ),
            DelayedAnimation(
              // this one controls the button animation
              delay: 3500,
              child: Container(
                width: double.infinity,
                height: 50,
                margin: const EdgeInsets.only(top: 30, bottom: 20),
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/login');
                  },
                  style: ButtonStyle(
                    backgroundColor: MaterialStateProperty.all(everSignin),
                    foregroundColor: MaterialStateProperty.all(Colors.white),
                    textStyle: MaterialStateProperty.all(const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                    )),
                  ),
                  child: const Text('Signup by Address'),
                ),
              ),
            ),
          ]),
        ),
      ),
    );
  }
}
