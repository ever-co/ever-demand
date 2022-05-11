import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import asyncStorage from '@react-native-async-storage/async-storage';

// TYPES
import type { UserStateType } from './types';
import type { RootState } from '../../index';

// ENVIRONNEMENT
import ENVIRONNEMENT from '../../../environments/environment';

const INITIAL_STATE: UserStateType = {
	data: {
		invite: null,
		user: null,
	},
	isLoggedIn: false,
	productViewType: ENVIRONNEMENT.PRODUCTS_VIEW_TYPE,
	orderInfoType: ENVIRONNEMENT.ORDER_INFO_TYPE,
};

export const navigationSlice = createSlice({
	name: 'user',
	initialState: INITIAL_STATE,
	reducers: {
		setUser: (state, action: PayloadAction<UserStateType>) => {
			state.data = action.payload.data;
			state.isLoggedIn = action.payload.isLoggedIn;
			state.productViewType = action.payload.productViewType;
			state.orderInfoType = action.payload.orderInfoType;

			asyncStorage.setItem('user', JSON.stringify(state));
		},
		setData: (state, action: PayloadAction<UserStateType['data']>) => {
			state.data = action.payload;

			asyncStorage.setItem('user', JSON.stringify(state));
		},
		onUserSignUpByAddressSuccess: (
			state,
			action: PayloadAction<UserStateType['data']>,
		) => {
			state.data = action.payload;
			state.isLoggedIn = true;

			asyncStorage.setItem('user', JSON.stringify(state));
		},
		setProductViewType: (
			state,
			action: PayloadAction<UserStateType['productViewType']>,
		) => {
			state.productViewType = action.payload;

			asyncStorage.setItem('user', JSON.stringify(state));
		},
		setOrderInfoType: (
			state,
			action: PayloadAction<UserStateType['orderInfoType']>,
		) => {
			state.orderInfoType = action.payload;

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
export const setOrderInfoType = navigationSlice.actions.setOrderInfoType;
export const resetUser = navigationSlice.actions.resetUser;

// SELECTORS
export const getUserObject = (state: RootState) => state.user;
export const getUserData = (state: RootState) => state.user.data;
export const getIsInvite = (state: RootState) =>
	!!(state?.user?.data?.invite && state?.user?.data?.user !== null);
export const getProductViewType = (state: RootState) =>
	state.user.productViewType;
export const getOrderInfoType = (state: RootState) => state.user.orderInfoType;

export default navigationSlice.reducer;
