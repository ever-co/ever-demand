import { configureStore } from "@reduxjs/toolkit";

// REDUCERS
import navigationReducer from "./features/navigation/slice";

export const store = configureStore({
	reducer: {
		navigation: navigationReducer,
	},
});

// TYPES
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
