import { BrowserCacheLocation, LogLevel, PublicClientApplication } from "@azure/msal-browser";

//TODO! input your own values below
const clientId = "TODO - Add clientId";
const tenantId = "TODO";
const redirectUri = "https://localhost:3000";
const clientSecret = "TODO";
const testUsername = "TODO";

export { clientId, tenantId, redirectUri, clientSecret, testUsername };

export const msalConfig = {
	auth: {
		clientId: clientId,
		authority: `https://login.microsoftonline.com/${tenantId}`, // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
		redirectUri: redirectUri,
	},
	cache: {
		cacheLocation: BrowserCacheLocation.SessionStorage, // This configures where your cache will be stored
		storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
	},
	system: {
		logLevel: LogLevel.Verbose,
		loggerCallback: (level: LogLevel, message: string, _containsPii: boolean) => {
			switch (level) {
				case LogLevel.Error:
					console.error(message);
					return;
				case LogLevel.Info:
					console.info(message);
					return;
				case LogLevel.Verbose:
					console.debug(message);
					return;
				case LogLevel.Warning:
					console.warn(message);
					return;
			}
		},
		piiLoggingEnabled: false,
		allowPlatformBroker: false,
	},
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
	scopes: ["User.Read"],
};

export const defaultScope = `${clientId}/.default`;
export const readScope = `${clientId}/User.Read`;

export const scopes = [defaultScope, readScope];
