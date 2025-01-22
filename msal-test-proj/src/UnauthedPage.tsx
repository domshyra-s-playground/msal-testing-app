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
			<h1>Unauthed Page</h1>
			<p>You are not authenticated</p>
			<br />
			<br />
			<br />
			<a href="/authed">{goToText}</a>
			<br />
			<br />
			<br />
			<textarea value={bearerToken} onChange={(e) => setBearerToken(e.target.value)} rows={5} cols={40} />
			<br />
			<br />
			<button onClick={handleBearerToken}>set sessionStorage & redirect</button>
		</div>
	);
};

export default UnauthedPage;
