/**
 * @format
 */

import 'react-native';
import React from 'react';
//import App from './src/App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

import {View, Text} from 'react-native';

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
