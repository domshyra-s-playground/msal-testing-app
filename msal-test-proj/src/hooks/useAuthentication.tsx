import {
	AuthenticationResult,
	AuthenticationScheme,
	ExternalTokenResponse,
	IdTokenClaims,
	LoadTokenOptions,
	PublicClientApplication,
	SilentRequest,
} from "@azure/msal-browser";
import { AuthorizationState, MsalAccessTokenEntity, MsalAccountEntity, MsalCredentialEntity, MsalRefreshTokenEntity } from "../msal/authorization";
import { defaultScope, msalConfig, scopes, tenantId } from "../msal/authConfig";
import { isLocalOrDevEnvironment, isProdEnv } from "@tools/env";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { useCallback, useEffect } from "react";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { setAuthorization } from "@slices/authorization";
import { useMsal } from "@azure/msal-react";
import { useState } from "react";

//TODO: this still seems to not set up the idTokenClaims properly, but not sure why. Works in the main app from login in manually
/**
 * Sets up the authentication for the app from MSAL and handles token expiration.
 */
export default function useAuthentication() {
	const authorization = useAppSelector((state: any) => state.authorization);
	dayjs.extend(duration);
	const { instance, accounts } = useMsal();

	const [expiresOn, setExpiresOn] = useState<null | string>(null);
	const [initialized, setInitialized] = useState<boolean>(false);

	const dispatch = useAppDispatch();

	const authorize = useCallback(
		(auth: AuthenticationResult) => {
			const transformedAuth: AuthorizationState = {
				accessToken: auth.accessToken,
				fromCache: auth.fromCache,
				scopes: auth.scopes,
				uniqueId: auth.uniqueId,
				userRoles: (auth.idTokenClaims as IdTokenClaims).roles,
				name: (auth.idTokenClaims as IdTokenClaims).name,
				username: auth.account.username,
				expiresOn: JSON.stringify(auth.expiresOn),
				extExpiresOn: JSON.stringify(auth.extExpiresOn),
			};

			dispatch(setAuthorization(transformedAuth));
		},
		[dispatch]
	);

	useEffect(() => {
		const initializeMsal = async () => {
			instance.initialize().then(() => {
				setInitialized(true);
			}); // Initialize MSAL instance
		};

		initializeMsal();
	}, [instance]);

	/**
	 * Acquire a token for the user
	 */
	const acquireToken = useCallback(async () => {
		const accessTokenConfig: SilentRequest = {
			scopes: [defaultScope],
			account: accounts[0],
		};
		try {
			console.log("calling acquireTokenSilent");
			//MSAL uses a cache to store tokens based on specific parameters including scopes, resource and authority, and will retrieve the token from the cache when needed.
			//It also can perform silent renewal of those tokens when they have expired. MSAL exposes this functionality through the acquireTokenSilent method.
			const tokenResponse = await instance.acquireTokenSilent(accessTokenConfig);
			//This will only be set if the token is not in the cache
			authorize({ ...tokenResponse });
			console.log("Token acquired", tokenResponse.accessToken);
			if (!tokenResponse.fromCache) {
				setExpiresOn(JSON.stringify(tokenResponse.expiresOn));
			} else {
				//Token can be in the msal cache, but we haven't set it in the hook state store
				if (expiresOn === null) {
					setExpiresOn(JSON.stringify(tokenResponse.expiresOn));
				}
			}
		} catch (error: any) {
			//TODO: Handle error
			console.log("Failed to acquire Token");
			console.error(error);
		}
	}, [accounts, instance, authorize, expiresOn]);

	// Acquire a token if there is no token or the token has expired
	//This should be called via navs in ProtectedRoute
	useEffect(() => {
		if (authorization?.accessToken === null && initialized) {
			console.log("New Token for redux");
			acquireToken();
		}
	}, [accounts, instance, accounts.length, authorization?.accessToken, authorization.expiresOn, acquireToken, initialized]);

	// Set up a timeout to acquire a new token before the current one expires
	useEffect(() => {
		if (expiresOn && isProdEnv()) {
			const { timeToExpireInMilliseconds } = getExpTimes(expiresOn);

			const timeout = setTimeout(() => {
				acquireToken();
			}, timeToExpireInMilliseconds);
			return () => {
				clearTimeout(timeout);
			};
		}
	}, [expiresOn, acquireToken]);

	useEffect(() => {
		const selenium = async () => {
			if (isLocalOrDevEnvironment() && initialized) {
				await setTokenForSelenium();
			}
		};
		selenium();
	}, [initialized]);
}

