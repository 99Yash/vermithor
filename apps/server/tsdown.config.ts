import { defineConfig } from "tsdown";

export default defineConfig({
	entry: "./src/index.ts",
	format: "esm",
	outDir: "./dist",
	clean: true,
	noExternal: ["@vermithor/api", "@vermithor/auth", "@vermithor/db", "@vermithor/redis"],
});
