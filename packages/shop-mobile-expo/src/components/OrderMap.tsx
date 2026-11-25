/**
 * Order map (native): customer, store and carrier markers fitted to the screen, and a line between
 * the first two points. The Ionic app drew Google driving directions; this draws the straight line
 * (directions need a Google Directions key, see docs/latest-stack/shop-mobile-expo.md).
 */
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { env } from '../config/env';
import { colors } from '../theme';
import type { MapPointKind, OrderMapProps } from './OrderMap.types';

const PIN: Record<MapPointKind, string> = {
	customer: colors.secondary,
	store: colors.tertiary,
	carrier: colors.success,
};

export function OrderMap({ points, route = false, height = 240 }: OrderMapProps) {
	const map = useRef<MapView>(null);
	const center = points[0]?.coords ?? {
		latitude: env.DEFAULT_LATITUDE ?? 42.6459136,
		longitude: env.DEFAULT_LONGITUDE ?? 23.3332736,
	};

	return (
		<View style={[styles.container, { height }]} testID='order-map'>
			<MapView
				ref={map}
				style={StyleSheet.absoluteFill}
				initialRegion={{ ...center, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
				onMapReady={() => {
					if (points.length > 1) {
						map.current?.fitToCoordinates(
							points.map((p) => p.coords),
							{ edgePadding: { top: 40, right: 40, bottom: 40, left: 40 }, animated: false },
						);
					}
				}}>
				{points.map((point) => (
					<Marker key={point.kind} coordinate={point.coords} pinColor={PIN[point.kind]} />
				))}
				{route && points.length > 1 && (
					<Polyline coordinates={[points[0].coords, points[1].coords]} strokeColor={colors.secondary} strokeWidth={3} />
				)}
			</MapView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { width: '100%', overflow: 'hidden', backgroundColor: colors.dark },
});
