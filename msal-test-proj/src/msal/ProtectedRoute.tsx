import { AccountInfo, InteractionStatus, InteractionType } from "@azure/msal-browser";
import { MsalAuthenticationTemplate, useIsAuthenticated, useMsal } from "@azure/msal-react";

import { Outlet } from "react-router-dom";
import { useAppSelector } from "@redux/hooks";
import useAuthentication from "../../src/hooks/useAuthentication";
import { useEffect } from "react";

function ProtectedRoute() {
	useAuthentication();
	const { inProgress }: { inProgress: InteractionStatus; accounts: AccountInfo[] } = useMsal();
	const isAuthenticated = useIsAuthenticated();
	const authorization = useAppSelector((state) => state.authorization);

	//Note isAuthenticated is just here to console log

	useEffect(() => {
		if (isAuthenticated) {
			console.log("User is authenticated via useIsAuthenticated");
			console.log("inProgress: ", inProgress);
		} else {
			console.log("User is NOT authenticated via useIsAuthenticated");
			console.log("inProgress: ", inProgress);
			const x = authorization?.account ? (JSON.parse(authorization?.account) as AccountInfo) : "";
			if (x instanceof Object) {
				console.log(JSON.stringify(x));
			}
		}
	}, [isAuthenticated, authorization.accessToken, inProgress, authorization?.account]);

	return (
		<MsalAuthenticationTemplate interactionType={InteractionType.Redirect}>
			{authorization.accessToken !== null ? <Outlet /> : "Not authenticated"}
		</MsalAuthenticationTemplate>
	);
}

export default ProtectedRoute;
