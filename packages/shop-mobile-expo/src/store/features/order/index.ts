import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import asyncStorage from '@react-native-async-storage/async-storage';

// TYPES
import type { RootState } from '../../index';
import type { OrderStateInterface } from './types';

const initialState: OrderStateInterface = {
	preSelectedProduct: null,
	selectedProduct: null,
};

export const SLICE = createSlice({
	name: 'order',
	initialState,
	reducers: {
		setPreselectedProduct: (
			state,
			action: PayloadAction<OrderStateInterface['preSelectedProduct']>,
		) => {
			state.preSelectedProduct = action.payload;

			asyncStorage.setItem('order', JSON.stringify(state));
		},
		setSelectedProduct: (
			state,
			action: PayloadAction<OrderStateInterface['preSelectedProduct']>,
		) => {
			state.selectedProduct = action.payload;

			asyncStorage.setItem('order', JSON.stringify(state));
		},
	},
});

// ACTIONS
export const setPreselectedProduct = SLICE.actions.setPreselectedProduct;
export const setSelectedProduct = SLICE.actions.setSelectedProduct;

// SELECTORS
export const getPreselectedProduct = (state: RootState) =>
	state.order.preSelectedProduct;
export const getSelectedProduct = (state: RootState) =>
	state.order.selectedProduct;

export default SLICE.reducer;
