import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// TYPES
import type { RootState } from "../../index";

// CONSTANTS
import GROUPS from "./groups";

interface NavigationState {
	group: string;
}

const initialState: NavigationState = {
	group: GROUPS.LOADING,
};

export const navigationSlice = createSlice({
	name: "navigation",
	initialState,
	reducers: {
		setGroup: (state, action: PayloadAction<string>) => {
			state.group = action.payload;
		},
	},
});

// ACTIONS
export const { setGroup } = navigationSlice.actions;

// SELECTORS
export const getGroup = (state: RootState) => state.navigation.group;

export default navigationSlice.reducer;
