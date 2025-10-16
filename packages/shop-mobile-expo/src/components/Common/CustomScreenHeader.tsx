import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton, Title, Switch, TouchableRipple } from 'react-native-paper';
// tslint:disable-next-line: no-implicit-dependencies no-submodule-imports
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// SELECTORS
import { useAppSelector } from '../../store/hooks';
import { getLanguage } from '../../store/features/translation';

// COMPONENTS
import Icon from './Icon';
import PaperText from './PaperText';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';

// LOCAL TYPES
export interface CustomScreenHeaderType {
	title?: string;
	children?: React.ReactChild;
	showControls?: boolean;
	controlOnPressSearch?: () => any;
	controlOnPressStore?: () => any;
	showHomeBtn?: boolean;
	onPressHomeBtn?: () => any;
	showBackBtn?: boolean;
	onPressBackBtn?: () => any;
}

const CustomScreenHeader: React.FC<CustomScreenHeaderType> = ({
	title,
	children,
	showControls = false,
	controlOnPressSearch,
	controlOnPressStore,
	showHomeBtn = false,
	onPressHomeBtn,
	showBackBtn = false,
	onPressBackBtn,
}) => {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);

	// HOOKS
	const navigation = useNavigation();

	// STATES
	const [tmpSwitchValue, setTmpSwitchValue] = useState(false);

	// DATA

	const STYLES = StyleSheet.create({
		safeArea: {
			...GS.bgPrimaryLight,
			...GS.w100,
			...GS.shadowLg,
			marginBottom: -CS.SPACE_SM,
			borderBottomEndRadius: CS.SPACE_SM,
			borderBottomStartRadius: CS.SPACE_SM,
		},
		main: {
			...GS.row,
			...GS.px2,
			alignItems: 'stretch',
			height: CS.DRAWER_HEADER_HEIGHT,
		},
		menuBtnContainer: { ...GS.centered, ...GS.mr1 },
		contentContainer: {
			...GS.inlineItems,
			flex: 1,
		},
		contentContainerChildren: {
			...GS.justifyContentBetween,
			flex: 1,
		},
		contentTitle: {
			...GS.mb1,
			...GS.FF_NunitoBold,
			fontSize: CS.FONT_SIZE_MD - 1,
		},
		btnWrapper: {
			...GS.roundedSm,
			overflow: 'hidden',
		},
		backBtnIcon: {
			marginLeft: -6,
			...GS.mr1,
		},
		productsStatusText: {
			...GS.txtCapitalize,
			fontSize: CS.FONT_SIZE_SM,
			opacity: 0.4,
		},
		productsStatusTextFocused: {
			opacity: 1,
		},
		productsStatusSwitch: {
			marginHorizontal: -3,
			transform: [{ scale: 0.74 }],
		},
		storeBtnContainer: {
			...GS.roundedLg,
			overflow: 'hidden',
		},
	});

	return (
		<SafeAreaView style={STYLES.safeArea}>
			<View style={STYLES.main}>
				{/* drawer menu btn */}
				<View style={STYLES.menuBtnContainer}>
					<IconButton
						icon='menu'
						color={CC.light}
						size={CS.DRAWER_HEADER_HEIGHT / 2.4}
						style={{ ...GS.mx0 }}
						// @ts-ignore
						onPress={navigation.openDrawer}
					/>
				</View>

				{/* header content */}
				<View style={STYLES.contentContainer}>
					{children ? (
						children
					) : (
						<View style={STYLES.contentContainerChildren}>
							{!!title && (
								<Title style={STYLES.contentTitle}>
									{title}
								</Title>
							)}
							{!!showControls && (
								<View style={{ ...GS.inlineItems }}>
									<TouchableOpacity
										onPress={() =>
											setTmpSwitchValue(!tmpSwitchValue)
										}
										style={{
											...GS.inlineItems,
											...GS.mr2,
										}}>
										<PaperText
											style={{
												...STYLES.productsStatusText,
												...(tmpSwitchValue
													? STYLES.productsStatusTextFocused
													: {}),
											}}>
											{LANGUAGE.PRODUCTS_VIEW.TAKEAWAY}
										</PaperText>
										<Switch
											value={tmpSwitchValue}
											onValueChange={() =>
												setTmpSwitchValue(
													!tmpSwitchValue,
												)
											}
											style={STYLES.productsStatusSwitch}
										/>
										<PaperText
											style={{
												...STYLES.productsStatusText,
												...(!tmpSwitchValue
													? STYLES.productsStatusTextFocused
													: {}),
											}}>
											{LANGUAGE.PRODUCTS_VIEW.DELIVERY}
										</PaperText>
									</TouchableOpacity>

									<IconButton
										icon='search'
										color={CC.light}
										size={CS.FONT_SIZE_SM * 1.6}
										style={{ ...GS.ml0 }}
										onPress={() =>
											controlOnPressSearch
												? controlOnPressSearch()
												: navigation.navigate(
														'DRAWER/SEARCH' as never,
												  )
										}
									/>

									<View style={STYLES.storeBtnContainer}>
										<TouchableRipple
											rippleColor={CC.light + '6f'}
											onPress={() =>
												controlOnPressStore
													? controlOnPressStore()
													: navigation.navigate(
															'DRAWER/MERCHANTS_SEARCH' as never,
													  )
											}>
											<MaterialIcons
												name='storefront'
												color={CC.success}
												size={CS.FONT_SIZE_SM * 1.6}
												style={GS.m2}
											/>
										</TouchableRipple>
									</View>
								</View>
							)}

							{showBackBtn && (
								<View style={STYLES.btnWrapper}>
									<TouchableRipple
										onPress={() =>
											onPressBackBtn
												? onPressBackBtn()
												: navigation.goBack()
										}>
										<View
											style={{
												...GS.inlineItems,
												padding:
													CS.DRAWER_HEADER_HEIGHT /
													6.5,
											}}>
											<Icon
												name='chevron-left'
												color={CC.light}
												size={
													CS.DRAWER_HEADER_HEIGHT /
													2.5
												}
												style={STYLES.backBtnIcon}
											/>
											<PaperText>
												{
													LANGUAGE.PRODUCTS_VIEW
														.DETAILS.BACK
												}
											</PaperText>
										</View>
									</TouchableRipple>
								</View>
							)}

							{showHomeBtn && (
								<View style={STYLES.btnWrapper}>
									<TouchableRipple
										onPress={() =>
											onPressHomeBtn
												? onPressHomeBtn()
												: navigation.navigate(
														// @ts-ignore TODO: search to solve the next line issue
														'DRAWER/HOME',
												  )
										}>
										<View
											style={{
												...GS.inlineItems,
												padding:
													CS.DRAWER_HEADER_HEIGHT /
													6.5,
											}}>
											<Icon
												name='shopping-bag'
												color={CC.light}
												size={
													CS.DRAWER_HEADER_HEIGHT /
													2.5
												}
												style={{ ...GS.ml0, ...GS.mr1 }}
											/>
											<PaperText>
												{LANGUAGE.PRODUCTS_VIEW.TITLE}
											</PaperText>
										</View>
									</TouchableRipple>
								</View>
							)}
						</View>
					)}
				</View>
			</View>
		</SafeAreaView>
	);
};

export default CustomScreenHeader;
