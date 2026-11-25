import 'dart:ui';

/// The six app languages, in the order of the language page.
const List<String> appLanguages = <String>[
  'en-US',
  'bg-BG',
  'he-IL',
  'ru-RU',
  'es-ES',
  'fr-FR',
];

const Map<String, String> _byPrefix = <String, String>{
  'he': 'he-IL',
  'ru': 'ru-RU',
  'bg': 'bg-BG',
  'en': 'en-US',
  'es': 'es-ES',
  'fr': 'fr-FR',
};

/// Start language: the saved `_language`, else DEFAULT_LANGUAGE when set,
/// else the device language mapped by its 2-letter prefix, else `en-US`.
/// (The Ionic app lets DEFAULT_LANGUAGE win over the saved one; fleet task
/// T-2805 fixes that, and this follows the fixed order.)
String resolveStartLanguage({
  String? saved,
  String? defaultLanguage,
  Locale? deviceLocale,
}) {
  if (saved != null && appLanguages.contains(saved)) return saved;
  if (defaultLanguage != null && appLanguages.contains(defaultLanguage)) {
    return defaultLanguage;
  }
  final String? prefix = deviceLocale?.languageCode;
  return _byPrefix[prefix] ?? 'en-US';
}

/// `en-US` → `Locale('en', 'US')`.
Locale localeOf(String language) {
  final List<String> parts = language.split('-');
  return parts.length > 1 ? Locale(parts[0], parts[1]) : Locale(parts[0]);
}

bool isRtl(String language) => language == 'he-IL';
