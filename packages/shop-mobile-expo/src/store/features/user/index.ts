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
		setUser: (state, action: PayloadAction<UserStateType>) => {
			state.data = action.payload.data;
			state.isLoggedIn = action.payload.isLoggedIn;
			state.productViewType = action.payload.productViewType;

			asyncStorage.setItem('user', JSON.stringify(state));
		},
		setData: (state, action: PayloadAction<any>) => {
			state.data = action.payload;

			asyncStorage.setItem('user', JSON.stringify(state));
		},
		onUserSignUpByAddressSuccess: (state, action: PayloadAction<any>) => {
			state.data = action.payload;
			state.isLoggedIn = true;

			asyncStorage.setItem('user', JSON.stringify(state));
		},
		setProductViewType: (
			state,
			action: PayloadAction<ENV['PRODUCTS_VIEW_TYPE']>,
		) => {
			state.productViewType = action.payload;

			asyncStorage.setItem('user', JSON.stringify(state));
		},
		resetUser: (state) => {
			state.data = INITIAL_STATE.data;
			state.isLoggedIn = INITIAL_STATE.isLoggedIn;

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
export const resetUser = navigationSlice.actions.resetUser;

// SELECTORS
export const getUserObject = (state: RootState) => state.user;
export const getUserData = (state: RootState) => state.user.data;
export const getProductViewType = (state: RootState) =>
	state.user.productViewType;

export default navigationSlice.reducer;
