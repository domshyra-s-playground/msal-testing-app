import "./App.css";

import { RouterProvider, createBrowserRouter } from "react-router-dom";

import AuthedPage from "./AuthedPage";
import Layout from "./Layout";
import ProtectedRoute from "./msal/ProtectedRoute";
import UnauthedPage from "./UnauthedPage";

/**
 * The router configuration for the whole application.
 */
const router = createBrowserRouter([
	{
		Component: Layout,
		children: [
			{
				element: <ProtectedRoute />,
				children: [{ path: "/authed", index: true, Component: AuthedPage }],
			},
			{
				path: "/",
				children: [{ index: true, Component: UnauthedPage }],
			},
		],
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
