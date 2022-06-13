import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Text, RadioButton, Button } from 'react-native-paper';
// tslint:disable-next-line: no-implicit-dependencies no-submodule-imports
import MaterialIcon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

// TYPES
import type ENV_TYPE from '../../environments/model';

// STORE
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
	getUserData,
	getProductViewType,
	setProductViewType,
	resetUser,
	getOrderInfoType,
	setOrderInfoType,
} from '../../store/features/user';
import { setGroup } from '../../store/features/navigation';

// ROUTER
import ROUTE_GROUPS from '../../router/groups.routes';

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
	const USER_DATA = useAppSelector(getUserData) as any;
	const PRODUCT_VIEW_TYPE = useAppSelector(getProductViewType);
	const ORDER_INFO_VIEW = useAppSelector(getOrderInfoType);
	// const CURRENT_LANG = useAppSelector(getLang);

	// NAVIGATION
	const NAVIGATION = useNavigation();

	// STATES
	const [productViewDialog, setProductViewDialog] =
		React.useState<boolean>(false);
	const [orderInfoTypeDialog, setOrderInfoTypeDialog] =
		React.useState<boolean>(false);
	const [logOutDialog, setLogOutDialog] = React.useState<boolean>(false);

	// DATA
	const IS_INVITE = USER_DATA?.__typename === 'Invite';
	const CURRENT_USER_DATA = IS_INVITE ? USER_DATA : USER_DATA?.user?.user;

	const STYLES = StyleSheet.create({
		container: { ...GS.screen, ...GS.bgLight },
		dialogProductViewContent: { height: 180 },
		userInfoCard: {
			...GS.pt5,
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
			...GS.mb0,
			...GS.pb0,
			color: CC.primary,
			textAlign: 'center',
		},
		userInfoSubTitle: {
			color: CC.gray,
			textAlign: 'center',
		},
		userInfoInfosContainer: { ...GS.inlineItems, ...GS.mt4, width: '100%' },
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

	const onSelectOrderInfoView = (value: ENV_TYPE['ORDER_INFO_TYPE']) => {
		dispatch(setOrderInfoType(value));
		setOrderInfoTypeDialog(false);
	};

	const onGoToRegistration = () => {
		const NAV_PARAMS = { fromApp: true };
		dispatch(setGroup(ROUTE_GROUPS.REGISTRATION));
		setTimeout(() => {
			NAVIGATION.navigate('STACK/SIGN_UP' as never, NAV_PARAMS as never);
		}, 200);
	};

	const onSignOut = () => {
		dispatch(resetUser());
		dispatch(setGroup(ROUTE_GROUPS.REGISTRATION));
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
						onPress: onSignOut,
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

			<Dialog
				visible={orderInfoTypeDialog}
				onDismiss={() => setOrderInfoTypeDialog(false)}
				title={'Product View'}>
				<View style={STYLES.dialogProductViewContent}>
					<TouchableCard
						style={STYLES.optionItem}
						cardStyle={{ ...STYLES.optionItemCard, ...GS.noShadow }}
						cardStyleContent={STYLES.optionItemCardContent}
						onPress={() => onSelectOrderInfoView('popup')}>
						<View
							style={{
								...GS.inlineItems,
								...GS.w100,
								...GS.h100,
							}}>
							<Icon
								size={CS.FONT_SIZE_XLG}
								color={CC.primary}
								name='box'
								style={{ ...GS.mr2 }}
							/>
							<View
								style={
									STYLES.optionItemCardContentContainerText
								}>
								<Text style={STYLES.optionItemCardContentText}>
									Popup
								</Text>
								<Text
									style={STYLES.optionItemCardContentSubText}>
									Display order info with a dialog box
								</Text>
							</View>

							<RadioButton
								status={
									ORDER_INFO_VIEW === 'popup'
										? 'checked'
										: 'unchecked'
								}
								uncheckedColor={CC.primaryHightLight}
								value={'popup'}
								onPress={() => onSelectOrderInfoView('popup')}
							/>
						</View>
					</TouchableCard>

					<TouchableCard
						style={STYLES.optionItem}
						cardStyle={{ ...STYLES.optionItemCard, ...GS.noShadow }}
						cardStyleContent={STYLES.optionItemCardContent}
						onPress={() => onSelectOrderInfoView('page')}>
						<View
							style={{
								...GS.justifyContentBetween,
								...GS.w100,
							}}>
							<Icon
								size={CS.FONT_SIZE_XLG}
								color={CC.primary}
								name='smartphone'
								style={{ ...GS.mr2 }}
							/>

							<View
								style={
									STYLES.optionItemCardContentContainerText
								}>
								<Text style={STYLES.optionItemCardContentText}>
									Page
								</Text>
								<Text
									style={STYLES.optionItemCardContentSubText}>
									Use page view for order info
								</Text>
							</View>

							<RadioButton
								status={
									ORDER_INFO_VIEW === 'page'
										? 'checked'
										: 'unchecked'
								}
								uncheckedColor={CC.primaryHightLight}
								value={'page'}
								onPress={() => onSelectOrderInfoView('page')}
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
						<View style={STYLES.userAvatarContainer}>
							<Icon
								name='user'
								color={CC.gray}
								size={60}
								style={STYLES.avatarIcon}
							/>
						</View>

						<Title style={STYLES.userInfoTitle}>
							{IS_INVITE
								? CURRENT_USER_DATA?.__typename
								: `${CURRENT_USER_DATA?.firstName || ''} ${
										CURRENT_USER_DATA?.lastName || ''
								  }`}
						</Title>

						{!IS_INVITE && (
							<Text style={STYLES.userInfoSubTitle}>
								{CURRENT_USER_DATA?.email}
							</Text>
						)}

						<View style={STYLES.userInfoInfosContainer}>
							<View style={STYLES.userInfoInfosItem}>
								<Text style={STYLES.userInfoInfosItemTitle}>
									Country
								</Text>
								<Text style={STYLES.userInfoInfosItemSubTitle}>
									{
										CURRENT_USER_DATA?.geoLocation
											?.countryName
									}
								</Text>
							</View>

							<View style={STYLES.userInfoInfosItem}>
								<Text style={STYLES.userInfoInfosItemTitle}>
									City
								</Text>
								<Text style={STYLES.userInfoInfosItemSubTitle}>
									{CURRENT_USER_DATA?.geoLocation?.city}
								</Text>
							</View>

							<View style={STYLES.userInfoInfosItem}>
								<Text style={STYLES.userInfoInfosItemTitle}>
									Apartment
								</Text>
								<Text style={STYLES.userInfoInfosItemSubTitle}>
									{CURRENT_USER_DATA?.apartment}
								</Text>
							</View>
						</View>

						{IS_INVITE && (
							<Button
								uppercase={false}
								style={{ ...GS.mt4, ...GS.w100 }}
								onPress={onGoToRegistration}>
								Register
							</Button>
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

					<TouchableCard
						title={'Order info type'}
						titleStyle={{ color: CC.primary }}
						description='Select the mode of Order info view'
						descriptionStyle={{ color: CC.gray }}
						iconProps={{ name: 'layers', size: CS.FONT_SIZE_XLG }}
						style={STYLES.optionItem}
						cardStyle={STYLES.optionItemCard}
						cardStyleContent={STYLES.optionItemCardContent}
						height={CS.FONT_SIZE_XLG * 3}
						onPress={() => setOrderInfoTypeDialog(true)}
					/>
				</ScrollView>
			</View>
		</>
	);
}

export default AccountScreen;
