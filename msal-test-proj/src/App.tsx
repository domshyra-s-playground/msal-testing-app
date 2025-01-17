import "./App.css";

import { RouterProvider, createBrowserRouter } from "react-router-dom";

import AuthedPage from "src/AuthedPage";
import ProtectedRoute from "src/msal/ProtectedRoute";
import UnauthedPage from "src/UnAuthedPage";

/**
 * The router configuration for the whole application.
 */
const router = createBrowserRouter([
	{
		children: [
			{
				path: "/",
				children: [{ index: true, Component: UnauthedPage }],
			},
			{
				path: "/",
				element: <ProtectedRoute />,
				children: [{ index: true, Component: AuthedPage }],
			},
		],
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
