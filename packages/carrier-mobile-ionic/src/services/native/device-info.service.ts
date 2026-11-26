import { inject, Injectable } from '@angular/core';
import { DEVICE, IS_NATIVE_PLATFORM } from './plugins';

export interface DeviceDetails {
	/** `ios`, `android` or `web`. */
	platform: 'ios' | 'android' | 'web';
	/** Stable per-install identifier (replaces `device.uuid` and `cordova-plugin-uniquedeviceid`). */
	uuid: string;
}

/**
 * Device facts through `@capacitor/device` (replaces `@ionic-native/device` and
 * `@ionic-native/globalization`).
 */
@Injectable({ providedIn: 'root' })
export class DeviceInfoService {
	private readonly device = inject(DEVICE);
	readonly isNative = inject(IS_NATIVE_PLATFORM);

	async getDetails(): Promise<DeviceDetails> {
		const [info, id] = await Promise.all([
			this.device.getInfo(),
			this.device.getId(),
		]);
		return { platform: info.platform, uuid: id.identifier };
	}

	/** Two-letter language code of the device, for example `en`. */
	async getPreferredLanguage(): Promise<string | null> {
		try {
			return (await this.device.getLanguageCode()).value || null;
		} catch {
			return null;
		}
	}
}
