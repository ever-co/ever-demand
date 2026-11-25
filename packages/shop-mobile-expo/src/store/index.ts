import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, useStore } from 'react-redux';
import sessionReducer, { type SessionState } from './session';
import uiReducer from './ui';

const rootReducer = combineReducers({
	session: sessionReducer,
	ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function createAppStore(preloaded?: { session?: Partial<SessionState> }) {
	return configureStore({
		reducer: rootReducer,
		preloadedState: preloaded?.session
			? ({ session: { ...sessionReducer(undefined, { type: '@@init' }), ...preloaded.session } } as Partial<RootState>)
			: undefined,
	});
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

export const selectSession = (state: RootState) => state.session;
export const selectIsPaying = (orderId: string | null) => (state: RootState) =>
	!!orderId && state.ui.payingOrderIds.includes(orderId);
