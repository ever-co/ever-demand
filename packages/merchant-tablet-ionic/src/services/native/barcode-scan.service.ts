import { inject, Injectable } from '@angular/core';
import { BARCODE_SCANNER } from './plugins';

/** Same shape as the old `@ionic-native/barcode-scanner` result. */
export interface BarcodeScanResult {
	text: string;
	cancelled: boolean;
}

/**
 * QR / barcode scanning through `@capacitor-mlkit/barcode-scanning` (Google ML Kit, the
 * maintained Capacitor scanner) instead of `phonegap-plugin-barcodescanner`.
 */
@Injectable({ providedIn: 'root' })
export class BarcodeScanService {
	private readonly scanner = inject(BARCODE_SCANNER);

	async isSupported(): Promise<boolean> {
		try {
			return (await this.scanner.isSupported()).supported;
		} catch {
			return false;
		}
	}

	async scan(): Promise<BarcodeScanResult> {
		if (!(await this.isSupported())) {
			throw new Error('Barcode scanning is not supported on this device');
		}
		const permission = await this.scanner.requestPermissions();
		if (permission.camera !== 'granted' && permission.camera !== 'limited') {
			throw new Error('Camera permission denied');
		}
		try {
			const { barcodes } = await this.scanner.scan();
			const first = barcodes[0];
			return first
				? { text: first.rawValue ?? first.displayValue, cancelled: false }
				: { text: '', cancelled: true };
		} catch {
			return { text: '', cancelled: true };
		}
	}
}
