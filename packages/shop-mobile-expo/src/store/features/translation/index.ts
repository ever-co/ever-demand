import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// LANGUAGES
import LANGUAGES from './lang';

// TYPES
import {
	supportedLangType,
	supportedLangsType,
	TranslationStateType,
} from './types';
import type { RootState } from '../../index';

export const supportedLangs: supportedLangsType = {
	BULGARIAN: 'BULGARIAN',
	ENGLISH: 'ENGLISH',
	HEBREW: 'HEBREW',
	FRENCH: 'FRENCH',
	RUSSIAN: 'RUSSIAN',
	SPANISH: 'SPANISH',
};
export const initialState: TranslationStateType = {
	lang: supportedLangs.ENGLISH,
};
export const translationSlice = createSlice({
	name: 'translation',
	initialState,
	reducers: {
		setLang: (state, action: PayloadAction<supportedLangType>) => {
			state.lang = action.payload;

			AsyncStorage.setItem('translation', JSON.stringify(state));
		},
	},
});

// ACTIONS
export const { setLang } = translationSlice.actions;

// SELECTORS
export const getLang = (state: RootState) => state.translation.lang;
export const getLanguage = (state: RootState) =>
	LANGUAGES[state.translation.lang];

// REDUCER
export default translationSlice.reducer;
