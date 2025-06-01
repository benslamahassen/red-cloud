import alchemy from "alchemy";
import { D1Database, KVNamespace, Website } from "alchemy/cloudflare";

const APP_NAME = "rw-cloud";

const app = await alchemy(APP_NAME, {
	phase: process.argv[2] === "destroy" ? "destroy" : "up",
	stage: process.argv[3],
	quiet: process.argv.includes("--quiet"),
	password: process.env.SECRET_ALCHEMY_PASSPHRASE,
});

const kv = await KVNamespace("site-sessions-storage", {
	title: `${APP_NAME}-site-sessions-storage`,
	adopt: true,
});

const db = await D1Database("site-users-db", {
	name: `${APP_NAME}-site-users-db`,
	adopt: true,
	migrationsDir: "src/db/migrations",
	primaryLocationHint: "wnam",
	readReplication: {
		mode: "auto",
	},
});

export const site = await Website("site", {
	name: `${APP_NAME}-site`,
	command: "bun clean && bun run build",
	main: "dist/worker/worker.js",
	assets: "dist/client",
	wrangler: {
		main: "src/worker.tsx",
	},
	compatibilityFlags: ["nodejs_compat"],
	observability: {
		enabled: true,
	},
	bindings: {
		DB: db,
		SESSIONS_KV: kv,
		BETTER_AUTH_SECRET: alchemy.secret(process.env.BETTER_AUTH_SECRET),
		RESEND_API_KEY: alchemy.secret(process.env.RESEND_API_KEY),
		RESEND_FROM_EMAIL: alchemy.secret(process.env.RESEND_FROM_EMAIL),
		GOOGLE_CLIENT_ID: alchemy.secret(process.env.GOOGLE_CLIENT_ID),
		GOOGLE_CLIENT_SECRET: alchemy.secret(process.env.GOOGLE_CLIENT_SECRET),
		GITHUB_CLIENT_ID: alchemy.secret(process.env.GITHUB_CLIENT_ID),
		GITHUB_CLIENT_SECRET: alchemy.secret(process.env.GITHUB_CLIENT_SECRET),
		CLOUDFLARE_ACCOUNT_ID: alchemy.secret(process.env.CLOUDFLARE_ACCOUNT_ID),
		CLOUDFLARE_DATABASE_ID: alchemy.secret(process.env.CLOUDFLARE_DATABASE_ID),
		CLOUDFLARE_D1_TOKEN: alchemy.secret(process.env.CLOUDFLARE_D1_TOKEN),
		APP_NAME: APP_NAME,
		BETTER_AUTH_URL: "http://localhost:5173",
	},
});

console.log(`➜  Cloudflare:   ${site.url}`);

await app.finalize();
