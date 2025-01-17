import { login, loginWithBearerToken } from "./msal/authorization";

import { useState } from "react";

const UnauthedPage = () => {
	const [password, setPassword] = useState<string>("password");
	const [bearerToken, setBearerToken] = useState<string>("");

	const handleBearerToken = () => {
		loginWithBearerToken(JSON.parse(bearerToken));
	};
	return (
		<div>
			<h1>Unauthed Page</h1>
			<p>You are not authenticated</p>

			<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
			<button onClick={() => login(password)}>Login</button>
			<br />
			<br />
			<br />
			<a href="/authed">Go to Authed Page</a>
			<br />
			<br />
			<br />
			<button onClick={handleBearerToken}>Login with bearer token</button>
			<input value={bearerToken} onChange={(e) => setBearerToken(e.target.value)} />
		</div>
	);
};

export default UnauthedPage;
