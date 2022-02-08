import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/screens/authentification/animations/delayed_animation.dart';
import 'package:shop_flutter_mobile/colors.dart';
// import 'package:flutter_localizations/flutter_localizations.dart';

const customColor = AppColors();

class LoginPage extends StatelessWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: customColor.dRed,
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
                child: Image.asset('/imgs/ever.png',
                    width: 300, height: 300), // Ever logo loading
              ),
            ),
            /* DelayedAnimation(
              // this one controls the logo animation
              delay: 800,
              child: Container(
                alignment: Alignment.center,
                height: 200,
                margin: const EdgeInsets.only(top: 10, bottom: 10),
                child: const Text("Food Delivery & Takeout",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    )), // Ever logo loading
              ),
            ), */
            DelayedAnimation(
              // this one controls the button animation
              delay: 1800,
              child: Container(
                width: double.infinity,
                height: 50,
                margin: const EdgeInsets.only(top: 30, bottom: 20),
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/login');
                  },
                  style: ButtonStyle(
                    shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                        RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12.0),
                      // side: const BorderSide(color: white),
                    )),
                    backgroundColor:
                        MaterialStateProperty.all(customColor.everSignin),
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
