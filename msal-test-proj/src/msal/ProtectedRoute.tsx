import { AccountInfo, InteractionStatus, InteractionType } from "@azure/msal-browser";
import { AuthorizationState, checkForSeleniumTokensInSessionStorage } from "@msal/authorization";
import { MsalAuthenticationTemplate, useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useCallback, useEffect } from "react";

import { Outlet } from "react-router-dom";
import { useAppSelector } from "@redux/hooks";
import useAuthentication from "@hooks/useAuthentication";

function ProtectedRoute() {
	useAuthentication();
	const { inProgress, accounts }: { inProgress: InteractionStatus; accounts: AccountInfo[] } = useMsal();
	const isAuthenticated = useIsAuthenticated();
	const authorization = useAppSelector((state) => state.authorization as AuthorizationState);

	//Note isAuthenticated is just here to console log

	useEffect(() => {
		if (isAuthenticated) {
			console.log("User is authenticated via useIsAuthenticated");
			console.log("inProgress: ", inProgress);
		} else {
			console.log("User is NOT authenticated via useIsAuthenticated");
			console.log("inProgress: ", inProgress);
		}
	}, [isAuthenticated, authorization.accessToken, inProgress]);

	useEffect(() => {
		console.log("Account is ", accounts[0]);
	}, [accounts]);

	// This function seems like it shouldn't be necessary, but it is used to determine if we are running in a Selenium test environment
	// The assumption is that InteractionType.Redirect should be fine because we are calling `await instance.acquireTokenSilent(accessTokenConfig(externalTokenResult.account));`
	const seleniumRunner = useCallback(() => {
		return checkForSeleniumTokensInSessionStorage();
	}, []);

	if (import.meta.env.VITE_INTERACTION_TYPE === "Silent") {
		return (
			<MsalAuthenticationTemplate interactionType={InteractionType.Silent}>
				{authorization.accessToken !== null && isAuthenticated ? <Outlet /> : "Not authenticated"}
			</MsalAuthenticationTemplate>
		);
	} else {
		return (
			<MsalAuthenticationTemplate interactionType={InteractionType.Redirect}>
				{authorization.accessToken !== null && isAuthenticated ? <Outlet /> : "Not authenticated"}
			</MsalAuthenticationTemplate>
		);
	}

	// this code below works, but shouldn't be needed and should just work with the InteractionType.Redirect
	// return (
	// 	<MsalAuthenticationTemplate interactionType={seleniumRunner() ? InteractionType.Silent : InteractionType.Redirect}>
	// 		{isAuthenticated && authorization.accessToken !== null ? <Outlet /> : <LoadingOverlay open={true} />}
	// 	</MsalAuthenticationTemplate>
	// );
}

export default ProtectedRoute;
