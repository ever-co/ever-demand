/* Native modules have no implementation under Jest: replace them with their official mocks. */
/* eslint-disable @typescript-eslint/no-require-imports */
import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
	require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@react-native-community/netinfo', () => require('@react-native-community/netinfo/jest/netinfo-mock'));

// Reanimated 4 only animates the drawer; its Jest mock needs native modules, so the drawer is replaced.
// Gesture handler loads Reanimated only when it can: make it unavailable.
jest.mock('react-native-reanimated', () => {
	throw new Error('Reanimated is not available under Jest');
});
jest.mock('@react-navigation/drawer', () => require('./src/test/drawerMock'));

jest.mock('expo-location', () => ({
	Accuracy: { High: 4 },
	requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'denied' })),
	getCurrentPositionAsync: jest.fn(async () => {
		throw new Error('no location in tests');
	}),
}));

jest.mock('expo-camera', () => {
	const { View } = require('react-native');
	return {
		CameraView: (props: object) => require('react').createElement(View, { ...props, testID: 'camera-view' }),
		useCameraPermissions: () => [{ granted: false, canAskAgain: false }, jest.fn()],
	};
});

jest.mock('react-native-maps', () => {
	const React = require('react');
	const { View } = require('react-native');
	const MapView = React.forwardRef((props: object, ref: unknown) =>
		React.createElement(View, { ...props, ref, testID: 'map-view' }),
	);
	const Marker = (props: object) => React.createElement(View, { ...props, testID: 'map-marker' });
	const Polyline = (props: object) => React.createElement(View, { ...props, testID: 'map-polyline' });
	return { __esModule: true, default: MapView, Marker, Polyline };
});

jest.mock('react-native-webview', () => {
	const React = require('react');
	const { Text } = require('react-native');
	return {
		WebView: ({ source }: { source: { html: string } }) =>
			React.createElement(
				Text,
				{ testID: 'webview-html' },
				(source.html.match(/<body>([\s\S]*)<\/body>/)?.[1] ?? source.html).replace(/<[^>]+>/g, ' ').trim(),
			),
	};
});

jest.mock('@stripe/stripe-react-native', () => {
	const React = require('react');
	const { View } = require('react-native');
	return {
		StripeProvider: ({ children }: { children: unknown }) => children,
		CardField: (props: { onCardChange?: (d: { complete: boolean }) => void }) =>
			React.createElement(View, { testID: 'card-field', onCardChange: props.onCardChange }),
		createToken: jest.fn(async () => ({ token: { id: 'tok_test' } })),
	};
});

// The native provider renders nothing until the device reports its insets.
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

jest.mock('expo-splash-screen', () => ({
	preventAutoHideAsync: jest.fn(async () => true),
	hideAsync: jest.fn(async () => true),
}));
