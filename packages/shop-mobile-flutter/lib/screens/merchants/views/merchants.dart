import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:shop_flutter_mobile/widgets/drawers/app_drawer.dart';

class MerchantsScreen extends StatefulWidget {
  const MerchantsScreen({Key? key}) : super(key: key);

  @override
  State<MerchantsScreen> createState() => _MerchantsScreenState();
}

class _MerchantsScreenState extends State<MerchantsScreen> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: appBarColor,
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.merchants),
        actions: [
          TextButton(
            onPressed: () {},
            child: Text(
              AppLocalizations.of(context)!.back,
              style: const TextStyle(color: Colors.white),
            ),
          )
        ],
      ),
      drawer: const AppDrawer(),
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Searchbar
            Container(
              color: scaffoldBackgroundColor,
              padding: const EdgeInsets.symmetric(
                vertical: 10.0,
                horizontal: 15.0,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 40.0,
                      padding: const EdgeInsets.symmetric(
                        vertical: 5.0,
                        horizontal: 10.0,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      child: Center(
                        child: TextFormField(
                          onSaved: (input) => _searchQuery = input!,
                          initialValue: _searchQuery,
                          onChanged: (value) => setState(() {
                            _searchQuery = value;
                          }),
                          cursorColor: dangerColor,
                          decoration: InputDecoration(
                            hintText:
                                AppLocalizations.of(context)!.merchantsViewname,
                            border: InputBorder.none,
                            hintMaxLines: 1,
                            contentPadding: EdgeInsets.zero,
                            isDense: true,
                            icon: const Icon(
                              Icons.search,
                              color: Colors.black87,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 15.0),
                  MaterialButton(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                    padding: const EdgeInsets.symmetric(
                      vertical: 10.0,
                      horizontal: 15.0,
                    ),
                    color: dangerColorShade,
                    onPressed: () {},
                    child: Row(children: [
                      const Icon(Icons.qr_code,
                          color: Colors.white, size: 22.0),
                      const SizedBox(width: 5.0),
                      Text(
                        AppLocalizations.of(context)!.scan,
                        style: const TextStyle(
                            color: Colors.white, fontSize: 16.0),
                      ),
                    ]),
                  ),
                ],
              ),
            ),

            //
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 10.0),
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 20.0),
                      child: Center(
                        child: Text(
                          _searchQuery.isEmpty
                              ? AppLocalizations.of(context)!
                                  .merchantsViewCloseToYou
                                  .toUpperCase()
                              : "${AppLocalizations.of(context)!.merchantsViewwithName}  '$_searchQuery'"
                                  .toUpperCase(),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontWeight: FontWeight.w500,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    Container(
                      margin: const EdgeInsets.only(bottom: 15.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(2.5),
                      ),
                      child: ListTile(
                        contentPadding:
                            const EdgeInsets.symmetric(horizontal: 15.0),
                        leading: ClipOval(
                          child: Container(
                            height: 40.0,
                            width: 40.0,
                            decoration:
                                BoxDecoration(color: Colors.grey.shade500),
                          ),
                        ),
                        title: const Text(
                          'Restaurant Altenwerth, Halvorson, New York City, Maddison Park',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                    Container(
                      margin: const EdgeInsets.only(bottom: 15.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(2.5),
                      ),
                      child: ListTile(
                        contentPadding:
                            const EdgeInsets.symmetric(horizontal: 15.0),
                        leading: ClipOval(
                          child: Container(
                            height: 40.0,
                            width: 40.0,
                            decoration:
                                BoxDecoration(color: Colors.grey.shade500),
                          ),
                        ),
                        title: const Text(
                          'Restaurant Altenwerth, Halvorson, New York City, Maddison Park',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
