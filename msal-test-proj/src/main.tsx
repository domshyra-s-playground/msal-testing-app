import "./index.css";

import App from "./App.tsx";
import { MsalProvider } from "@azure/msal-react";
import { Provider as ReduxProvider } from "react-redux";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { msalInstance } from "@msal/msalConfig.ts";
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

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;