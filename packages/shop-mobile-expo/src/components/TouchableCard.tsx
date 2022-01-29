import React from "react";
import {
	View,
	Image,
	ViewStyle,
	TextStyle,
	ImageStyle,
	ActivityIndicator,
	GestureResponderEvent,
} from "react-native";
import { Card, TouchableRipple } from "react-native-paper";

// HELPERS
import { isEmpty } from "../helpers/utils";

// COMPONENTS
import PaperText from "./PaperText";
import Icon, { IconPropsType } from "../components/Icon";

// STYLES
import { CONSTANT_COLOR as CC, GLOBAL_STYLE as GS } from "../assets/ts/styles";

export type TouchableCardPropsType = {
	title?: null | React.ReactNode | string;
	description?: null | string;
	textOneLine?: boolean;
	iconProps?: IconPropsType;
	indicatorIconProps?: IconPropsType;
	indicatorText?: null | string;
	indicatorTextSize?: number;
	indicatorTextColor?: null | string;
	img?: string | object;
	onPress?: (event: GestureResponderEvent) => any;
	style?: ViewStyle;
	cardStyle?: ViewStyle;
	cardStyleContent?: ViewStyle;
	titleStyle?: TextStyle;
	descriptionStyle?: ViewStyle;
	imgStyle?: ImageStyle;
	height?: number;
	loading?: false;
	loaderColor?: string;
	disabled?: false;
	rippleColor?: string;
	children?: React.ReactNode;
};

const TouchableCard: React.FC<TouchableCardPropsType> = ({
	title = null,
	description = null,
	textOneLine = true,
	iconProps = undefined,
	indicatorIconProps = undefined,
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
	rippleColor = "",
	children = null,
}) => {
	return (
		<View style={{ flex: 1, ...style }}>
			<Card
				style={{
					...GS.shadowSm,
					borderRadius: 10,
					overflow: "hidden",
					...cardStyle,
				}}
			>
				<TouchableRipple
					{...{
						disabled: !onPress || disabled,
						...(onPress ? { onPress } : {}),
						rippleColor,
						style: {
							...GS.w100,
							...GS.h100,
						},
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
									: (iconProps || img) && (
											<View
												style={{
													...GS.centered,
													...GS.mr2,
												}}
											>
												{iconProps && !img && (
													<Icon
														{...{ color: CC.secondary, size: 35, ...iconProps }}
													/>
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

								<View
									style={{
										flex: 1,
										justifyContent: "center",
									}}
								>
									{!isEmpty(title) && (
										<PaperText
											{...(textOneLine ? { numberOfLines: 1 } : {})}
											style={{
												fontSize: 18,
												paddingBottom: 2,
												...titleStyle,
											}}
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

								{!isEmpty(indicatorIconProps) && !indicatorText && (
									<View style={{ ...GS.centered, ...GS.px1 }}>
										<Icon
											{...{
												color: CC.secondary,
												size: 16,
												...indicatorIconProps,
											}}
										/>
									</View>
								)}

								{!isEmpty(indicatorText) && (
									<PaperText
										style={{
											...GS.centered,
											...GS.px1,
											fontSize: indicatorTextSize,
											color: indicatorTextColor || CC.primary,
										}}
									>
										{indicatorText}
									</PaperText>
								)}
							</>
						)}
					</Card.Content>
				</TouchableRipple>
			</Card>
		</View>
	);
};

export default TouchableCard;
