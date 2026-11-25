/**
 * Takeaway order code (Ionic `e-cu-order-takeaway-info-order-info`): a QR code of the order id
 * (default) or a 1-D barcode in the merchant's `orderBarcodeType`, plus the short order number.
 */
import JsBarcode from 'jsbarcode';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Rect } from 'react-native-svg';
import { env } from '../config/env';
import { OrderBarcodeTypes } from '../domain/enums';
import { getIdFromTheDate, orderWarehouse } from '../domain/order';
import { pickTranslation } from '../domain/product';
import type { Order } from '../domain/types';
import { useLanguage } from '../hooks/useLanguage';
import { colors } from '../theme';

const FORMATS: Record<number, string> = {
	[OrderBarcodeTypes.CODE128]: 'CODE128',
	[OrderBarcodeTypes.CODE39]: 'CODE39',
	[OrderBarcodeTypes.pharmacode]: 'pharmacode',
	[OrderBarcodeTypes.MSI]: 'MSI',
};

/** The bars of a 1-D barcode as `0`/`1` strings (jsbarcode's object renderer), or null. */
export function barcodeBars(value: string, format: string): string | null {
	try {
		const target: { encodings?: Array<{ data: string }> } = {};
		JsBarcode(target, value, { format });
		return target.encodings?.map((e) => e.data).join('') ?? null;
	} catch {
		return null;
	}
}

function Barcode({ value, format, barWidth }: { value: string; format: string; barWidth: number }) {
	const bars = useMemo(() => barcodeBars(value, format), [format, value]);
	if (!bars) {
		return null;
	}
	const unit = barWidth * 2;
	const height = 60;
	return (
		<View style={styles.barcode} testID='order-barcode'>
			<Svg width={bars.length * unit} height={height}>
				{bars.split('').map((bit, i) =>
					bit === '1' ? <Rect key={i} x={i * unit} y={0} width={unit} height={height} fill={colors.black} /> : null,
				)}
			</Svg>
			<Text style={styles.barcodeText}>{value}</Text>
		</View>
	);
}

export function OrderCode({ order, lessInfo = false }: { order: Order; lessInfo?: boolean }) {
	const language = useLanguage();
	const type = orderWarehouse(order)?.orderBarcodeType;
	const format = type != null && type !== OrderBarcodeTypes.QR ? FORMATS[type] : undefined;

	let shortId: string | null = null;
	try {
		shortId = getIdFromTheDate(order);
	} catch {
		shortId = null;
	}

	return (
		<View style={styles.container} testID='order-code'>
			<View style={styles.code}>
				{format ? (
					<Barcode value={order.id} format={format} barWidth={type === OrderBarcodeTypes.CODE39 ? 0.5 : 0.7} />
				) : (
					<View testID='order-qr-code'>
						<QRCode value={order.id} size={160} backgroundColor={colors.white} />
					</View>
				)}
			</View>
			<View style={styles.info}>
				{!lessInfo && (
					<Text style={styles.left}>
						{pickTranslation(order.products[0]?.product?.title, language, env.DEFAULT_LANGUAGE)}
					</Text>
				)}
				<Text style={lessInfo ? styles.centered : styles.right} testID='order-short-id'>
					#{shortId}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { alignItems: 'center', padding: 8 },
	code: { backgroundColor: colors.white, padding: 10, borderRadius: 4 },
	barcode: { alignItems: 'center' },
	barcodeText: { color: colors.black, fontSize: 16, marginTop: 4 },
	info: { flexDirection: 'row', width: '100%', marginTop: 6 },
	left: { color: colors.light, flex: 7 },
	right: { color: colors.light, flex: 5, textAlign: 'right' },
	centered: { color: colors.light, flex: 1, textAlign: 'center' },
});
