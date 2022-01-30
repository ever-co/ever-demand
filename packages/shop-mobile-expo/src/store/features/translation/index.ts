import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// LANGUAGES
import LANGUAGES from "./lang";

// TYPES
import {
	supportedLangType,
	supportedLangsType,
	TranslationStateType,
} from "./types";
import type { RootState } from "../../index";

export const supportedLangs: supportedLangsType = {
	BULGARIAN: "BULGARIAN",
	ENGLISH: "ENGLISH",
	SPANISH: "SPANISH",
	HEBREW: "HEBREW",
	RUSSIAN: "RUSSIAN",
};
export const initialState: TranslationStateType = {
	lang: supportedLangs.ENGLISH,
};
export const translationSlice = createSlice({
	name: "translation",
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
	LANGUAGES[state.translation.lang];
export default translationSlice.reducer;
