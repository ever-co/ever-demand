import 'dart:async';

import 'package:barcode_widget/barcode_widget.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:latlong2/latlong.dart';
import 'package:material_ui/material_ui.dart';

import '../../core/formatting.dart';
import '../../core/l10n.dart';
import '../../core/theme.dart';
import '../../data/models/enums.dart';
import '../../data/models/geo.dart';
import '../../data/models/order.dart';
import '../../data/store/app_store.dart';
import '../../providers.dart';

/// `e-cu-elapsed-time`: time since `startDate`, ticking every second, or the
/// frozen `endTime` once the delivery reached the customer.
class ElapsedTime extends ConsumerStatefulWidget {
  const ElapsedTime({super.key, this.frozen = false});

  /// Stop ticking (issue shown, order finished).
  final bool frozen;

  @override
  ConsumerState<ElapsedTime> createState() => _ElapsedTimeState();
}

class _ElapsedTimeState extends ConsumerState<ElapsedTime> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted && !widget.frozen) setState(() {});
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final AppStore store = ref.watch(appStoreProvider);
    final String text = store.endOrderTime ??
        formatElapsed(
          DateTime.now().difference(store.startOrderDate ?? DateTime.now()),
        );
    return Column(
      key: const Key('elapsed-time'),
      children: <Widget>[
        Text(
          context.l10n.buyPopupElapsedTimeTitle,
          style: const TextStyle(color: Colors.white70, fontSize: 12),
        ),
        Text(
          text,
          key: const Key('elapsed-time-value'),
          style: const TextStyle(color: Colors.white, fontSize: 24),
        ),
      ],
    );
  }
}

/// The three delivery steps: We / Carrier / You.
class DeliverySteps extends StatelessWidget {
  const DeliverySteps({super.key, required this.step, required this.cancelled});

  final DeliveryStep step;
  final bool cancelled;

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = context.l10n;
    Widget stepWidget(String label, FaIconData icon, DeliveryStep s, String key) {
      final bool active = step.index >= s.index;
      final bool current = step == s && !(s == DeliveryStep.warehouse && cancelled);
      final Color color = current
          ? EverColors.secondary
          : active
              ? Colors.white
              : Colors.white38;
      return Column(
        key: Key(key),
        children: <Widget>[
          Text(label, style: TextStyle(color: color)),
          const SizedBox(height: 4),
          FaIcon(icon, color: color, size: 22),
          if (current)
            const Icon(Icons.circle, size: 6, color: EverColors.secondary),
        ],
      );
    }

    Widget dots(DeliveryStep s) => Text(
          '..',
          style: TextStyle(
            color: step.index >= s.index ? Colors.white : Colors.white38,
            fontSize: 20,
          ),
        );

    return Row(
      key: const Key('delivery-steps'),
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: <Widget>[
        stepWidget(
          l10n.buyPopupDeliveryStatusWe,
          FontAwesomeIcons.building,
          DeliveryStep.warehouse,
          'step-warehouse',
        ),
        dots(DeliveryStep.carrier),
        stepWidget(
          l10n.buyPopupDeliveryStatusCarrier,
          FontAwesomeIcons.motorcycle,
          DeliveryStep.carrier,
          'step-carrier',
        ),
        dots(DeliveryStep.customer),
        stepWidget(
          l10n.buyPopupDeliveryStatusYou,
          FontAwesomeIcons.house,
          DeliveryStep.customer,
          'step-customer',
        ),
      ],
    );
  }
}

/// Order map: the customer and merchant markers (and the carrier while it is
/// on the way, with a line to the customer). The Ionic app draws Google
/// Maps directions; this uses OpenStreetMap tiles (no API key).
class OrderMap extends ConsumerWidget {
  const OrderMap({
    super.key,
    this.user,
    this.warehouse,
    this.carrier,
    this.height = 220,
  });

  final Loc? user;
  final Loc? warehouse;
  final Loc? carrier;
  final double height;

