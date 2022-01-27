import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// TYPES
import type { RootState } from '../../index';

// CONSTANTS
import GROUPS, { GroupNameType } from '../../../router/groups.routes';

// LOCAL TYPES
export type NavigationGroupType = GroupNameType | null;
export type NavigationStateType = {
	group: GroupNameType | null;
};

const initialState: NavigationStateType = {
	group: GROUPS.LOADING,
};

export const navigationSlice = createSlice({
	name: 'navigation',
	initialState,
	reducers: {
		setGroup: (state, action: PayloadAction<NavigationGroupType>) => {
			state.group = action.payload;
		},
	},
});

// ACTIONS
export const { setGroup } = navigationSlice.actions;

// SELECTORS
export const getGroup = (state: RootState) => state.navigation.group;

export default navigationSlice.reducer;
