import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { AuthorizationState } from "@msal/authorization";

const initialState: AuthorizationState = {
	accessToken: null,
	expiresOn: null,
	extExpiresOn: null,
	fromCache: false,
	name: null,
	scopes: [],
	uniqueId: null,
	username: null,
	userRoles: [],
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
					// account: action.payload.account,
					expiresOn: action.payload.expiresOn,
					extExpiresOn: action.payload.extExpiresOn,
					fromCache: action.payload.fromCache,
					name: action.payload.name,
					scopes: action.payload.scopes,
					uniqueId: action.payload.uniqueId,
					username: action.payload.username,
					userRoles: action.payload.userRoles,
				});
			} else {
				return state;
			}
		},
	},
});

export const { setAuthorization } = authorization.actions;

export default authorization.reducer;
