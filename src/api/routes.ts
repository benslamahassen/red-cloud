import { env } from "cloudflare:workers";
import { route } from "rwsdk/router";
import { ErrorResponse } from "rwsdk/worker";

import { auth } from "@/lib/auth";
import { getSessionStore } from "@/lib/session/store";

export const apiRoutes = [
	// Authentication routes
	route("/api/auth/*", ({ request }) => {
		return auth.handler(request);
	}),

	// Session refresh route
	route("/api/session/refresh", async ({ request }) => {
		try {
			if (request.method !== "POST") {
				return new Response("Method not allowed", { status: 405 });
			}

			const sessionStore = getSessionStore();
			const sessionData = await sessionStore.load(request);

			if (!sessionData?.user) {
				return Response.json({ error: "No active session" }, { status: 401 });
			}

			// Return the current user data from the session
			return Response.json({ user: sessionData.user });
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("Session refresh error:", error);
			}

			// Propagate infrastructure errors
			if (error instanceof ErrorResponse) {
				throw error;
			}

			// For other errors, wrap in ErrorResponse for structured logging
			throw new ErrorResponse(500, "Failed to refresh session");
		}
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
