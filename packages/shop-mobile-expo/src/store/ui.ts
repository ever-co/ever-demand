/**
 * In-memory UI state: the order modals (Ionic `ModalController`), the cards being paid
 * (`Store.isPaying`, kept in memory so it never outlives the app) and the network state.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Coordinates } from '../domain/types';

export type ModalState =
	| { type: 'order' }
	| { type: 'takeaway' }
	| { type: 'cancel' }
	| { type: 'issue'; orderId: string; isPaid: boolean; deliveryIssue: boolean; warehouseIssue: boolean }
	| { type: 'orderProducts'; orderId: string; confirmable: boolean }
	| { type: 'call' }
	| { type: 'map'; origin: Coordinates | null; destination: Coordinates | null }
	| { type: 'newCard'; orderId: string };

export interface UiState {
	modal: ModalState | null;
	payingOrderIds: string[];
	isOnline: boolean;
	/** Bumped when an order changes outside the order screens (Buy, add more), to refresh badges. */
	orderRevision: number;
}

export const initialUiState: UiState = {
	modal: null,
	payingOrderIds: [],
	isOnline: true,
	orderRevision: 0,
};

const uiSlice = createSlice({
	name: 'ui',
	initialState: initialUiState,
	reducers: {
		openModal: (state, action: PayloadAction<ModalState>) => {
			state.modal = action.payload;
		},
		closeModal: (state) => {
			state.modal = null;
		},
		startPaying: (state, action: PayloadAction<string>) => {
			if (!state.payingOrderIds.includes(action.payload)) {
				state.payingOrderIds.push(action.payload);
			}
		},
		stopPaying: (state, action: PayloadAction<string>) => {
			state.payingOrderIds = state.payingOrderIds.filter((id) => id !== action.payload);
		},
		setOnline: (state, action: PayloadAction<boolean>) => {
			state.isOnline = action.payload;
		},
		bumpOrderRevision: (state) => {
			state.orderRevision += 1;
		},
	},
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;
