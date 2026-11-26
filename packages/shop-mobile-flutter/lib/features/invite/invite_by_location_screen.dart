import 'dart:async';

import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../core/l10n.dart';
import '../../core/theme.dart';
import '../../data/models/countries.dart';
import '../../providers.dart';
import '../../routing/app_router.dart';
import '../../services/invite_service.dart';
import '../../widgets/common.dart';

/// Invite by location (`/invite/by-location`): the customer's address.
class InviteByLocationScreen extends ConsumerStatefulWidget {
  const InviteByLocationScreen({super.key});

  /// `Country.IL`, the Ionic form's default.
  static final int defaultCountryId = countryIdFromCode('IL')!;

  @override
  ConsumerState<InviteByLocationScreen> createState() =>
      _InviteByLocationScreenState();
}

class _InviteByLocationScreenState
    extends ConsumerState<InviteByLocationScreen> {
  final TextEditingController _city = TextEditingController();
  final TextEditingController _street = TextEditingController();
  final TextEditingController _house = TextEditingController();
  final TextEditingController _apartment = TextEditingController();
  final TextEditingController _notes = TextEditingController();
  bool _isApartment = true;
  bool _showNotes = false;
  bool _detecting = true;
  bool _busy = false;
  int _countryId = InviteByLocationScreen.defaultCountryId;
  late final List<int> _countries = countryIdsByName();

  @override
  void initState() {
    super.initState();
    unawaited(_prefill());
  }

  @override
  void dispose() {
    for (final TextEditingController c in <TextEditingController>[
      _city,
      _street,
      _house,
      _apartment,
      _notes,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _prefill() async {
    final AddressPrefill? address =
        await ref.read(inviteServiceProvider).prefillAddress();
    if (!mounted) return;
    setState(() {
      _detecting = false;
      if (address == null) return;
      if (_city.text.isEmpty && address.city != null) _city.text = address.city!;
      if (_street.text.isEmpty && address.streetAddress != null) {
        _street.text = address.streetAddress!;
      }
      final int? country = address.countryId;
      if (country != null) _countryId = country;
    });
  }

  AddressForm get _form => AddressForm(
        city: _city.text.trim(),
        streetAddress: _street.text.trim(),
        house: int.tryParse(_house.text),
        apartment: int.tryParse(_apartment.text),
        isApartment: _isApartment,
        countryId: _countryId,
        notes: _notes.text.isEmpty ? null : _notes.text,
      );

  Future<void> _submit() async {
    if (_busy) return;
    setState(() => _busy = true);
    final InviteOutcome outcome =
        await ref.read(inviteServiceProvider).submitAddress(_form);
    if (!mounted) return;
    setState(() => _busy = false);
    switch (outcome) {
      case InviteRegistered(:final String location):
        context.go(location);
      case InviteRequested():
        context.go(Routes.inviteByCode);
      case InviteInfoMissing():
        await showAppAlert(context, context.l10n.inviteViewInfoMissing);
      case InviteFailed(:final Object error):
        debugPrint('Invite by location failed: $error');
        await showAppAlert(
          context,
          context.l10n.inviteViewCantAccessLocation,
        );
      case InviteWrongCode():
        break;
    }
  }

  InputDecoration _decoration(String label) => InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white70),
        enabledBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: Colors.white38),
        ),
      );

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    const TextStyle white = TextStyle(color: Colors.white);
    final bool showSubmit = _house.text.isNotEmpty &&
        (_apartment.text.isNotEmpty || !_isApartment);

    return Scaffold(
      key: const Key('invite-by-location-screen'),
      backgroundColor: EverColors.primary,
      appBar: AppBar(
        title: Text(l10n.inviteViewYourAddress),
        automaticallyImplyLeading: false,
        actions: <Widget>[
          if (ref.watch(appStoreProvider).inviteSystem)
            BackTextButton(onPressed: () => context.go(Routes.inviteByCode)),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: <Widget>[
            Text(
              l10n.inviteViewLaunchNotification,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white70),
            ),
            const SizedBox(height: 12),
            if (_detecting)
              Text(
                l10n.inviteViewDetectingLocation,
                key: const Key('detecting-location'),
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white54),
              ),
            DropdownButtonFormField<int>(
              key: const Key('address-country'),
              initialValue: _countryId,
              isExpanded: true,
              dropdownColor: EverColors.brandLight,
              style: white,
              decoration: _decoration(l10n.country),
              items: <DropdownMenuItem<int>>[
                for (final int id in _countries)
                  DropdownMenuItem<int>(
                    value: id,
                    child: Text(countryName(id)!, overflow: TextOverflow.ellipsis),
                  ),
              ],
              onChanged: (int? v) => setState(() => _countryId = v ?? _countryId),
            ),
            TextField(
              key: const Key('address-city'),
              controller: _city,
              style: white,
              decoration: _decoration(l10n.city),
              onChanged: (_) => setState(() {}),
            ),
            TextField(
              key: const Key('address-street'),
              controller: _street,
              style: white,
              decoration: _decoration(l10n.street),
              onChanged: (_) => setState(() {}),
            ),
            TextField(
              key: const Key('address-house'),
              controller: _house,
              style: white,
              keyboardType: TextInputType.number,
              inputFormatters: <TextInputFormatter>[
                FilteringTextInputFormatter.digitsOnly,
              ],
              decoration: _decoration(l10n.house),
              onChanged: (_) => setState(() {}),
            ),
            Row(
              children: <Widget>[
                Expanded(
                  child: TextField(
                    key: const Key('address-apartment'),
                    controller: _apartment,
                    enabled: _isApartment,
                    style: white,
                    keyboardType: TextInputType.number,
                    inputFormatters: <TextInputFormatter>[
                      FilteringTextInputFormatter.digitsOnly,
                    ],
                    decoration: _decoration(l10n.apartment),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
                const SizedBox(width: 12),
                Text(l10n.noApartment, style: const TextStyle(color: Colors.white70)),
                Switch(
                  key: const Key('address-no-apartment'),
                  value: !_isApartment,
                  onChanged: (bool v) => setState(() => _isApartment = !v),
                ),
              ],
            ),
            TextButton(
              key: const Key('address-notes-toggle'),
              onPressed: () => setState(() => _showNotes = !_showNotes),
              child: Text(l10n.locationNotes),
            ),
            if (_showNotes)
              TextField(
                key: const Key('address-notes'),
                controller: _notes,
                style: white,
                maxLines: 3,
                decoration: _decoration(l10n.enterNotesHere),
              ),
            const SizedBox(height: 20),
            if (showSubmit)
              FilledButton(
                key: const Key('address-submit'),
                onPressed: _busy ? null : _submit,
                child: _busy
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(l10n.inviteViewGetIn),
              ),
          ],
        ),
      ),
    );
  }
}
