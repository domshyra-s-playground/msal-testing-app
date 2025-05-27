import {
	AccountInfo,
	AuthenticationResult,
	AuthenticationScheme,
	ExternalTokenResponse,
	IdTokenClaims,
	LoadTokenOptions,
	PublicClientApplication,
	SilentRequest,
} from "@azure/msal-browser";
import {
	AuthorizationState,
	MsalAccessTokenEntity,
	MsalAccountEntity,
	MsalCredentialEntity,
	MsalRefreshTokenEntity,
	buildTenantProfile,
	checkForSeleniumTokensInSessionStorage,
	retrieveAuthenticationTokens,
} from "@msal/authorization";
import { defaultScope, msalConfig, msalInstance, scopes, tenantId } from "@msal/authConfig";
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
	const authorization = useAppSelector((state) => state.authorization as AuthorizationState);
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
				account: {
					homeAccountId: auth.account.homeAccountId,
					environment: auth.account.environment,
					tenantId: auth.account.tenantId,
					username: auth.account.username,
					localAccountId: auth.account.localAccountId,
					name: auth.account.name,
					authorityType: auth.account.authorityType,
					idTokenClaims: auth.account.idTokenClaims,
					idToken: auth.account.idToken,
					tenantProfiles: buildTenantProfile(tenantId, auth.account.localAccountId, auth.account.name!), // Build tenant profile for the account
				},
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

	const accessTokenConfig = useCallback((account: AccountInfo) => {
		return {
			scopes: [defaultScope],
			account: {
				...account, // Use the first account if available
				tenantProfiles: buildTenantProfile(tenantId, account.localAccountId, account.name!), // Build tenant profile for the account
			},
		} as SilentRequest;
	}, []);

	/**
	 * Acquire a token for the user
	 */
	const acquireToken = useCallback(async () => {
		try {
			console.log("calling acquireTokenSilent");
			//MSAL uses a cache to store tokens based on specific parameters including scopes, resource and authority, and will retrieve the token from the cache when needed.
			//It also can perform silent renewal of those tokens when they have expired. MSAL exposes this functionality through the acquireTokenSilent method.
			const tokenResponse = await instance.acquireTokenSilent(accessTokenConfig(accounts[0]));
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
	}, [instance, accessTokenConfig, authorize, expiresOn]);

	// Acquire a token if there is no token or the token has expired
	// This should be called via navs in ProtectedRoute, and will be skipped if it's a selenium test (which looks at the session storage for tokens)
	useEffect(() => {
		if (authorization?.accessToken === null && initialized && !checkForSeleniumTokensInSessionStorage()) {
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

	//This use effect is specifically for Selenium testing, which uses session storage to set tokens
	useEffect(() => {
		const selenium = async () => {
			if (isLocalOrDevEnvironment() && initialized && checkForSeleniumTokensInSessionStorage()) {
				const externalTokenResult = await setTokenForSelenium(); //tokens will be removed from session storage after this call
				if (externalTokenResult) {
					//If we have a token, we can set it in the redux store
					instance.setActiveAccount(externalTokenResult.account);
					const tokenResponse = await instance.acquireTokenSilent(accessTokenConfig(externalTokenResult.account));
					authorize({ ...tokenResponse });
					setExpiresOn(JSON.stringify(tokenResponse.expiresOn));
				} else {
					console.warn("No token found for Selenium testing");
				}
			}
		};
		selenium();
	}, [accessTokenConfig, authorize, initialized, instance]);
}

/**
 * Sets the token for Selenium testing.
 *
 */
async function setTokenForSelenium() {
	if (!checkForSeleniumTokensInSessionStorage()) {
		return null;
	}
	//Used for Msal to get a token in dev/local for testing
	const {
		seleniumIdToken,
		seleniumAccount,
		seleniumAccessToken,
		seleniumRefreshToken,
	}: {
		seleniumIdToken: MsalCredentialEntity;
		seleniumAccount: MsalAccountEntity;
		seleniumAccessToken: MsalAccessTokenEntity;
		seleniumRefreshToken: MsalRefreshTokenEntity;
	} = retrieveAuthenticationTokens();

	//We need to have default and User.Read for scopes for this to work
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
			tenantProfiles: buildTenantProfile(tenantId, seleniumAccount.localAccountId, seleniumAccount.name), //note: this is build because JS doesn't support this property when Json.stringify is called
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
		await msalInstance.initialize();
		await msalInstance.handleRedirectPromise();
		await pca.initialize();
		pca.getAllAccounts();
		const authenticationResult = await pca.getTokenCache().loadExternalTokens(silentRequest, serverResponse, loadTokenOptions);
		const authenticationResult2 = await msalInstance.getTokenCache().loadExternalTokens(silentRequest, serverResponse, loadTokenOptions);

		pca.setActiveAccount(authenticationResult.account);
		msalInstance.setActiveAccount(authenticationResult2.account);

		console.log(JSON.stringify(authenticationResult));
		window.sessionStorage.removeItem("seleniumIdTokenKey");
		window.sessionStorage.removeItem("seleniumAccountKey");
		window.sessionStorage.removeItem("seleniumAccessTokenKey");
		window.sessionStorage.removeItem("seleniumRefreshTokenKey");
		console.log("Tokens set for Selenium");

		return authenticationResult;
	} catch (error: any) {
		console.error(error);
	}

	return null;
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
