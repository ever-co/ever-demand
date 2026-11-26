import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

// Replaces phonegap-plugin-barcodescanner with the maintained ML Kit plugin.
// Resolves with the text of the first barcode, or null when the customer
// closed the scanner. Rejects where scanning is not available (a browser).
export async function scanBarcode(): Promise<string | null> {
	if (!Capacitor.isNativePlatform()) {
		throw new Error('Barcode scanning needs the mobile app');
	}

	const { supported } = await BarcodeScanner.isSupported();

	if (!supported) {
		throw new Error('Barcode scanning is not supported on this device');
	}

	const { camera } = await BarcodeScanner.requestPermissions();

	if (camera !== 'granted' && camera !== 'limited') {
		throw new Error('Camera permission was denied');
	}

	if (Capacitor.getPlatform() === 'android') {
		const { available } =
			await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();

		if (!available) {
			await BarcodeScanner.installGoogleBarcodeScannerModule();
		}
	}

	const { barcodes } = await BarcodeScanner.scan();

	return barcodes.length > 0 ? (barcodes[0].rawValue ?? null) : null;
}
