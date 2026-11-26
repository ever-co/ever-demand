import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_widget_from_html_core/flutter_widget_from_html_core.dart';
import 'package:material_ui/material_ui.dart';

import '../core/l10n.dart';
import '../core/theme.dart';

/// `alert(message)` of the Ionic app.
Future<void> showAppAlert(BuildContext context, String message) =>
    showDialog<void>(
      context: context,
      builder: (BuildContext context) => AlertDialog(
        content: Text(message),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(context.l10n.ok),
          ),
        ],
      ),
    );

/// A network image (or a bundled asset for `assets/...` paths, as the Ionic
/// env logos are), with a neutral box while loading or on error.
class AppImage extends StatelessWidget {
  const AppImage(
    this.src, {
    super.key,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
  });

  final String src;
  final BoxFit fit;
  final double? width;
  final double? height;

  @override
  Widget build(BuildContext context) {
    final Widget placeholder = SizedBox(
      width: width,
      height: height,
      child: const ColoredBox(color: Color(0x22000000)),
    );
    if (src.isEmpty) return placeholder;
    if (src.startsWith('assets/')) {
      if (src.endsWith('.svg')) {
        return SvgPicture.asset(src, width: width, height: height, fit: fit);
      }
      return Image.asset(src, width: width, height: height, fit: fit);
    }
    return Image.network(
      src,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (_, _, _) => placeholder,
      loadingBuilder: (_, Widget child, ImageChunkEvent? progress) =>
          progress == null ? child : placeholder,
    );
  }
}

/// Merchant logo in a circle (`e-cu-warehouse-logo`).
class WarehouseLogo extends StatelessWidget {
  const WarehouseLogo(this.logo, {super.key, this.size = 44, this.light = false});

  final String logo;
  final double size;
  final bool light;

  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: light ? Colors.white : EverColors.light,
          border: Border.all(color: Colors.white24),
        ),
        clipBehavior: Clip.antiAlias,
        child: AppImage(logo, width: size, height: size),
      );
}

/// Server HTML (info pages, maintenance message, product placeholder).
class HtmlView extends StatelessWidget {
  const HtmlView(this.html, {super.key, this.textStyle});

  final String html;
  final TextStyle? textStyle;

  @override
  Widget build(BuildContext context) => HtmlWidget(html, textStyle: textStyle);
}

/// A full-width centered spinner.
class LoadingView extends StatelessWidget {
  const LoadingView({super.key, this.color});

  final Color? color;

  @override
  Widget build(BuildContext context) => Center(
        child: CircularProgressIndicator(color: color),
      );
}

/// AppBar "Back" action as on the Ionic headers (chevron + `BACK`).
class BackTextButton extends StatelessWidget {
  const BackTextButton({super.key, required this.onPressed, this.label});

  final VoidCallback onPressed;
  final String? label;

  @override
  Widget build(BuildContext context) => TextButton.icon(
        style: TextButton.styleFrom(foregroundColor: Colors.white),
        onPressed: onPressed,
        icon: const Icon(Icons.chevron_left),
        label: Text(label ?? context.l10n.back),
      );
}
