import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {}

const InStoreScreen: React.FC<Props> = ({}) => {
	const STYLES = StyleSheet.create({
		main: {},
	});

	return (
		<View style={STYLES.main}>
			<Text>InStore.screen</Text>
		</View>
	);
};

export default InStoreScreen;
