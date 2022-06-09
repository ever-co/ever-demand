class Device {
  final String? typename;
  final String id;
  final String? channelId;
  final String type;
  final String uuid;
  final String? language;

  const Device({
    this.typename,
    required this.id,
    this.channelId,
    required this.type,
    required this.uuid,
    this.language,
  });

  factory Device.fromJson(Map<String, dynamic> json) {
    return Device(
      typename: json['__typename'],
      id: json['_id'],
      channelId: json['channelId'],
      type: json['type'],
      uuid: json['uuid'],
      language: json['language'],
    );
  }
}
