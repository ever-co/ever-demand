import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../core/l10n.dart';
import '../../core/theme.dart';
import '../../data/store/app_store.dart';
import '../../providers.dart';
import '../../routing/app_router.dart';
import '../../services/invite_service.dart';
import '../../widgets/common.dart';

/// Invite by code (`/invite/by-code`): a 4-digit code submits on its own.
class InviteByCodeScreen extends ConsumerStatefulWidget {
  const InviteByCodeScreen({super.key});

  @override
  ConsumerState<InviteByCodeScreen> createState() => _InviteByCodeScreenState();
}

class _InviteByCodeScreenState extends ConsumerState<InviteByCodeScreen> {
  final TextEditingController _code = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  Future<void> _onChanged(String value) async {
    final int? code = int.tryParse(value);
    if (code == null || code < 1000 || code > 9999 || _busy) return;
    _code.clear();
    setState(() => _busy = true);
    final InviteOutcome outcome =
        await ref.read(inviteServiceProvider).submitCode(code);
    if (!mounted) return;
    setState(() => _busy = false);
    switch (outcome) {
      case InviteRegistered(:final String location):
        context.go(location);
      case InviteWrongCode():
        await showAppAlert(context, context.l10n.wrongCode);
      case InviteFailed(:final Object error):
        debugPrint('Invite by code failed: $error');
        await showAppAlert(context, context.l10n.inviteViewNotInvitedByCodeTitle);
      case InviteInfoMissing() || InviteRequested():
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    final AppStore store = ref.watch(appStoreProvider);
    final bool invited = store.inviteRequestId != null;
    final String? address = store.inviteAddress;

    return Scaffold(
      key: const Key('invite-by-code-screen'),
      backgroundColor: EverColors.primary,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: <Widget>[
            const SizedBox(height: 24),
            const AppImage(
              'assets/imgs/ever-logo.svg',
              height: 90,
              fit: BoxFit.contain,
            ),
            const SizedBox(height: 12),
            Text(
              l10n.inviteViewByCodeLogoDetails,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white70),
            ),
            const SizedBox(height: 40),
            if (!invited) ...<Widget>[
              FilledButton(
                key: const Key('invite-by-address'),
                onPressed: () => context.go(Routes.inviteByLocation),
                child: Text(l10n.inviteViewGetInByAddress),
              ),
              const SizedBox(height: 12),
              // Social sign-in buttons have no action in the Ionic app.
              const Row(
                children: <Widget>[
                  Expanded(child: _SocialButton(FontAwesomeIcons.facebookF)),
                  SizedBox(width: 12),
                  Expanded(child: _SocialButton(FontAwesomeIcons.google)),
                ],
              ),
              const SizedBox(height: 16),
              Text.rich(
                TextSpan(
                  text: '${l10n.orLowercase} ',
                  children: <InlineSpan>[
                    TextSpan(
                      text: l10n.inviteViewByCodeOrWhat,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white70),
              ),
            ] else ...<Widget>[
              if (address != null) ...<Widget>[
                Text(
                  l10n.inviteViewInvitedTextTitle,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Color(0xFFCCCCCC), fontSize: 20),
                ),
                const SizedBox(height: 8),
                Text(
                  l10n.inviteViewInvitedTextDetails,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Color(0xFF888888)),
                ),
                const SizedBox(height: 8),
                Text(
                  address,
                  key: const Key('invite-address'),
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Color(0xFFBBBBBB), fontSize: 18),
                ),
                const SizedBox(height: 16),
              ],
              Text(
                l10n.inviteViewByCodeInvited,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white70),
              ),
            ],
            const SizedBox(height: 16),
            TextField(
              key: const Key('invite-code-input'),
              controller: _code,
              enabled: !_busy,
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              maxLength: 4,
              inputFormatters: <TextInputFormatter>[
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(4),
              ],
              style: const TextStyle(color: Colors.white, fontSize: 28, letterSpacing: 8),
              decoration: InputDecoration(
                counterText: '',
                hintText: l10n.inviteViewByCodeInviteCode,
                hintStyle: const TextStyle(color: Colors.white38, letterSpacing: 1),
                enabledBorder: const UnderlineInputBorder(
                  borderSide: BorderSide(color: Colors.white38),
                ),
              ),
              onChanged: _onChanged,
            ),
            if (_busy)
              const Padding(
                padding: EdgeInsets.only(top: 16),
                child: LoadingView(color: Colors.white),
              ),
          ],
        ),
      ),
    );
  }
}

class _SocialButton extends StatelessWidget {
  const _SocialButton(this.icon);

  final FaIconData icon;

  @override
  Widget build(BuildContext context) => OutlinedButton(
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.white,
          side: const BorderSide(color: Colors.white38),
        ),
        onPressed: null,
        child: FaIcon(icon, size: 18, color: Colors.white54),
      );
}
