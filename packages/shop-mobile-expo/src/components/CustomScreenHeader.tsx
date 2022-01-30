import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	IconButton,
	Title,
	Switch,
	TouchableRipple,
	Button,
} from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// SELECTORS
import { useAppSelector } from "../store/hooks";
import { getLanguage } from "../store/features/translation";

// COMPONENTS
import Icon from "./Icon";
import PaperText from "./PaperText";

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from "../assets/ts/styles";

// LOCAL TYPES
export type CustomScreenHeaderType = {
	title?: string;
	children?: React.ReactChild;
	showControls?: boolean;
	controlOnPressSearch?: Function;
	controlOnPressStore?: Function;
	showHomeBtn?: boolean;
	onPressHomeBtn?: Function;
	showBackBtn?: boolean;
	onPressBackBtn?: Function;
};

const CustomScreenHeader: React.FC<CustomScreenHeaderType> = ({
	title,
	children,
	showControls = false,
	controlOnPressSearch = () => {},
	controlOnPressStore = () => {},
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

	return (
		<SafeAreaView
			style={{
				...GS.bgPrimaryLight,
				...GS.w100,
				...GS.shadowLg,
				marginBottom: -CS.SPACE_SM,
				borderBottomEndRadius: CS.SPACE_SM,
				borderBottomStartRadius: CS.SPACE_SM,
			}}
		>
			<View
				style={{
					...GS.row,
					...GS.px2,
					alignItems: "stretch",
					height: CS.DRAWER_HEADER_HEIGHT,
				}}
			>
				{/* drawer menu btn */}
				<View style={{ ...GS.centered, ...GS.mr1 }}>
					<IconButton
						icon="menu"
						color={CC.light}
						size={CS.DRAWER_HEADER_HEIGHT / 2.4}
						style={{ ...GS.mx0 }}
						// @ts-ignore
						onPress={navigation.openDrawer}
					/>
				</View>

				{/* header content */}
				<View
					style={{
						...GS.inlineItems,
						flex: 1,
					}}
				>
					{!!children ? (
						children
					) : (
						<View
							style={{
								...GS.justifyContentBetween,
								flex: 1,
							}}
						>
							{!!title && (
								<Title
									style={{
										...GS.mb1,
										...GS.FF_NunitoBold,
										fontSize: CS.FONT_SIZE_MD - 1,
									}}
								>
									{title}
								</Title>
							)}
							{!!showControls && (
								<View style={{ ...GS.inlineItems }}>
									<TouchableOpacity
										onPress={() => setTmpSwitchValue(!tmpSwitchValue)}
										style={{ ...GS.inlineItems, ...GS.mr2 }}
									>
										<PaperText
											style={{
												...GS.txtCapitalize,
												fontSize: CS.FONT_SIZE_SM,
												opacity: tmpSwitchValue ? 0.4 : 1,
											}}
										>
											{LANGUAGE.PRODUCTS_VIEW.TAKEAWAY}
										</PaperText>
										<Switch
											value={tmpSwitchValue}
											onValueChange={() => setTmpSwitchValue(!tmpSwitchValue)}
											style={{
												marginHorizontal: -3,
												transform: [{ scale: 0.74 }],
											}}
										/>
										<PaperText
											style={{
												...GS.txtCapitalize,
												fontSize: CS.FONT_SIZE_SM,
												opacity: tmpSwitchValue ? 1 : 0.4,
											}}
										>
											{LANGUAGE.PRODUCTS_VIEW.DELIVERY}
										</PaperText>
									</TouchableOpacity>

									<IconButton
										icon="search"
										color={CC.light}
										size={CS.FONT_SIZE_SM * 1.6}
										style={{ ...GS.ml0 }}
										onPress={() => controlOnPressSearch()}
									/>

									<View style={{ ...GS.roundedLg, overflow: "hidden" }}>
										<TouchableRipple onPress={() => controlOnPressStore()}>
											<MaterialIcons
												name="storefront"
												color={CC.light}
												size={CS.FONT_SIZE_SM * 1.6}
												style={{ ...GS.m1 }}
											/>
										</TouchableRipple>
									</View>
								</View>
							)}

							{showBackBtn && (
								<View
									style={{
										...GS.roundedSm,
										overflow: "hidden",
									}}
								>
									<TouchableRipple
										onPress={() =>
											onPressBackBtn ? onPressBackBtn() : navigation.goBack()
										}
									>
										<View
											style={{
												...GS.inlineItems,
												padding: CS.DRAWER_HEADER_HEIGHT / 6.5,
											}}
										>
											<Icon
												name="chevron-left"
												color={CC.light}
												size={CS.DRAWER_HEADER_HEIGHT / 2.5}
												style={{ marginLeft: -6, ...GS.mr1 }}
											/>
											<PaperText>
												{LANGUAGE.PRODUCTS_VIEW.DETAILS.BACK}
											</PaperText>
										</View>
									</TouchableRipple>
								</View>
							)}

							{showHomeBtn && (
								<View
									style={{
										...GS.roundedSm,
										overflow: "hidden",
									}}
								>
									<TouchableRipple
										onPress={() =>
											onPressHomeBtn
												? onPressHomeBtn()
												: //@ts-ignore TODO: search to solve the nex line
												  navigation.navigate("DRAWER/HOME")
										}
									>
										<View
											style={{
												...GS.inlineItems,
												padding: CS.DRAWER_HEADER_HEIGHT / 6.5,
											}}
										>
											<Icon
												name="shopping-bag"
												color={CC.light}
												size={CS.DRAWER_HEADER_HEIGHT / 2.5}
												style={{ ...GS.ml0, ...GS.mr1 }}
											/>
											<PaperText>{LANGUAGE.PRODUCTS_VIEW.TITLE}</PaperText>
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
