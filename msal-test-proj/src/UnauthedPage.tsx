import { loginWithBearerToken } from "./msal/authorization";
import { useIsAuthenticated } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const UnauthedPage = () => {
	const navigate = useNavigate();
	const isAuthed = useIsAuthenticated();
	const [bearerToken, setBearerToken] = useState<string>("");

	const goToText = isAuthed ? "Go to Authed Page" : "Login with a page redirect";
	const handleBearerToken = () => {
		loginWithBearerToken(JSON.parse(bearerToken));
		navigate("/authed");
	};
	return (
		<div>
			<p>The link below should test that your app can connect with a user to the App registration via the regular auth flow. </p>
			<a href="/authed">{goToText}</a>
			<br />
			<br />
			<br />

			<h1>Silent Login Via loadExternalTokens</h1>
			<p>make sure you have a call to get a bearer token in postman</p>
			<p>Something to this effect</p>
			<img src="image.png" alt="alt text" width={"100%"} />
			<p>
				make sure your scope has these values <code>openid profile offline_access your-clientId/User.Read</code> where you'd replace{" "}
				<code>your-clientId</code> with your client id from your app registration.
			</p>
			<p>Once you get your bearer token, it should be in a format like this</p>
			<div style={{ textAlign: "center", background: "black", color: "white", padding: "10px" }}>
				<code>
					{`{
							"token_type": "Bearer",
							"scope": "your-clientId/User.Read",
							"expires_in": 4190,
							"ext_expires_in": 4190,
							"access_token": "ey...",
							"refresh_token": "...",
							"id_token": "ey..."
						}`}
				</code>
			</div>
			<p>
				After pasting the result into the textarea and hitting the "Set sessionStorage & silent redirect" button. You should get navigated to
				the <code>authed page</code> with a silent login using the session storage via the loadExternalTokens method. However this is popping
				up a redirect with a login prompt and from what I can tell all the proper tokens are set up in the session storage after the
				loadExternalTokens call is executed.
			</p>
			<img src="sessionStorage-after-btn-click.png" alt="alt text" width={"100%"} />
			<textarea value={bearerToken} onChange={(e) => setBearerToken(e.target.value)} rows={5} cols={40} />
			<br />
			<br />
			<button onClick={handleBearerToken}>set sessionStorage & silent redirect</button>
			<br />
			<br />
		</div>
	);
};

export default UnauthedPage;
