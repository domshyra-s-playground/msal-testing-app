function isProdEnv() {
	return import.meta.env.MODE !== "development";
}
/* istanbul ignore next */
const isLocalOrDevEnvironment = () => {
	return import.meta.env.MODE === "development" || import.meta.url?.includes("deployedURL");
};
/* istanbul ignore next */
const isLocal = () => {
	return import.meta.env.MODE === "development";
};

export { isProdEnv, isLocal, isLocalOrDevEnvironment };
