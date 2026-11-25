// Replaces the Cordova CallNumber plugin. A `tel:` link opens the dialer:
// Capacitor hands non-web URLs to the OS on Android and iOS, and a mobile
// browser does the same.
export function callNumber(phone: string, doc: Document = document): void {
	const number = `${phone ?? ''}`.trim();

	if (!number) {
		throw new Error('No phone number to call');
	}

	const link = doc.createElement('a');
	link.href = `tel:${number.replace(/[^\d+*#,;]/g, '')}`;
	link.rel = 'noopener';
	link.click();
}
