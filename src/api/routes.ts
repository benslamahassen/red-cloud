import { env } from "cloudflare:workers";
import { route } from "rwsdk/router";
import { ErrorResponse } from "rwsdk/worker";

import { auth } from "@/lib/auth";

export const apiRoutes = [
	// Authentication routes
	route("/api/auth/*", ({ request }) => {
		return auth.handler(request);
	}),

	// R2 avatar serving route
	route("/r2/avatars/:key", async ({ params }) => {
		if (!params.key) {
			return new Response("Not found", { status: 404 });
		}

		const object = await env.AVATARS_BUCKET.get(`avatars/${params.key}`);

		if (object === null) {
			return new Response("Not found", { status: 404 });
		}

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set("etag", object.httpEtag);

		return new Response(object.body, {
			headers,
		});
	}),
];
