import 'package:material_ui/material_ui.dart';

/// Ionic colours of the shop app (docs/latest-stack/shop-mobile-features.md §8).
abstract final class EverColors {
  static const Color primary = Color(0xFF2A2C39);
  static const Color secondary = Color(0xFFBD4742);
  static const Color tertiary = Color(0xFF7044FF);
  static const Color success = Color(0xFF10DC60);
  static const Color warning = Color(0xFFFFCE00);
  static const Color danger = Color(0xFFF04141);
  static const Color dark = Color(0xFF222428);
  static const Color medium = Color(0xFF989AA2);
  static const Color light = Color(0xFFF4F5F8);
  static const Color brandDark = Color(0xFF252836);
  static const Color brandLight = Color(0xFF2F3241);
}

ThemeData buildTheme() {
  final ColorScheme scheme = ColorScheme.fromSeed(
    seedColor: EverColors.primary,
    primary: EverColors.primary,
    secondary: EverColors.secondary,
    tertiary: EverColors.tertiary,
    error: EverColors.danger,
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: EverColors.light,
    appBarTheme: const AppBarTheme(
      backgroundColor: EverColors.primary,
      foregroundColor: Colors.white,
      centerTitle: true,
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: EverColors.secondary,
        foregroundColor: Colors.white,
        minimumSize: const Size(64, 44),
      ),
    ),
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith(
        (Set<WidgetState> s) =>
            s.contains(WidgetState.selected) ? EverColors.secondary : null,
      ),
    ),
  );
}
