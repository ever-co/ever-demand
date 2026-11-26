import '../data/models/product.dart';

/// `ProductLocalesService.getTranslate`: the member whose locale starts with
/// [language], else with [fallbackLanguage] (`en-US`), else the first one.
/// Images use their `url` as the value.
String localeValue(
  List<LocaleMember> members,
  String language, {
  String fallbackLanguage = 'en-US',
}) {
  if (members.isEmpty) return '';
  for (final LocaleMember m in members) {
    if (m.locale.startsWith(language)) return m.value;
  }
  for (final LocaleMember m in members) {
    if (m.locale.startsWith(fallbackLanguage)) return m.value;
  }
  return members.first.value;
}

/// The locale-picked image URL of a product.
String productImageUrl(Product product, String language) =>
    localeValue(product.imageMembers, language);

/// `shortenDescription`: texts at or over [max] characters end with "...".
String shorten(String text, int max) =>
    text.length < max ? text : '${text.substring(0, max - 3)}...';
