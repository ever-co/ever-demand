import { configureStore } from '@reduxjs/toolkit';

// REDUCERS
import navigationReducer from './features/navigation';
import userReducer from './features/user';

export const store = configureStore({
	reducer: {
		user: userReducer,
		navigation: navigationReducer,
	},
});

// TYPES
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
