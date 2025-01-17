import { defineConfig } from "vite";
import fs from "fs";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	server: {
		port: 3000,
		https: {
			key: fs.readFileSync(".cert/key.pem"),
			cert: fs.readFileSync(".cert/cert.pem"),
		},
	},
});
