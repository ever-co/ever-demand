import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// STORE
import { useAppSelector } from '../../store/hooks';
import { getLanguage } from '../../store/features/translation';

// COMPONENTS
import { CustomScreenHeader } from '../../components/Common';

// STYLES
import { GLOBAL_STYLE as GS } from '../../assets/ts/styles';

const ProductDetails = () => {
	// ROUTE
	const ROUTE = useRoute();

	// NAVIGATION
	const NAIGATION = useNavigation();

	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);

	// LOCAL STYLES
	const STYLES = StyleSheet.create({
		main: {},
	});

	// FUNCTIONS

	// EFFECTS
	React.useEffect(() => {
		console.log('ROUTE?.params ===>', ROUTE?.params);
		return () => {};
	}, [ROUTE?.params]);

	return (
		<View style={GS.screen}>
			<CustomScreenHeader
				title={LANGUAGE.PRODUCTS_VIEW.DETAILS.DETAILS}
				showBackBtn
			/>

			<Text>ProductDetails</Text>
		</View>
	);
};

export default ProductDetails;
