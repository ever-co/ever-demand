// Converts the Ionic shop app translations (ngx-translate JSON) into the ARB
// files this app uses, so both apps show the same texts.
//
//   dart run tool/ionic_i18n_to_arb.dart [path/to/shop-mobile-ionic/src/assets/i18n]
//
// Key rule: the dotted ngx-translate path becomes lowerCamelCase, array items
// keep their index: `BUY_POPUP.STATUSES.0.TITLE` -> `buyPopupStatuses0Title`.
// Placeholders: `%t` -> `{time}`, `%s` -> `{amount}`, `{{amount}}` -> `{amount}`.
// Keys listed in [_extraEnglish] are app-only strings (Flutter UI needs a few
// labels the Ionic app hard-coded); they are added to the English template.
import 'dart:convert';
import 'dart:io';

const Map<String, String> _languages = <String, String>{
  'en-US': 'en',
  'bg-BG': 'bg',
  'es-ES': 'es',
  'fr-FR': 'fr',
  'he-IL': 'he',
  'ru-RU': 'ru',
};

/// Strings the Ionic app has as literals in templates or code.
const Map<String, String> _extraEnglish = <String, String>{
  'orderInfoModalTitle': 'Order Info',
  'orderInfoModalConfirm': 'Confirm',
  'orderInfoModalAddMore': 'Add More',
  'wrongCode': 'Wrong code!',
  'cardEmailLabel': 'Email',
  'cardEmailInvalid': 'Enter a valid email',
  'cardNoKey': "Card payments are not set up in this app.",
  'country': 'Country',
  'noApartment': 'No apartment',
  'retry': 'Retry',
  'comment': 'Comment',
  'remove': 'Remove',
  'save': 'Save',
};

void main(List<String> args) {
  final String source = args.isNotEmpty
      ? args.first
      : '../shop-mobile-ionic/src/assets/i18n';
  final Map<String, Map<String, String>> byLocale =
      <String, Map<String, String>>{};

  for (final MapEntry<String, String> lang in _languages.entries) {
    final File file = File('$source/${lang.key}.json');
    final Object? json = jsonDecode(file.readAsStringSync());
    final Map<String, String> flat = <String, String>{};
    _flatten(json, <String>[], flat);
    byLocale[lang.value] = flat;
  }

  final Map<String, String> english = byLocale['en']!;
  for (final MapEntry<String, Map<String, String>> entry in byLocale.entries) {
    final String locale = entry.key;
    final Map<String, Object> arb = <String, Object>{'@@locale': locale};
    final Iterable<String> keys = locale == 'en'
        ? english.keys
        : english.keys.where(entry.value.containsKey);
    for (final String key in keys) {
      final String message = _convert(entry.value[key]!);
      arb[key] = message;
      if (locale == 'en') {
        final List<String> placeholders = RegExp(r'\{(\w+)\}')
            .allMatches(message)
            .map((Match m) => m.group(1)!)
            .toSet()
            .toList();
        arb['@$key'] = <String, Object>{
          'description': 'Ionic key ${_ionicKeyOf[key]}',
          if (placeholders.isNotEmpty)
            'placeholders': <String, Object>{
              for (final String p in placeholders)
                p: <String, String>{'type': 'String'},
            },
        };
      }
    }
    if (locale == 'en') {
      for (final MapEntry<String, String> extra in _extraEnglish.entries) {
        arb[extra.key] = extra.value;
        arb['@${extra.key}'] = <String, String>{
          'description': 'App string (not in the Ionic JSON)',
        };
      }
    }
    final File out = File('lib/l10n/app_$locale.arb');
    out.writeAsStringSync(
      '${const JsonEncoder.withIndent('  ').convert(arb)}\n',
    );
    stdout.writeln('${out.path}: ${keys.length} messages');
  }
}

final Map<String, String> _ionicKeyOf = <String, String>{};

void _flatten(Object? node, List<String> path, Map<String, String> out) {
  if (node is Map<String, Object?>) {
    node.forEach((String k, Object? v) => _flatten(v, <String>[...path, k], out));
  } else if (node is List<Object?>) {
    for (int i = 0; i < node.length; i++) {
      _flatten(node[i], <String>[...path, '$i'], out);
    }
  } else if (node is String) {
    final String key = _camel(path);
    _ionicKeyOf[key] = path.join('.');
    out[key] = node;
  }
}

String _camel(List<String> path) {
  final List<String> words = <String>[
    for (final String segment in path)
      ...segment.split('_').where((String w) => w.isNotEmpty),
  ];
  final StringBuffer b = StringBuffer();
  for (int i = 0; i < words.length; i++) {
    final String w = words[i].toLowerCase();
    b.write(i == 0 ? w : '${w[0].toUpperCase()}${w.substring(1)}');
  }
  return b.toString();
}

// `{{param}}` keeps its name; a translated (non-ASCII) name, as in the
// Bulgarian `{{ сума }}`, becomes `{amount}`, the only interpolated value.
String _convert(String message) => message
    .replaceAll('%t', '{time}')
    .replaceAll('%s', '{amount}')
    .replaceAllMapped(RegExp(r'\{\{\s*([^}\s]+)\s*\}\}'), (Match m) {
      final String name = m[1]!;
      return RegExp(r'^[A-Za-z_]\w*$').hasMatch(name) ? '{$name}' : '{amount}';
    });
