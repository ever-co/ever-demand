import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Text, RadioButton } from 'react-native-paper';
// tslint:disable-next-line: no-implicit-dependencies no-submodule-imports
import MaterialIcon from '@expo/vector-icons/MaterialCommunityIcons';

// TYPES
import type ENV_TYPE from '../../environments/model';

// ACTIONS & SELECTORS
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
	getUserData,
	getProductViewType,
	setProductViewType,
} from '../../store/features/user';
// COMPONENTS
import {
	TouchableCard,
	FocusAwareStatusBar,
	CustomScreenHeader,
	Dialog,
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
	const dispatch = useAppDispatch();

	// SELECTORS
	const USER_DATA = useAppSelector(getUserData);
	const PRODUCT_VIEW_TYPE = useAppSelector(getProductViewType);
	// const CURRENT_LANG = useAppSelector(getLang);

	// STATES
	const [productViewDialog, setProductViewDialog] =
		React.useState<boolean>(false);
	const [logOutDialog, setLogOutDialog] = React.useState<boolean>(false);

	// DATA
	const IS_INVITE = USER_DATA.__typename === 'Invite';

	const STYLES = StyleSheet.create({
		container: { ...GS.screen, ...GS.bgLight },
		dialogProductViewContent: { height: 180 },
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
		optionItemCardContentContainerText: {
			flex: 1,
		},
		optionItemCardContentText: {
			...GS.txtCapitalize,
			fontSize: CS.FONT_SIZE_MD,
			color: CC.primary,
		},
		optionItemCardContentSubText: {
			...GS.txtLower,
			fontSize: CS.FONT_SIZE,
			color: CC.primaryLight,
		},
		dialogContent: {
			...GS.centered,
			...GS.w100,
		},
	});

	// FUNCTIONS
	const onSelectProductView = (value: ENV_TYPE['PRODUCTS_VIEW_TYPE']) => {
		dispatch(setProductViewType(value));
		setProductViewDialog(false);
	};

	return (
		<>
			<Dialog
				visible={logOutDialog}
				onDismiss={() => setLogOutDialog(false)}
				title={'Log out?'}
				message={'Do you really want to sign-out?'}
				actions={[
					{
						children: 'Cancel',
						uppercase: false,
						labelStyle: { color: CC.primary },
						onPress: () => setLogOutDialog(false),
					},
					{
						children: 'Sign out',
						uppercase: false,
						labelStyle: { color: CC.danger },
						onPress: () => {},
					},
				]}
			/>

			<Dialog
				visible={productViewDialog}
				onDismiss={() => setProductViewDialog(false)}
				title={'Product View'}>
				<View style={STYLES.dialogProductViewContent}>
					<TouchableCard
						style={STYLES.optionItem}
						cardStyle={{ ...STYLES.optionItemCard, ...GS.noShadow }}
						cardStyleContent={STYLES.optionItemCardContent}
						onPress={() => onSelectProductView('list')}>
						<View
							style={{
								...GS.inlineItems,
								...GS.w100,
								...GS.h100,
							}}>
							<MaterialIcon
								size={CS.FONT_SIZE_XLG}
								color={CC.primary}
								name='arrow-expand-vertical'
								style={{ ...GS.mr2 }}
							/>
							<View
								style={
									STYLES.optionItemCardContentContainerText
								}>
								<Text style={STYLES.optionItemCardContentText}>
									List
								</Text>
								<Text
									style={STYLES.optionItemCardContentSubText}>
									Use list view (swipe by top or bottom) in
									home
								</Text>
							</View>

							<RadioButton
								status={
									PRODUCT_VIEW_TYPE === 'list'
										? 'checked'
										: 'unchecked'
								}
								uncheckedColor={CC.primaryHightLight}
								value={'list'}
								onPress={() => onSelectProductView('list')}
							/>
						</View>
					</TouchableCard>

					<TouchableCard
						style={STYLES.optionItem}
						cardStyle={{ ...STYLES.optionItemCard, ...GS.noShadow }}
						cardStyleContent={STYLES.optionItemCardContent}
						onPress={() => onSelectProductView('slides')}>
						<View
							style={{
								...GS.justifyContentBetween,
								...GS.w100,
							}}>
							<MaterialIcon
								size={CS.FONT_SIZE_XLG}
								color={CC.primary}
								name='arrow-expand-horizontal'
								style={{ ...GS.mr2 }}
							/>

							<View
								style={
									STYLES.optionItemCardContentContainerText
								}>
								<Text style={STYLES.optionItemCardContentText}>
									Slides
								</Text>
								<Text
									style={STYLES.optionItemCardContentSubText}>
									Use slide view (swipe by left or right) in
									home
								</Text>
							</View>

							<RadioButton
								status={
									PRODUCT_VIEW_TYPE === 'slides'
										? 'checked'
										: 'unchecked'
								}
								uncheckedColor={CC.primaryHightLight}
								value={'slides'}
								onPress={() => onSelectProductView('slides')}
							/>
						</View>
					</TouchableCard>
				</View>
			</Dialog>

			<View style={STYLES.container}>
				<FocusAwareStatusBar
					translucent={true}
					backgroundColor='transparent'
					barStyle='light-content'
				/>
				<CustomScreenHeader
					title={'Account & Preferences'}
					showHomeBtn
				/>

				<Card style={STYLES.userInfoCard}>
					<Card.Content style={STYLES.userInfoCardContent}>
						{IS_INVITE ? (
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
										<Text
											style={
												STYLES.userInfoInfosItemTitle
											}>
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
										<Text
											style={
												STYLES.userInfoInfosItemTitle
											}>
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
										<Text
											style={
												STYLES.userInfoInfosItemTitle
											}>
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
						iconProps={{ name: 'log-out', size: CS.FONT_SIZE_XLG }}
						style={STYLES.optionItem}
						cardStyle={STYLES.optionItemCard}
						cardStyleContent={STYLES.optionItemCardContent}
						height={CS.FONT_SIZE_XLG * 3}
						onPress={() => setLogOutDialog(true)}
					/>

					<TouchableCard
						title={'Product view mode'}
						titleStyle={{ color: CC.primary }}
						description='Select the mode of product view'
						descriptionStyle={{ color: CC.gray }}
						iconProps={{ name: 'columns', size: CS.FONT_SIZE_XLG }}
						style={STYLES.optionItem}
						cardStyle={STYLES.optionItemCard}
						cardStyleContent={STYLES.optionItemCardContent}
						height={CS.FONT_SIZE_XLG * 3}
						onPress={() => setProductViewDialog(true)}
					/>
				</ScrollView>
			</View>
		</>
	);
}

export default AccountScreen;
