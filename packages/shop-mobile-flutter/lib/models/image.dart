class Image {
  final String locale;
  final String url;
  final int width;
  final int height;
  final int orientation;

  const Image({
    required this.locale,
    required this.url,
    required this.width,
    required this.height,
    required this.orientation,
  });

  factory Image.fromJson(Map<String, dynamic> json) {
    return Image(
      locale: json['locale'],
      url: json['url'],
      width: json['width'],
      height: json['height'],
      orientation: json['orientation'],
    );
  }
}
