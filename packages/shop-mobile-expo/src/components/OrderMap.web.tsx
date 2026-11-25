/**
 * Order map (web): react-native-maps has no web version, so the web build lists the points and
 * links to OpenStreetMap (directions when there are two points).
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme';
import { directionsUrl, pointUrl, type MapPointKind, type OrderMapProps } from './OrderMap.types';

const LABEL: Record<MapPointKind, string> = {
	customer: 'EXPO.MAP.CUSTOMER',
	store: 'EXPO.MAP.STORE',
	carrier: 'EXPO.MAP.CARRIER',
};

export function OrderMap({ points, route = false, height = 160 }: OrderMapProps) {
	const { t } = useTranslation();
	if (points.length === 0) {
		return <View style={[styles.container, { height }]} testID='order-map' />;
	}
	const url = route && points.length > 1 ? directionsUrl(points[0].coords, points[1].coords) : pointUrl(points[0].coords);
	return (
		<View style={[styles.container, { minHeight: height }]} testID='order-map'>
			{points.map((point) => (
				<View key={point.kind} style={styles.row}>
					<MaterialCommunityIcons name='map-marker' size={18} color={colors.secondary} />
					<Text style={styles.text}>
						{t(LABEL[point.kind])}: {point.coords.latitude.toFixed(5)}, {point.coords.longitude.toFixed(5)}
					</Text>
				</View>
			))}
			<Pressable onPress={() => void Linking.openURL(url)} style={styles.link} testID='open-in-maps'>
				<Text style={styles.linkText}>{t('EXPO.MAP.OPEN_IN_MAPS')}</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { width: '100%', padding: 12, backgroundColor: colors.dark, justifyContent: 'center', gap: 6 },
	row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	text: { color: colors.light },
	link: { marginTop: 6 },
	linkText: { color: colors.secondary, textDecorationLine: 'underline' },
});
