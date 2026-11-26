import { inject, Injectable } from '@angular/core';
import { LOCAL_NOTIFICATIONS } from './plugins';

export interface LocalNotificationRequest {
	id: number;
	title: string;
	text: string;
}

/**
 * Local notifications through `@capacitor/local-notifications` (replaces
 * `@ionic-native/local-notifications` + `cordova-plugin-local-notification`).
 * It asks for the permission when needed and never throws: a notification is a nice-to-have.
 */
@Injectable({ providedIn: 'root' })
export class LocalNotificationService {
	private readonly notifications = inject(LOCAL_NOTIFICATIONS);

	async schedule(request: LocalNotificationRequest): Promise<boolean> {
		try {
			let permission = await this.notifications.checkPermissions();
			if (permission.display !== 'granted') {
				permission = await this.notifications.requestPermissions();
			}
			if (permission.display !== 'granted') {
				return false;
			}
			await this.notifications.schedule({
				notifications: [
					{ id: request.id, title: request.title, body: request.text },
				],
			});
			return true;
		} catch (error) {
			console.warn('Local notification failed', error);
			return false;
		}
	}
}