  static LatLng _ll(Loc l) => LatLng(l.lat, l.lng);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(appConfigProvider);
    final List<Loc> points = <Loc>[?user, ?warehouse, ?carrier];
    if (!config.mapsEnabled || points.isEmpty) {
      return SizedBox(height: height, key: const Key('order-map-placeholder'));
    }
    Marker marker(Loc l, FaIconData icon, Color color) => Marker(
          point: _ll(l),
          width: 36,
          height: 36,
          child: FaIcon(icon, color: color, size: 30),
        );
    final MapOptions options = points.length > 1
        ? MapOptions(
            initialCameraFit: CameraFit.bounds(
              bounds: LatLngBounds.fromPoints(points.map(_ll).toList()),
              padding: const EdgeInsets.all(48),
              maxZoom: 16,
            ),
          )
        : MapOptions(initialCenter: _ll(points.first), initialZoom: 15);
    return SizedBox(
      key: const Key('order-map'),
      height: height,
      child: FlutterMap(
        options: options,
        children: <Widget>[
          TileLayer(
            urlTemplate: config.mapTileUrl,
            userAgentPackageName: 'co.ever.shop_flutter_mobile',
          ),
          if (carrier != null && user != null)
            PolylineLayer(
              polylines: <Polyline>[
                Polyline(
                  points: <LatLng>[_ll(carrier!), _ll(user!)],
                  strokeWidth: 4,
                  color: EverColors.secondary,
                ),
              ],
            ),
          MarkerLayer(
            markers: <Marker>[
              if (warehouse != null)
                marker(warehouse!, FontAwesomeIcons.store, EverColors.primary),
              if (user != null)
                marker(user!, FontAwesomeIcons.house, EverColors.secondary),
              if (carrier != null)
                marker(carrier!, FontAwesomeIcons.motorcycle, EverColors.tertiary),
            ],
          ),
          // OpenStreetMap tile usage policy: attribution on the map.
          const Align(
            alignment: AlignmentDirectional.bottomEnd,
            child: ColoredBox(
              color: Color(0xAAFFFFFF),
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                child: Text(
                  '© OpenStreetMap contributors',
                  style: TextStyle(fontSize: 10, color: Colors.black87),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Takeaway order code: QR of the order id (default, or the merchant's
/// `orderBarcodeType` 0), else a 1-D barcode, plus `#ddMMyyyy-number`.
class OrderCode extends StatelessWidget {
  const OrderCode({super.key, required this.order, this.title});

  final Order order;
  final String? title;

  /// MSI and pharmacode have no Flutter encoder: they fall back to Code 128.
  static Barcode barcodeFor(int? type) => switch (type) {
        OrderBarcodeType.code39 => Barcode.code39(),
        OrderBarcodeType.code128 ||
        OrderBarcodeType.pharmacode ||
        OrderBarcodeType.msi =>
          Barcode.code128(),
        _ => Barcode.qrCode(),
      };

  @override
  Widget build(BuildContext context) {
    final int? type = order.warehouse?.orderBarcodeType;
    final Barcode barcode = barcodeFor(type);
    final bool qr = barcode.name == Barcode.qrCode().name;
    // Code 39 has no lower-case letters; Mongo ids are lower-case hex.
    final String data = type == OrderBarcodeType.code39
        ? order.id.toUpperCase()
        : order.id;
    return Column(
      key: const Key('order-code'),
      children: <Widget>[
        Container(
          color: Colors.white,
          padding: const EdgeInsets.all(12),
          child: BarcodeWidget(
            barcode: barcode,
            data: data,
            width: qr ? 180 : 260,
            height: qr ? 180 : 80,
            drawText: !qr,
            errorBuilder: (BuildContext context, String error) => BarcodeWidget(
              barcode: Barcode.qrCode(),
              data: order.id,
              width: 180,
              height: 180,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: <Widget>[
            if (title != null)
              Expanded(
                child: Text(title!, style: const TextStyle(color: Colors.white)),
              ),
            Text(
              '#${order.shortId ?? ''}',
              key: const Key('order-short-id'),
              style: const TextStyle(color: Colors.white),
            ),
          ],
        ),
      ],
    );
  }
}
