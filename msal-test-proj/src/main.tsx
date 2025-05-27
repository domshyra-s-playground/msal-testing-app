import "./index.css";

import App from "./App.tsx";
import { MsalProvider } from "@azure/msal-react";
import { Provider as ReduxProvider } from "react-redux";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { msalInstance } from "@msal/authConfig.ts";
import setupStore from "@redux/store.ts";

const store = setupStore({});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ReduxProvider store={store}>
			<MsalProvider instance={msalInstance}>
				<App />
			</MsalProvider>
		</ReduxProvider>
	</StrictMode>
);
