import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { RadioButton } from 'react-native-paper';

// TYPES
import type { supportedLangType } from '../../store/features/translation/types';

// ACTIONS & SELECTORS
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
	getLang,
	getLanguage,
	supportedLangs,
	setLang,
} from '../../store/features/translation';

// COMPONENTS
import {
	TouchableCard,
	FocusAwareStatusBar,
	PaperText,
	CustomScreenHeader,
} from '../../components/Common';
// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from '../../assets/ts/styles';

function TranslationScreen({}) {
	// ACTIONS
	const translate = useAppDispatch();

	// SELECTORS
	const currentLang = useAppSelector(getLang);
	const languages = useAppSelector(getLanguage);

	const STYLES = StyleSheet.create({
		container: { ...GS.screen },
		scrollView: {
			...GS.h100,
			...GS.pt4,
			...GS.px2,
			...GS.bgLight,
		},
		langItem: { ...GS.inlineItems, ...GS.mb2 },
		langItemCard: { ...GS.w100, borderRadius: 5 },
		langItemCardContent: { borderRadius: 0 },
	});

	return (
		<View style={STYLES.container}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor='transparent'
				barStyle='light-content'
			/>
			<CustomScreenHeader
				title={languages.LANGUAGE_VIEW.TITLE}
				showHomeBtn
			/>

			<ScrollView
				style={STYLES.scrollView}
				overScrollMode='never'
				showsVerticalScrollIndicator={false}>
				{Object.keys(supportedLangs).map((lang: string, id) => {
					const L = lang as supportedLangType;

					return (
						<TouchableCard
							key={id}
							style={STYLES.langItem}
							cardStyle={STYLES.langItemCard}
							cardStyleContent={STYLES.langItemCardContent}
							height={CS.FONT_SIZE_MD * 3}
							onPress={() => translate(setLang(L))}>
							<View
								style={{
									...GS.justifyContentBetween,
									...GS.w100,
								}}>
								<PaperText
									style={{
										...GS.txtCapitalize,
										color: CC.primary,
										fontSize: CS.FONT_SIZE_MD,
									}}>
									{
										// @ts-ignore
										languages[lang]
									}
								</PaperText>

								<RadioButton
									status={
										lang === currentLang
											? 'checked'
											: 'unchecked'
									}
									uncheckedColor={CC.primaryHightLight}
									value={lang}
									onPress={() => translate(setLang(L))}
								/>
							</View>
						</TouchableCard>
					);
				})}
			</ScrollView>
		</View>
	);
}

export default TranslationScreen;
