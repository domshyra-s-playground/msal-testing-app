import { IdTokenClaims, TenantProfile } from "@azure/msal-browser";

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