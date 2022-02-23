import React from 'react';
import { View, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { Title } from 'react-native-paper';
import { gql, useQuery } from '@apollo/client';

// SELECTORS
import { useAppSelector } from '../../store/hooks';
import { getLanguage } from '../../store/features/translation';

// COMPONENTS
import {
	CustomScreenHeader,
	FocusAwareStatusBar,
} from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	// CONSTANT_SIZE as CS,
	// CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';

const AccountScreen = () => {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);

	// QUERIES
	const ORDERS_QUERY = gql`
		query Orders {
			generatePastOrdersPerCarrier
		}
	`;
	const { data, loading, error } = useQuery(ORDERS_QUERY, {
		variables: {},
	});

	// STYLES
	const STYLES = StyleSheet.create({
		loaderContainer: { ...GS.centered, ...GS.w100, flex: 1 },
		container: {
			...GS.screen,
			...GS.bgTransparent,
			...GS.px5,
			...GS.pb5,
			...GS.mx5,
			zIndex: 1,
		},
	});

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor='transparent'
				barStyle='light-content'
			/>

			<CustomScreenHeader title='Account & Preference' showHomeBtn />

			<View />
		</View>
	);
};

export default AccountScreen;
