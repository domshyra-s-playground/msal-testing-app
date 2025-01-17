import { combineReducers, configureStore } from "@reduxjs/toolkit";

import authorization from "./slices/authorization";

// Create the root reducer separately so we can extract the RootState type
const rootReducer = combineReducers({
	authorization,
});

//?https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
const setupStore = (preloadedState: any) => {
	return configureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(),
		preloadedState,
	});
};

export default setupStore;
