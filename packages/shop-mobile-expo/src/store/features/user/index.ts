import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import asyncStorage from '@react-native-async-storage/async-storage';

// TYPES
import type ENV from '../../../environments/model';
import type { UserStateType } from './types';
import type { RootState } from '../../index';

const INITIAL_STATE: UserStateType = {
	data: null,
	isLoggedIn: false,
	productViewType: 'list',
};

export const navigationSlice = createSlice({
	name: 'user',
	initialState: INITIAL_STATE,
	reducers: {
		setUser: (state, cation: PayloadAction<UserStateType>) => {
			state.data = cation.payload.data;
			state.isLoggedIn = cation.payload.isLoggedIn;
			state.productViewType = cation.payload.productViewType;

			asyncStorage.setItem('user', JSON.stringify(state));
		},
		setData: (state, cation: PayloadAction<any>) => {
			state.data = cation.payload;

			asyncStorage.setItem('user', JSON.stringify(state));
		},
		onUserSignUpByAddressSuccess: (state, cation: PayloadAction<any>) => {
			state.data = cation.payload;
			state.isLoggedIn = true;

			asyncStorage.setItem('user', JSON.stringify(state));
		},
		setProductViewType: (
			state,
			cation: PayloadAction<ENV['PRODUCTS_VIEW_TYPE']>,
		) => {
			state.productViewType = cation.payload;

			asyncStorage.setItem('user', JSON.stringify(state));
		},
	},
});

// ACTIONS
export const setUser = navigationSlice.actions.setUser;
export const setUserData = navigationSlice.actions.setData;
export const onUserSignUpByAddressSuccess =
	navigationSlice.actions.onUserSignUpByAddressSuccess;
export const setProductViewType = navigationSlice.actions.setProductViewType;

// SELECTORS
export const getUserObject = (state: RootState) => state.user;
export const getUserData = (state: RootState) => state.user.data;
export const getProductViewType = (state: RootState) =>
	state.user.productViewType;

export default navigationSlice.reducer;
