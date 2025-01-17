import { useIsAuthenticated, useMsal } from "@azure/msal-react";

import { Outlet } from "react-router-dom";

/**
 * Renders the layout of the application.
 * This consists of the AppBar, OfflineAlert, and the Outlet.
 *
 * @returns The layout component.
 */
function Layout() {
	const isAuthed = useIsAuthenticated();
	const { accounts } = useMsal();

	return (
		<div className="App">
			{isAuthed ? <h5>Hello, @ {accounts[0]?.name} </h5> : null}
			<Outlet />
		</div>
	);
}

export default Layout;
