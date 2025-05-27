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

	const seleniumRunner = useCallback(() => {
		return checkForSeleniumTokensInSessionStorage();
	}, []);

	return (
		<MsalAuthenticationTemplate interactionType={seleniumRunner() ? InteractionType.Silent : InteractionType.Redirect}>
			{authorization.accessToken !== null && isAuthenticated ? <Outlet /> : "Not authenticated"}
		</MsalAuthenticationTemplate>
	);
}

export default ProtectedRoute;
