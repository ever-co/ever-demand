import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/widgets/widgets.dart';

class InfoPrivacyScreen extends StatefulWidget {
  const InfoPrivacyScreen({Key? key}) : super(key: key);

  @override
  State<InfoPrivacyScreen> createState() => _InfoPrivacyScreenState();
}

class _InfoPrivacyScreenState extends State<InfoPrivacyScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.privacy),
      ),
      drawer: const AppDrawer(),
    );
  }
}
