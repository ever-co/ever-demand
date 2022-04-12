import React from 'react';
import {
	View,
	Image,
	ViewStyle,
	TextStyle,
	ImageStyle,
	ActivityIndicator,
	GestureResponderEvent,
	StyleSheet,
} from 'react-native';
import { Card, TouchableRipple } from 'react-native-paper';

// HELPERS
import { isEmpty } from '../../helpers/utils';

// COMPONENTS
import PaperText from './PaperText';
import Icon, { IconPropsType } from './Icon';

// STYLES
import {
	CONSTANT_COLOR as CC,
	GLOBAL_STYLE as GS,
} from '../../assets/ts/styles';

export interface TouchableCardPropsType {
	title?: null | React.ReactNode | string;
	description?: null | string;
	textOneLine?: boolean;
	iconProps?: IconPropsType;
	indicatorIconProps?: IconPropsType;
	indicatorText?: null | string;
	indicatorTextSize?: number;
	indicatorTextColor?: null | string;
	img?: string | object | undefined;
	onPress?: (event: GestureResponderEvent) => any;
	style?: ViewStyle;
	cardStyle?: ViewStyle;
	cardStyleContent?: ViewStyle;
	titleStyle?: TextStyle;
	descriptionStyle?: TextStyle;
	imgStyle?: ImageStyle;
	height?: number;
	loading?: false;
	loaderColor?: string;
	disabled?: false;
	rippleColor?: string;
	children?: React.ReactNode;
}

const STYLES = StyleSheet.create({
	main: { flex: 1 },
	card: {
		...GS.shadowSm,
		borderRadius: 10,
		overflow: 'hidden',
	},
	cardContent: {
		...GS.row,
		alignItems: 'center',
	},
	loaderContainer: { ...GS.h100, ...GS.centered, flex: 1 },
	cardImg: {
		width: 40,
		height: 40,
		borderRadius: 20,
		resizeMode: 'cover',
	},
	cardTextContent: {
		flex: 1,
		justifyContent: 'center',
	},
	cardTextContentTitle: { fontSize: 18, paddingBottom: 2, color: CC.primary },
});

const TouchableCard: React.FC<TouchableCardPropsType> = ({
	title = null,
	description = null,
	textOneLine = true,
	iconProps,
	indicatorIconProps,
	indicatorText = null,
	indicatorTextSize = 10,
	indicatorTextColor = null,
	img,
	onPress,
	style = {},
	cardStyle = {},
	cardStyleContent = {},
	titleStyle = {},
	descriptionStyle = {},
	imgStyle = {},
	height = 75,
	loading = false,
	loaderColor = CC.gray,
	disabled = false,
	rippleColor = CC.secondary + '10',
	children = null,
}) => (
	<View style={{ ...STYLES.main, ...style }}>
		<Card style={{ ...STYLES.main, ...cardStyle }}>
			<TouchableRipple
				{...{
					disabled: !onPress || disabled,
					...(onPress ? { onPress } : {}),
					rippleColor,
					style: {
						...GS.w100,
						...GS.h100,
					},
				}}>
				<Card.Content
					style={{
						...STYLES.cardContent,
						height,
						...cardStyleContent,
					}}>
					{loading ? (
						<View style={STYLES.loaderContainer}>
							<ActivityIndicator
								color={loaderColor}
								size='small'
							/>
						</View>
					) : (
						<>
							{children
								? children
								: (iconProps || img) && (
										<View
											style={{
												...GS.centered,
												...GS.mr2,
											}}>
											{iconProps && !img && (
												<Icon
													{...{
														color: CC.gray,
														size: 35,
														...iconProps,
													}}
												/>
											)}
											{!isEmpty(img) && (
												<Image
													source={
														typeof img === 'string'
															? { uri: img }
															: img
															? img
															: {}
													}
													style={{
														...STYLES.cardImg,
														...imgStyle,
													}}
												/>
											)}
										</View>
								  )}

							<View style={STYLES.cardTextContent}>
								{!isEmpty(title) && (
									<PaperText
										{...(textOneLine
											? { numberOfLines: 1 }
											: {})}
										style={{
											...STYLES.cardTextContentTitle,
											...titleStyle,
										}}>
										{title}
									</PaperText>
								)}
								{!isEmpty(description) && (
									<PaperText
										{...(textOneLine
											? { numberOfLines: 1 }
											: {})}
										style={{ ...descriptionStyle }}>
										{description}
									</PaperText>
								)}
							</View>

							{!isEmpty(indicatorIconProps) && !indicatorText && (
								<View
									style={{
										...GS.centered,
										...GS.px1,
									}}>
									<Icon
										{...{
											color: CC.gray,
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
									}}>
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

export default TouchableCard;
