import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Text } from 'react-native-paper';

// TYPES

// ACTIONS & SELECTORS
import { useAppSelector /* , useAppDispatch */ } from '../../store/hooks';
import { getUserData } from '../../store/features/user';
// import { getLang } '../../store/features/translation';

// COMPONENTS
import {
	TouchableCard,
	FocusAwareStatusBar,
	CustomScreenHeader,
	Icon,
} from '../../components/Common';
// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from '../../assets/ts/styles';

function AccountScreen({}) {
	// ACTIONS
	// const dispatch = useAppDispatch();

	// SELECTORS
	const USER_DATA = useAppSelector(getUserData);
	// const CURRENT_LANG = useAppSelector(getLang);
	const isInvite = USER_DATA.__typename === 'Invite';

	const STYLES = StyleSheet.create({
		container: { ...GS.screen, ...GS.bgLight },
		userInfoCard: {
			...GS.py5,
			backgroundColor: CC.white,
			borderBottomLeftRadius: CS.SPACE,
			borderBottomRightRadius: CS.SPACE,
		},
		userInfoCardContent: {
			...GS.centered,
			justifyContent: 'space-between',
		},
		userAvatarContainer: {
			...GS.centered,
			...GS.mb3,
			borderColor: CC.gray,
			borderWidth: 2,
			borderRadius: 9999,
		},
		avatarIcon: {
			...GS.m2,
		},
		userInfoTitle: {
			...GS.mb4,
			color: CC.primary,
			textAlign: 'center',
		},
		userInfoInfosContainer: { ...GS.inlineItems, width: '100%' },
		userInfoInfosItem: { ...GS.centered, flex: 1 },
		userInfoInfosItemTitle: {
			color: CC.gray,
		},
		userInfoInfosItemSubTitle: {
			color: CC.primary,
		},
		scrollViewOptions: {
			...GS.h100,
			...GS.pt4,
			...GS.px2,
		},
		optionItem: { ...GS.inlineItems, ...GS.mb2 },
		optionItemCard: { ...GS.w100, borderRadius: 5 },
		optionItemCardContent: { borderRadius: 0 },
	});

	return (
		<View style={STYLES.container}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor='transparent'
				barStyle='light-content'
			/>
			<CustomScreenHeader title={'Account & Preferences'} showHomeBtn />

			<Card style={STYLES.userInfoCard}>
				<Card.Content style={STYLES.userInfoCardContent}>
					{isInvite ? (
						<>
							<View style={STYLES.userAvatarContainer}>
								<Icon
									name='user'
									color={CC.gray}
									size={60}
									style={STYLES.avatarIcon}
								/>
							</View>

							<Title style={STYLES.userInfoTitle}>
								{USER_DATA.__typename}
							</Title>

							<View style={STYLES.userInfoInfosContainer}>
								<View style={STYLES.userInfoInfosItem}>
									<Text style={STYLES.userInfoInfosItemTitle}>
										Country
									</Text>
									<Text
										style={
											STYLES.userInfoInfosItemSubTitle
										}>
										{USER_DATA.geoLocation.countryName}
									</Text>
								</View>

								<View style={STYLES.userInfoInfosItem}>
									<Text style={STYLES.userInfoInfosItemTitle}>
										City
									</Text>
									<Text
										style={
											STYLES.userInfoInfosItemSubTitle
										}>
										{USER_DATA.geoLocation.city}
									</Text>
								</View>

								<View style={STYLES.userInfoInfosItem}>
									<Text style={STYLES.userInfoInfosItemTitle}>
										Apartment
									</Text>
									<Text
										style={
											STYLES.userInfoInfosItemSubTitle
										}>
										{USER_DATA.apartment}
									</Text>
								</View>
							</View>
						</>
					) : (
						<View />
					)}
				</Card.Content>
			</Card>

			<ScrollView style={STYLES.scrollViewOptions} scrollEnabled>
				<TouchableCard
					title={'Log out'}
					titleStyle={{ color: CC.primary }}
					description='Log out to the app'
					descriptionStyle={{ color: CC.gray }}
					iconProps={{ name: 'log-out', size: CS.FONT_SIZE_LG }}
					style={STYLES.optionItem}
					cardStyle={STYLES.optionItemCard}
					cardStyleContent={STYLES.optionItemCardContent}
					height={CS.FONT_SIZE_XLG * 3}
					onPress={() => {}}
				/>
			</ScrollView>
		</View>
	);
}

export default AccountScreen;
