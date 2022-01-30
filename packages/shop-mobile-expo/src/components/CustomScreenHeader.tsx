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
	showBackBtn?: boolean;
	onPressBackBtn?: Function;
};

const CustomScreenHeader: React.FC<CustomScreenHeaderType> = ({
	title,
	children,
	showControls = false,
	controlOnPressSearch = () => {},
	controlOnPressStore = () => {},
	showBackBtn = false,
	onPressBackBtn = () => {},
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
								<Title style={{ ...GS.mb1, fontSize: CS.FONT_SIZE_MD }}>
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
											style={{ ...GS.txtCapitalize, fontSize: CS.FONT_SIZE_SM }}
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
											style={{ ...GS.txtCapitalize, fontSize: CS.FONT_SIZE_SM }}
										>
											{LANGUAGE.PRODUCTS_VIEW.DELIVERY}
										</PaperText>
									</TouchableOpacity>

									<IconButton
										icon="search"
										color={CC.light}
										size={CS.FONT_SIZE_SM * 1.6}
										style={{ ...GS.ml0 }}
										// @ts-ignore
										onPress={controlOnPressSearch}
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
								<Button
									icon="chevron-left"
									mode="outlined"
									onPress={() => onPressBackBtn()}
									style={{
										borderColor: CC.light,
										borderWidth: 1,
									}}
									labelStyle={{
										...GS.ml2,
										marginVertical: CS.SPACE_SM,
										fontSize: CS.FONT_SIZE - 2,
									}}
									theme={{ colors: { primary: CC.light } }}
								>
									{LANGUAGE.PRODUCTS_VIEW.DETAILS.BACK}
								</Button>
							)}
						</View>
					)}
				</View>
			</View>
		</SafeAreaView>
	);
};

export default CustomScreenHeader;
