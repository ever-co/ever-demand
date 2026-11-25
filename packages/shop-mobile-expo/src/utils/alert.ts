import { Alert, Platform } from 'react-native';

/**
 * Shows a message to the customer (the Ionic `alert(...)`). React Native Web's `Alert.alert` does
 * nothing, so the web build uses the browser alert.
 */
export function notify(message: string): void {
	if (Platform.OS === 'web') {
		if (typeof window !== 'undefined' && typeof window.alert === 'function') {
			window.alert(message);
		}
		return;
	}
	Alert.alert('', message);
}
