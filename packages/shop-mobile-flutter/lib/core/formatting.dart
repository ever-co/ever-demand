/// `e-cu-elapsed-time`: `mm : ss`, or `h : mm : ss` from one hour.
String formatElapsed(Duration d) {
  final int totalSeconds = d.inSeconds < 0 ? 0 : d.inSeconds;
  final int hours = totalSeconds ~/ 3600;
  final int minutes = (totalSeconds % 3600) ~/ 60;
  final int seconds = totalSeconds % 60;
  String two(int v) => v.toString().padLeft(2, '0');
  final String h = hours < 1 ? '' : '$hours : ';
  return '$h${two(minutes)} : ${two(seconds)}';
}

/// Order card delivery time: "m:ss min" between created and delivered.
String? formatDeliveryTime(DateTime? createdAt, DateTime? deliveredAt) {
  if (createdAt == null || deliveredAt == null) return null;
  final int ms = deliveredAt.difference(createdAt).inMilliseconds;
  final int minutes = ms ~/ 60000;
  final int seconds = ((ms % 60000) / 1000).round();
  return '$minutes:${seconds < 10 ? '0' : ''}$seconds min';
}

/// A price as the Ionic templates print a JS number: `12`, `12.5`.
String formatPrice(double value) => value == value.roundToDouble()
    ? value.toInt().toString()
    : value.toString();
