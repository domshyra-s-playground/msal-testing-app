import { IdTokenClaims, TenantProfile } from "@azure/msal-browser";
import { clientId, clientSecret, msalConfig, scopes, testUsername } from "src/msal/authConfig";

export type AuthorizationState = {
	accessToken: string | null;
	fromCache: boolean;
	expiresOn: string | null;
	scopes: Array<string>;
	uniqueId: string | null;
	userRoles: Array<string> | undefined;
	name: string | null | undefined;
	username: string | null;
	extExpiresOn: string | null;
};

export interface MsalCredentialEntity {
	homeAccountId: string;
	clientId: string;
	realm: string;
	secret: string;
	credentialType: string;
	environment: string;
	target: string;
}

export interface MsalAccessTokenEntity extends MsalCredentialEntity {
	cachedAt: string;
	expiresOn: string;
	extendedExpiresOn: string;
	tokenType: string;
}

export interface MsalRefreshTokenEntity extends MsalCredentialEntity {
	expiresOn: string;
}

export interface MsalAccountEntity extends MsalCredentialEntity {
	localAccountId: string;
	username: string;
	authorityType: string;
	name: string;
	clientInfo: string;
	idTokenClaims: IdTokenClaims & {
		[key: string]: string | number | string[] | object | undefined | unknown;
	};
	tenantProfiles: Map<string, TenantProfile>;
}

const login = async (password: string) => {
	const tokenUrl = `${msalConfig.auth.authority}/oauth2/v2.0/token`;
	const tokenScopes = ["openid", "profile", "offline_access", ...scopes].join(" ");

	const response = await fetch(tokenUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "password",
			client_id: clientId,
			client_secret: clientSecret,
			scope: tokenScopes,
			username: testUsername,
			password: password,
		}),
	});

	const data = await response.json();
	console.log(data);

	window.sessionStorage.setItem("seleniumIdTokenKey", JSON.stringify(data.id_token));
	window.sessionStorage.setItem("seleniumAccountKey", JSON.stringify(data.account));
	window.sessionStorage.setItem("seleniumAccessTokenKey", JSON.stringify(data.access_token));
	window.sessionStorage.setItem("seleniumRefreshTokenKey", JSON.stringify(data.refresh_token));
};

export { login };