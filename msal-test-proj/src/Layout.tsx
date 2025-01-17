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
	const { accounts, instance } = useMsal();

	const logout = () => {
		// Log the user out of their account
		instance.logoutRedirect();
	};

	return (
		<div className="App">
			{isAuthed ? <h5>Hello, @ {accounts[0]?.name} </h5> : null}
			{isAuthed ? <button onClick={() => logout()}>Logout</button> : null}
			<Outlet />
		</div>
	);
}

export default Layout;
