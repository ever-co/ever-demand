import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

// CONSTANTS
import ENV from '../environments/environment';

// REDUCERS
import navigationReducer from './features/navigation';
import translationReducer from './features/translation';
import userReducer from './features/user';
import orderReducer from './features/order';

export const store = configureStore({
	reducer: {
		user: userReducer,
		navigation: navigationReducer,
		translation: translationReducer,
		order: orderReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}).concat(logger),
	devTools: __DEV__ || !ENV.PRODUCTION,
});

// TYPES
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
