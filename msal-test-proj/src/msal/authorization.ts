import { IdTokenClaims, TenantProfile } from "@azure/msal-browser";
import { clientId, readScope } from "src/msal/authConfig";

import { jwtDecode } from "jwt-decode";

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

interface AadTokenResponse {
	access_token: string;
	expires_in: number;
	ext_expires_in: number;
	token_type: string;
	id_token: string;
	refresh_token: string;
}

interface msJwtPayload {
	aud: string;
	exp: number;
	iss: string;
	iat: number;
	nbf: number;
	sub: string;
	oid: string;
	preferred_username: string;
	tid: string;
	name: string;
	roles: string[];
}

const target = ["openid", "profile", "offline_access", readScope.toLowerCase()].join(" ");

const loginWithBearerToken = async (token: AadTokenResponse) => {
	const idToken = jwtDecode<msJwtPayload>(token.id_token);
	const localAccountId = idToken.oid;
	const realm = idToken.tid;
	const homeAccountId = `${localAccountId}.${realm}`;
	const username = idToken.preferred_username;
	const name = idToken.name;

	const claimsDictionary: { [key: string]: any } = {} as { [key in keyof msJwtPayload]: any };

	Object.keys(idToken).forEach((key) => {
		if (key === "roles") {
			if (claimsDictionary[key]) {
				claimsDictionary[key] = [...claimsDictionary[key], idToken[key]];
			} else {
				claimsDictionary[key] = [idToken[key]];
			}
		} else {
			claimsDictionary[key] = idToken[key as keyof msJwtPayload];
		}
	});

	const seleniumIdToken: MsalCredentialEntity = buildIdTokenEntity(token.id_token, homeAccountId, realm);
	const seleniumAccount: MsalAccountEntity = buildAccountEntity(homeAccountId, realm, localAccountId, username, name, claimsDictionary);
	const seleniumAccessToken: MsalAccessTokenEntity = buildAccessTokenEntity(token, homeAccountId, realm);
	const seleniumRefreshToken: MsalRefreshTokenEntity = buildRefreshTokenEntity(token.refresh_token, token.expires_in, homeAccountId, realm);

	window.sessionStorage.setItem("seleniumIdTokenKey", JSON.stringify(seleniumIdToken));
	window.sessionStorage.setItem("seleniumAccountKey", JSON.stringify(seleniumAccount));
	window.sessionStorage.setItem("seleniumAccessTokenKey", JSON.stringify(seleniumAccessToken));
	window.sessionStorage.setItem("seleniumRefreshTokenKey", JSON.stringify(seleniumRefreshToken));
};

const buildAccessTokenEntity = (tokenResponse: AadTokenResponse, homeAccountId: string, realm: string): MsalAccessTokenEntity => {
	const cachedAt = Math.floor(Date.now() / 1000).toString();
	const expiresOn = (Math.floor(Date.now() / 1000) + tokenResponse.expires_in).toString();
	const extendedExpiresOn = (Math.floor(Date.now() / 1000) + tokenResponse.ext_expires_in).toString();

	return {
		homeAccountId: homeAccountId,
		clientId: clientId,
		realm: realm,
		secret: tokenResponse.access_token,
		credentialType: "AccessToken",
		environment: "login.windows.net",
		target: target,
		cachedAt: cachedAt,
		expiresOn: expiresOn,
		extendedExpiresOn: extendedExpiresOn,
		tokenType: "Bearer",
	};
};

const buildAccountEntity = (
	homeAccountId: string,
	realm: any,
	localAccountId: string,
	username: string,
	name: string,
	claims: any
): MsalAccountEntity => {
	const clientInfo = btoa(JSON.stringify({ uid: localAccountId, utid: realm }));

	return {
		homeAccountId: homeAccountId,
		clientId: clientId,
		realm: realm,
		secret: "",
		credentialType: "Account",
		environment: "login.windows.net",
		target: target,
		localAccountId: localAccountId,
		username: username,
		authorityType: "MSSTS",
		name: name,
		clientInfo: clientInfo,
		idTokenClaims: claims,
		tenantProfiles: new Map<string, TenantProfile>(),
	};
};

const buildRefreshTokenEntity = (refreshToken: string, expiresIn: number, homeAccountId: string, realm: string): MsalRefreshTokenEntity => {
	const expiresOn = (Math.floor(Date.now() / 1000) + expiresIn).toString();

	return {
		homeAccountId: homeAccountId,
		clientId: clientId,
		realm: realm,
		secret: refreshToken,
		credentialType: "RefreshToken",
		environment: "login.windows.net",
		target: target,
		expiresOn: expiresOn,
	};
};

const buildIdTokenEntity = (idToken: string, homeAccountId: string, realm: string): MsalCredentialEntity => {
	return {
		homeAccountId: homeAccountId,
		clientId: clientId,
		realm: realm,
		secret: idToken,
		credentialType: "IdToken",
		environment: "login.windows.net",
		target: target,
	};
};

export { loginWithBearerToken };
