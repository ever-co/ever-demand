/**
 * @format
 */

import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
// Note: test renderer must be required after react-native.
import { View, Text } from 'react-native';

//  COMPONENTS
// import App from './src/App';

export default function App() {
	return (
		<View>
			<Text>hi</Text>
		</View>
	);
}

describe('Demo', function () {
	it('should renders correctly', () => {
		renderer.create(<App />);
	});
});
