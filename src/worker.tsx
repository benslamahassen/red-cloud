import { env } from "cloudflare:workers";
import { layout, render, route } from "rwsdk/router";
import { ErrorResponse, defineApp } from "rwsdk/worker";

import { Document } from "@/app/document/Document";
import { setCommonHeaders } from "@/app/document/headers";

import { AppLayout } from "@/app/layouts/app-layout";

import { Counter } from "@/app/pages/counter";
import { GuestbookPage } from "@/app/pages/guestbook/guestbook-page";
import { Landing } from "@/app/pages/landing";
import { NotFound } from "@/app/pages/not-found";
import { SignIn } from "@/app/pages/sign-in/sign-in-page";

import type { User } from "@/db/schema/auth-schema";

import { auth } from "@/lib/auth";
import { sessionMiddleware } from "@/lib/middleware/session-middleware";
import { getSessionStore, setupSessionStore } from "@/lib/session/store";
import {
	redirectIfAuth,
	requireAuth,
	requireOnboarding,
} from "@/lib/utils/interruptors";
import { ProfilePage } from "./app/pages/profile/profile-page";

// Export the durable object for Cloudflare runtime
export { SessionDurableObject } from "@/lib/session/session-do";

export type AppContext = {
	user: User | undefined;
	authUrl: string;
	needsOnboarding?: boolean;
};

export default defineApp([
	setCommonHeaders(),
	async ({ ctx, request }) => {
		const url = new URL(request.url);
		ctx.authUrl = url.origin;

		// Setup session store with environment
		setupSessionStore(env);

		// Use unified session middleware
		await sessionMiddleware({ ctx, request });

		// Check if user needs onboarding
		await requireOnboarding({ ctx, request });
	},

	route("/api/auth/*", ({ request }) => {
		return auth.handler(request);
	}),

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

	render(Document, [
		layout(AppLayout, [
			route("/", Landing),
			route("/sign-in", [redirectIfAuth, SignIn]),
			route("/guestbook", [requireAuth, GuestbookPage]),
			route("/counter", [requireAuth, Counter]),
			route("/profile", [requireAuth, ProfilePage]),
		]),
		route("*", NotFound),
	]),
]);
