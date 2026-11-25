/** Store code scanner for the merchants page "Scan" button (Cordova BarcodeScanner before). */
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Modal, Portal } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme';

export function QrScanner({ onScanned, onClose }: { onScanned: (text: string) => void; onClose: () => void }) {
	const { t } = useTranslation();
	const [permission, requestPermission] = useCameraPermissions();
	const done = useRef(false);

	useEffect(() => {
		if (permission && !permission.granted && permission.canAskAgain) {
			void requestPermission();
		}
	}, [permission, requestPermission]);

	return (
		<Portal>
			<Modal visible onDismiss={onClose} contentContainerStyle={styles.container} testID='qr-scanner'>
				{permission?.granted ? (
					<CameraView
						style={styles.camera}
						facing='back'
						barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
						onBarcodeScanned={({ data }) => {
							if (!done.current && data) {
								done.current = true;
								onScanned(data);
							}
						}}
					/>
				) : (
					<View style={styles.message}>
						<Text style={styles.text}>{t('EXPO.SCAN.NO_PERMISSION')}</Text>
					</View>
				)}
				<Button mode='contained' onPress={onClose} style={styles.close} testID='qr-scanner-close'>
					{t('CLOSE')}
				</Button>
			</Modal>
		</Portal>
	);
}

const styles = StyleSheet.create({
	container: { backgroundColor: colors.black, margin: 16, borderRadius: 6, overflow: 'hidden' },
	camera: { width: '100%', height: 360 },
	message: { padding: 24 },
	text: { color: colors.light, textAlign: 'center' },
	close: { margin: 12 },
});