/**
 * Sets the token for Selenium testing.
 *
 */
async function setTokenForSelenium() {
	//Used for Msal to get a token in dev/local for testing
	const seleniumIdToken: MsalCredentialEntity = JSON.parse(window.sessionStorage.getItem("seleniumIdTokenKey") ?? "{}");
	const seleniumAccount: MsalAccountEntity = JSON.parse(window.sessionStorage.getItem("seleniumAccountKey") ?? "{}");
	const seleniumAccessToken: MsalAccessTokenEntity = JSON.parse(window.sessionStorage.getItem("seleniumAccessTokenKey") ?? "{}");
	const seleniumRefreshToken: MsalRefreshTokenEntity = JSON.parse(window.sessionStorage.getItem("seleniumRefreshTokenKey") ?? "{}");

	//We need to have default and User.Read for scopes for this to work
	if (
		Object.keys(seleniumIdToken).length !== 0 &&
		Object.keys(seleniumAccount).length !== 0 &&
		Object.keys(seleniumAccessToken).length !== 0 &&
		Object.keys(seleniumRefreshToken).length !== 0
	) {
		console.log("Setting token for Selenium");
		const silentRequest: SilentRequest = {
			scopes: scopes,
			authority: `https://login.microsoftonline.com/${tenantId}`,
			account: {
				homeAccountId: seleniumAccount.homeAccountId,
				environment: seleniumAccount.environment,
				tenantId: tenantId,
				username: seleniumAccount.username,
				localAccountId: seleniumAccount.localAccountId,
				name: seleniumAccount.name,
				authorityType: seleniumAccount.authorityType,
				idTokenClaims: seleniumAccount.idTokenClaims,
				idToken: seleniumIdToken.secret,
			},
		};

		const serverResponse: ExternalTokenResponse = {
			id_token: seleniumIdToken.secret,
			token_type: AuthenticationScheme.BEARER,
			scope: scopes.join(" "),
			access_token: seleniumAccessToken.secret,
			refresh_token: seleniumRefreshToken.secret,
			expires_in: 3599,
			client_info: seleniumAccount.clientInfo,
		};

		const loadTokenOptions: LoadTokenOptions = {
			clientInfo: seleniumAccount.clientInfo,
			extendedExpiresOn: 6599,
		};

		const pca = new PublicClientApplication(msalConfig);

		try {
			await pca.initialize();
			const authenticationResult = await pca.getTokenCache().loadExternalTokens(silentRequest, serverResponse, loadTokenOptions);

			console.log(JSON.stringify(authenticationResult));
			window.sessionStorage.removeItem("seleniumIdTokenKey");
			window.sessionStorage.removeItem("seleniumAccountKey");
			window.sessionStorage.removeItem("seleniumAccessTokenKey");
			window.sessionStorage.removeItem("seleniumRefreshTokenKey");
			console.log("Tokens set for Selenium");
		} catch (error: any) {
			console.error(error);
		}
	}
}

/**
 * Calculates the time remaining until the given expiration date.
 *
 * @param {string} expiresOn - The expiration date in string format.
 * @returns An object containing the current time, time to expire in milliseconds, and the expiration date.
 */
function getExpTimes(expiresOn: string) {
	const expiresOnDt = new Date(JSON.parse(expiresOn));
	const currentTime = new Date();
	const expiresOnDtDayJs = dayjs(expiresOnDt);
	const currentTimeDayJs = dayjs(currentTime);
	const timeToExpireInMilliseconds = expiresOnDtDayJs.diff(currentTimeDayJs);
	return { currentTime, timeToExpireInMilliseconds, expiresOnDt };
}
