import React from "react";
import {
	View,
	TouchableNativeFeedback,
	Image,
	ViewStyle,
	TextStyle,
	ImageStyle,
	ActivityIndicator,
} from "react-native";
import { Card } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

// HELPERS
import { isEmpty } from "../helpers/utils";

// COMPONENTS
import PaperText from "./PaperText";

// STYLES
import { CONSTANT_COLOR as CC, GLOBAL_STYLE as GS } from "../assets/ts/styles";

type IconProps = typeof Icon.defaultProps;

export type TouchableCardType = {
	title: null | string;
	description: null | string;
	textOneLine: boolean;
	icon: IconProps;
	iconSize: number;
	iconColor: string;
	indicatorIcon: IconProps;
	indicatorIconSize: number;
	indicatorIconColor: string;
	indicatorText: null | string;
	indicatorTextSize: number;
	indicatorTextColor: null | string;
	img: string | object;
	onPress: undefined;
	style: ViewStyle;
	cardStyle: ViewStyle;
	cardStyleContent: ViewStyle;
	titleStyle: TextStyle;
	descriptionStyle: ViewStyle;
	imgStyle: ImageStyle;
	height: number;
	loading: false;
	loaderColor: string;
	disabled: false;
	children: any;
};

const TouchableCard: React.FC<TouchableCardType> = ({
	title = null,
	description = null,
	textOneLine = true,
	icon = null,
	iconSize = 35,
	iconColor = CC.secondary,
	indicatorIcon = null,
	indicatorIconSize = 16,
	indicatorIconColor = CC.secondary,
	indicatorText = null,
	indicatorTextSize = 10,
	indicatorTextColor = null,
	img = "",
	onPress = undefined,
	style = {},
	cardStyle = {},
	cardStyleContent = {},
	titleStyle = {},
	descriptionStyle = {},
	imgStyle = {},
	height = 75,
	loading = false,
	loaderColor = CC.secondary,
	disabled = false,
	children,
}) => {
	return (
		<View style={{ flex: 1, ...style }}>
			<TouchableNativeFeedback
				{...{
					disabled: !onPress || disabled,
					...(onPress ? { onPress } : {}),
				}}
			>
				<Card
					style={{
						...GS.shadowSm,
						borderRadius: 10,
						overflow: "hidden",
						...cardStyle,
					}}
				>
					<Card.Content
						style={{
							...GS.row,
							alignItems: "center",
							height,
							...cardStyleContent,
						}}
					>
						{loading ? (
							<View style={{ ...GS.h100, ...GS.centered, flex: 1 }}>
								<ActivityIndicator color={loaderColor} size="small" />
							</View>
						) : (
							<>
								{!!children
									? children
									: (icon || img) && (
											<View style={{ ...GS.centered, ...GS.mr2 }}>
												{icon && !img && (
													<Icon name={icon} size={iconSize} color={iconColor} />
												)}
												{!isEmpty(img) && (
													<Image
														source={
															typeof img === "string" ? { uri: img } : img
														}
														style={{
															...GS.shadowSm,
															width: 40,
															height: 40,
															borderRadius: 20,
															resizeMode: "contain",
															...imgStyle,
														}}
													/>
												)}
											</View>
									  )}

								<View style={{ flex: 1, justifyContent: "center" }}>
									{!isEmpty(title) && (
										<PaperText
											{...(textOneLine ? { numberOfLines: 1 } : {})}
											style={{ fontSize: 18, paddingBottom: 2, ...titleStyle }}
										>
											{title}
										</PaperText>
									)}
									{!isEmpty(description) && (
										<PaperText
											{...(textOneLine ? { numberOfLines: 1 } : {})}
											style={{ ...descriptionStyle }}
										>
											{description}
										</PaperText>
									)}
								</View>

								{!isEmpty(indicatorIcon) && !indicatorText && (
									<View style={{ ...GS.centered, ...GS.px1 }}>
										<Icon
											name={indicatorIcon}
											size={indicatorIconSize}
											color={indicatorIconColor}
										/>
									</View>
								)}

								{!isEmpty(indicatorText) && (
									<PaperText
										style={{
											...GS.centered,
											...GS.px1,
											fontSize: indicatorTextSize,
											color: indicatorTextColor || indicatorIconColor,
										}}
									>
										{indicatorText}
									</PaperText>
								)}
							</>
						)}
					</Card.Content>
				</Card>
			</TouchableNativeFeedback>
		</View>
	);
};

export default TouchableCard;
