import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// TYPES
import {
	supportedLangType,
	supportedLangsType,
	TranslationStateType,
} from './types';
import type { RootState } from '../../index';

// CONSTANTS

export const supportedLangs: supportedLangsType = {
	['bg-BG']: 'bg-BG',
	['en-US']: 'en-US',
	['es-ES']: 'es-ES',
	['he-IL']: 'he-IL',
	['ru-RU']: 'ru-RU',
};
export const initialState: TranslationStateType = {
	lang: supportedLangs['en-US'],
};

export const translationSlice = createSlice({
	name: 'translation',
	initialState,
	reducers: {
		setLang: (state, action: PayloadAction<supportedLangType>) => {
			state.lang = action.payload;
		},
	},
});

// ACTIONS
export const { setLang } = translationSlice.actions;

// SELECTORS
export const getLang = (state: RootState) => state.translation.lang;
export const getLanguage = (state: RootState) =>
	require(`../../../assets/i18n/${state.translation.lang}.json`);

export default translationSlice.reducer;
