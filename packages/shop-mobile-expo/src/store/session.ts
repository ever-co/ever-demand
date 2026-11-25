/**
 * Everything the Ionic `Store` service keeps in `localStorage` (feature inventory §5). It is
 * persisted to AsyncStorage (see `persist.ts`).
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { DeliveryType, type Language, RegistrationSystem } from '../domain/enums';

export interface SessionState {
	token: string | null;
	userId: string | null;
	deviceId: string | null;
	/** The device uuid sent to `device.create` (FAKE_UUID or generated once). */
	deviceUuid: string | null;
	inviteRequestId: string | null;
	inviteAddress: string | null;
	inviteSystem: boolean;
	registrationSystem: RegistrationSystem | null;
	language: Language | null;
	orderId: string | null;
	orderWarehouseId: string | null;
	deliveryType: DeliveryType;
	/** `startDate`: when the order tracking was first opened (ISO string). */
	startOrderDate: string | null;
	/** `endTime`: elapsed time frozen when the customer step ended. */
	endOrderTime: string | null;
	inStore: string | null;
	buyProduct: string | null;
	warehouseId: string | null;
	backToDetails: string | null;
	maintenanceMode: string | null;
	/** HTTP status of the last server check; `0` means unreachable. */
	serverConnection: number | null;
}

export const initialSessionState: SessionState = {
	token: null,
	userId: null,
	deviceId: null,
	deviceUuid: null,
	inviteRequestId: null,
	inviteAddress: null,
	inviteSystem: false,
	registrationSystem: null,
	language: null,
	orderId: null,
	orderWarehouseId: null,
	deliveryType: DeliveryType.Delivery,
	startOrderDate: null,
	endOrderTime: null,
	inStore: null,
	buyProduct: null,
	warehouseId: null,
	backToDetails: null,
	maintenanceMode: null,
	serverConnection: null,
};

const sessionSlice = createSlice({
	name: 'session',
	initialState: initialSessionState,
	reducers: {
		hydrate: (state, action: PayloadAction<Partial<SessionState>>) => ({ ...state, ...action.payload }),
		setUserId: (state, action: PayloadAction<string | null>) => {
			state.userId = action.payload;
		},
		setDevice: (state, action: PayloadAction<{ deviceId: string; deviceUuid: string }>) => {
			state.deviceId = action.payload.deviceId;
			state.deviceUuid = action.payload.deviceUuid;
		},
		setInviteRequest: (state, action: PayloadAction<{ id: string; address: string | null }>) => {
			state.inviteRequestId = action.payload.id;
			state.inviteAddress = action.payload.address;
		},
		setServerSettings: (
			state,
			action: PayloadAction<{ inviteSystem: boolean; registrationSystem: RegistrationSystem }>,
		) => {
			state.inviteSystem = action.payload.inviteSystem;
			state.registrationSystem = action.payload.registrationSystem;
		},
		setRegistrationSystem: (state, action: PayloadAction<RegistrationSystem>) => {
			state.registrationSystem = action.payload;
		},
		setLanguage: (state, action: PayloadAction<Language>) => {
			state.language = action.payload;
		},
		setOrder: (state, action: PayloadAction<{ orderId: string; warehouseId: string | null }>) => {
			state.orderId = action.payload.orderId;
			state.orderWarehouseId = action.payload.warehouseId;
		},
		/** End / cancel / issue: remove `_orderId`, `startDate` and `endTime`. */
		clearOrder: (state) => {
			state.orderId = null;
			state.startOrderDate = null;
			state.endOrderTime = null;
		},
		setDeliveryType: (state, action: PayloadAction<DeliveryType>) => {
			state.deliveryType = action.payload;
		},
		startOrderTimer: (state, action: PayloadAction<string>) => {
			if (!state.startOrderDate) {
				state.startOrderDate = action.payload;
			}
		},
		setEndOrderTime: (state, action: PayloadAction<string | null>) => {
			state.endOrderTime = action.payload;
		},
		setInStore: (state, action: PayloadAction<string | null>) => {
			state.inStore = action.payload;
		},
		/** "Browse first" Buy: remember what to buy after the invite. */
		setPendingBuy: (
			state,
			action: PayloadAction<{ buyProduct: string; warehouseId: string; backToDetails?: string }>,
		) => {
			state.registrationSystem = RegistrationSystem.Once;
			state.buyProduct = action.payload.buyProduct;
			state.warehouseId = action.payload.warehouseId;
			if (action.payload.backToDetails) {
				state.backToDetails = action.payload.backToDetails;
			}
		},
		clearPendingBuy: (state) => {
			state.buyProduct = null;
			state.warehouseId = null;
		},
		clearBackToDetails: (state) => {
			state.backToDetails = null;
		},
		setMaintenanceMode: (state, action: PayloadAction<string | null>) => {
			state.maintenanceMode = action.payload;
		},
		setServerConnection: (state, action: PayloadAction<number | null>) => {
			state.serverConnection = action.payload;
		},
	},
});

export const sessionActions = sessionSlice.actions;
export default sessionSlice.reducer;
