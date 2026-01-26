import { defineConfig } from "drizzle-kit";
import { getDatabaseEnv } from "./src/env";

const { DATABASE_URL } = getDatabaseEnv();

export default defineConfig({
	schema: "./src/schema",
	out: "./src/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: DATABASE_URL,
	},
});
