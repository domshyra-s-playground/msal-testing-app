import { login } from "src/msal/authorization";
import { useState } from "react";

const UnauthedPage = () => {
	const [password, setPassword] = useState<string>("password");

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
		</div>
	);
};

export default UnauthedPage;
