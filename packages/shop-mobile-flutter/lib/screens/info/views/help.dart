import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/widgets/widgets.dart';

class InfoHelpScreen extends StatefulWidget {
  const InfoHelpScreen({Key? key}) : super(key: key);

  @override
  State<InfoHelpScreen> createState() => _InfoHelpScreenState();
}

class _InfoHelpScreenState extends State<InfoHelpScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.help),
      ),
      drawer: const AppDrawer(),
    );
  }
}
