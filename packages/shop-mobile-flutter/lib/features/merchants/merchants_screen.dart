import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../core/l10n.dart';
import '../../data/models/geo.dart';
import '../../data/models/warehouse.dart';
import '../../providers.dart';
import '../../widgets/common.dart';

/// Reads one QR / barcode with the camera; null when closed.
typedef CodeScanner = Future<String?> Function(BuildContext context);

/// The camera scanner (mobile_scanner); overridable in tests.
final Provider<CodeScanner> codeScannerProvider =
    Provider<CodeScanner>((Ref ref) => scanCodeWithCamera);

Future<String?> scanCodeWithCamera(BuildContext context) =>
    Navigator.of(context).push<String>(
      MaterialPageRoute<String>(
        fullscreenDialog: true,
        builder: (BuildContext context) => Scaffold(
          appBar: AppBar(title: Text(context.l10n.scan)),
          body: MobileScanner(
            onDetect: (BarcodeCapture capture) {
              final String? value = capture.barcodes.isEmpty
                  ? null
                  : capture.barcodes.first.rawValue;
              if (value != null && Navigator.of(context).canPop()) {
                Navigator.of(context).pop(value);
              }
            },
          ),
        ),
      ),
    );

/// Merchants (`/merchants`): close to the customer, or by name; tapping one
/// enters its store.
class MerchantsScreen extends ConsumerStatefulWidget {
  const MerchantsScreen({super.key});

  @override
  ConsumerState<MerchantsScreen> createState() => _MerchantsScreenState();
}

class _MerchantsScreenState extends ConsumerState<MerchantsScreen> {
  final TextEditingController _search = TextEditingController();
  List<Warehouse>? _merchants;
  Loc? _loc;
  int _query = 0;

  @override
  void initState() {
    super.initState();
    unawaited(_load());
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final int query = ++_query;
    try {
      _loc ??= await ref.read(locationRepositoryProvider).customerLoc();
      final String name = _search.text;
      final List<Warehouse> merchants = name.isEmpty
          ? await ref.read(merchantsRepositoryProvider).getCloseMerchants(_loc!)
          : await ref.read(merchantsRepositoryProvider).getMerchantsByName(name, _loc);
      if (mounted && query == _query) setState(() => _merchants = merchants);
    } on Object catch (e) {
      debugPrint('Could not load merchants: $e');
      if (mounted && query == _query) setState(() => _merchants = <Warehouse>[]);
    }
  }

  Future<void> _scan() async {
    try {
      final String? id = await ref.read(codeScannerProvider)(context);
      if (id == null) return;
      final Warehouse? merchant =
          await ref.read(merchantsRepositoryProvider).getWarehouse(id);
      if (merchant == null || !mounted) return;
      _search.text = merchant.name;
      await _load();
    } on Object catch (e) {
      if (mounted) await showAppAlert(context, '$e');
    }
  }

  void _select(Warehouse merchant) {
    ref.read(appStoreProvider).inStore = merchant.id;
    context.go('/products');
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    final List<Warehouse>? merchants = _merchants;
    return Scaffold(
      key: const Key('merchants-screen'),
      appBar: AppBar(
        title: Text(l10n.merchants),
        actions: <Widget>[
          BackTextButton(onPressed: () => context.go('/products')),
        ],
      ),
      body: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: <Widget>[
                Expanded(
                  child: TextField(
                    key: const Key('merchants-search'),
                    controller: _search,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.search),
                      hintText: l10n.merchantsViewName,
                    ),
                    onChanged: (_) => unawaited(_load()),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton.icon(
                  key: const Key('merchants-scan'),
                  onPressed: () => unawaited(_scan()),
                  icon: const Icon(Icons.qr_code_scanner),
                  label: Text(l10n.scan),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Align(
              alignment: AlignmentDirectional.centerStart,
              child: Text(
                _search.text.isEmpty
                    ? l10n.merchantsViewCloseToYou
                    : "${l10n.merchantsViewWithName} '${_search.text}'",
                key: const Key('merchants-heading'),
                style: Theme.of(context).textTheme.titleSmall,
              ),
            ),
          ),
          Expanded(
            child: merchants == null
                ? const LoadingView()
                : merchants.isEmpty
                    ? Center(child: Text(l10n.notFound, key: const Key('merchants-not-found')))
                    : ListView.builder(
                        itemCount: merchants.length,
                        itemBuilder: (_, int i) => ListTile(
                          key: Key('merchant-${merchants[i].id}'),
                          leading: WarehouseLogo(merchants[i].logo),
                          title: Text(merchants[i].name),
                          onTap: () => _select(merchants[i]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
