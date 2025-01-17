import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { AuthorizationState } from "../../interfaces/authorization";

const initialState: AuthorizationState = {
	accessToken: null,
	fromCache: false,
	expiresOn: null,
	scopes: [],
	uniqueId: null,
	userRoles: [],
	name: null,
	username: null,
	extExpiresOn: null,
};

/* istanbul ignore next */
const authorization = createSlice({
	name: "authorization",
	initialState: initialState,
	reducers: {
		/**
		 * Will only set if this is the first time we have seen it, or the cache has expired
		 * @param {*} state
		 * @param {*} action
		 * @returns
		 */
		setAuthorization: (state: AuthorizationState, action: PayloadAction<AuthorizationState>) => {
			if (!action) {
				return (state = { ...initialState });
			}
			if (!action.payload.fromCache || state.accessToken !== action.payload.accessToken) {
				return (state = {
					accessToken: action.payload.accessToken,
					fromCache: action.payload.fromCache,
					expiresOn: action.payload.expiresOn,
					scopes: action.payload.scopes,
					uniqueId: action.payload.uniqueId,
					userRoles: action.payload.userRoles,
					username: action.payload.username,
					name: action.payload.name,
					extExpiresOn: action.payload.extExpiresOn,
				});
			} else {
				return state;
			}
		},
	},
});

export const { setAuthorization } = authorization.actions;

export default authorization.reducer;
