import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// STYLES
import { GLOBAL_STYLE as GS } from '../../assets/ts/styles';

const styles = StyleSheet.create({
	container: {
		...GS.screenStatic,
		...GS.w100,
		...GS.bgLight,
	},
});

const ProductItem = ({}) => {
	return (
		<View style={styles.container}>
			<Text>ProductItem</Text>
		</View>
	);
};

export default ProductItem;
