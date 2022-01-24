import { createSlice, PayloadAction } from '@reduxjs/toolkit';

//import AsyncStorage from 'async';

// TYPES
import type { RootState } from '../../index';

type UserState = any;

const initialState: UserState = {
	get_token: null,
	get_inviteRequestId: null,
	get_userId: null,
	get_deviceId: null,
	get_orderId: null,
	get_language: null,
	get_orderWarehouseId: null,
	get_inviteSystem: null,
	get_registrationSystem: null,
	get_buyProduct: null,
	get_backToDetails: null,
	get_warehouseId: null,
	get_maintenanceMode: null,
	get_deliveryType: null,
	get_startOrderDate: null,
	get_endOrderTime: null,
	get_inviteAddress: null,
	get_serverConnection: null,
	get_inStore: null,
	get_shoppingCartData: null,
	isLogged: false,
};

export const navigationSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		set_token: () => {},
		set_inviteRequestId: () => {},
		set_userId: () => {},
		set_deviceId: () => {},
		set_orderId: () => {},
		set_language: () => {},
		set_orderWarehouseId: () => {},
		set_inviteSystem: () => {},
		set_registrationSystem: () => {},
		set_buyProduct: () => {},
		set_backToDetails: () => {},
		set_warehouseId: () => {},
		set_maintenanceMode: () => {},
		set_deliveryType: () => {},
		set_startOrderDate: () => {},
		set_endOrderTime: () => {},
		set_inviteAddress: () => {},
		set_serverConnection: () => {},
		set_inStore: () => {},
		set_shoppingCartData: () => {},
		clearInStore: () => {},
		clearMaintenanceMode: () => {},
		clear: () => {},
	},
});

// ACTIONS
export const userActions = navigationSlice.actions;

// SELECTORS
export const userSelectors = (state: RootState) => state.user;

export default navigationSlice.reducer;
