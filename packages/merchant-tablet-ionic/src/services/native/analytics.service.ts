import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IS_NATIVE_PLATFORM } from './plugins';

interface MixpanelLike {
	init(token: string): unknown;
	track(event: string): void;
}

/**
 * Google Analytics (gtag.js) and Mixpanel (`mixpanel-browser`, the official JS SDK) replace
 * `cordova-plugin-google-analytics` and `cordova-plugin-mixpanel`.
 *
 * As before, tracking only runs inside the native app (the Cordova plugins did nothing in
 * the browser) and only when the matching key is configured.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
	private mixpanel: MixpanelLike | null = null;
	private started = false;

	readonly enabled = inject(IS_NATIVE_PLATFORM);

	async start(): Promise<void> {
		if (this.started || !this.enabled) {
			return;
		}
		this.started = true;

		const gaKey = environment.GOOGLE_ANALYTICS_API_KEY;
		if (gaKey) {
			this.startGoogleAnalytics(gaKey);
		}

		const mixpanelKey = environment.MIXPANEL_API_KEY;
		if (mixpanelKey) {
			try {
				const { default: mixpanel } = await import('mixpanel-browser');
				mixpanel.init(mixpanelKey);
				this.mixpanel = mixpanel;
				this.track('App Booted');
			} catch (error) {
				console.warn('Mixpanel could not start', error);
			}
		}
	}

	track(event: string): void {
		this.mixpanel?.track(event);
	}

	private startGoogleAnalytics(measurementId: string) {
		const w = window as any;
		w.dataLayer = w.dataLayer || [];
		w.gtag =
			w.gtag ||
			function gtag() {
				// gtag.js reads the `arguments` object, not an array.
				// eslint-disable-next-line prefer-rest-params
				w.dataLayer.push(arguments);
			};
		w.gtag('js', new Date());
		w.gtag('config', measurementId);

		const script = document.createElement('script');
		script.async = true;
		script.src =
			'https://www.googletagmanager.com/gtag/js?id=' +
			encodeURIComponent(measurementId);
		document.head.appendChild(script);
	}
}
