import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/widgets/drawers/app_drawer.dart';

class InfoTermsOfUseScreen extends StatefulWidget {
  const InfoTermsOfUseScreen({Key? key}) : super(key: key);

  @override
  State<InfoTermsOfUseScreen> createState() => _InfoTermsOfUseScreenState();
}

class _InfoTermsOfUseScreenState extends State<InfoTermsOfUseScreen> {
  @override
  Widget build(BuildContext context) {
    const TextStyle sentenceTheme = TextStyle(color: Colors.white54);
    TextStyle titleTheme =
        Theme.of(context).textTheme.headline6!.copyWith(color: Colors.white70);

    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.termsOfUse),
      ),
      drawer: const AppDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(15.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Terms of Service',
              style: titleTheme,
            ),
            const SizedBox(height: 15),
            const Text(
              "Thank you for your interest in the Ever application for your mobile device (the \"App\") provided to you by EVER CO.LTD (\"EVER\" \"us\" or \"we\"), and our web site Ever.co (the \"Site\"), as well as related web sites, networks, downloadable software, and other services provided by us and on which a link to this Terms of Service id displayed (collectively, together with the Apps and  Site, our \"Service\")",
              style: sentenceTheme,
            ),
          ],
        ),
      ),
    );
  }
}
