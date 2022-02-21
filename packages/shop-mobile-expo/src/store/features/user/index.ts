import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import asyncStorage from '@react-native-async-storage/async-storage';

// TYPES
import type { UserStateType } from './types';
import type { RootState } from '../../index';

const INITIAL_STATE: UserStateType = {
	data: null,
	isLoggedIn: false,
};

export const navigationSlice = createSlice({
	name: 'user',
	initialState: INITIAL_STATE,
	reducers: {
		setData: (state, cation: PayloadAction<any>) => {
			state.data = cation.payload;
			asyncStorage.setItem('user', JSON.stringify(state));
		},
	},
});

// ACTIONS
export const setUserData = navigationSlice.actions.setData;

// SELECTORS
export const getUserObject = (state: RootState) => state.user;
export const getUserData = (state: RootState) => state.user.data;

export default navigationSlice.reducer;
