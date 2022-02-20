import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// import AsyncStorage from 'async';

// TYPES
import type { RootState } from '../../index';

type UserState = any;

const initialState: UserState = {
	data: null,
};

export const navigationSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setData: (state, cation: PayloadAction<any>) => {
			state.data = cation.payload;
		},
	},
});

// ACTIONS
export const setUserData = navigationSlice.actions.setData;

// SELECTORS
export const getUserObject = (state: RootState) => state.user;
export const getUserData = (state: RootState) => state.user.data;

export default navigationSlice.reducer;
