import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/widgets/drawers/app_drawer.dart';

class InfoAboutScreen extends StatefulWidget {
  const InfoAboutScreen({Key? key}) : super(key: key);

  @override
  State<InfoAboutScreen> createState() => _InfoAboutScreenState();
}

class _InfoAboutScreenState extends State<InfoAboutScreen> {
  final customColor = const AppColors();

  @override
  Widget build(BuildContext context) {
    const TextStyle sentenceTheme = TextStyle(color: Colors.white54);
    TextStyle titleTheme =
        Theme.of(context).textTheme.headline6!.copyWith(color: Colors.white70);

    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.aboutus),
      ),
      drawer: const AppDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(15.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Do you think online shopping could be better?',
              style: titleTheme,
            ),
            const SizedBox(height: 15),
            const Text(
              "So, you never wait half an hour for your order to be prepared or cooked. And it never again comes broken or cold. How about the phrase `out of stock`, it'annoying right?\n\nIn our app, this will never happen, ever! Here is why...",
              style: sentenceTheme,
            ),
            const SizedBox(height: 25),
            Text(
              'INSTANT',
              style: titleTheme,
            ),
            const SizedBox(height: 15),
            const Text(
              "All already prepared hot. \n Get it delivered from your tap to your door in 5-10 minutes.",
              style: sentenceTheme,
            ),
            const SizedBox(height: 25),
            Text(
              'SIMPLE',
              style: titleTheme,
            ),
            const SizedBox(height: 15),
            const Text(
              "Just swipe for something you like, tap `Buy` and your order is on its way. You can pay during or after delivery!",
              style: sentenceTheme,
            ),
            const SizedBox(height: 25),
            Text(
              'SAFE & LOVE',
              style: titleTheme,
            ),
            const SizedBox(height: 15),
            const Text(
              "We delivery from local stores and restaurants you already know and love. Only good surprises here!",
              style: sentenceTheme,
            )
          ],
        ),
      ),
    );
  }
}
