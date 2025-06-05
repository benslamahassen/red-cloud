import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/document/Document";
import { setCommonHeaders } from "@/app/document/headers";

import { Counter } from "@/app/pages/counter";
import { Guestbook } from "@/app/pages/guestbook";
import { Landing } from "@/app/pages/landing";
import { NotFound } from "@/app/pages/not-found";
import { Profile } from "@/app/pages/profile";
import { SignIn } from "@/app/pages/sign-in";
import { redirectIfAuth, requireAuth } from "@/app/shared/interruptors";
import type { User } from "@/db/schema/auth-schema";
import { auth } from "@/lib/auth";

export type AppContext = {
	user: User | undefined;
	authUrl: string;
};

export default defineApp([
	setCommonHeaders(),
	async ({ ctx, request }) => {
		const url = new URL(request.url);
		ctx.authUrl = url.origin;

		try {
			const session = await auth.api.getSession({
				headers: request.headers,
			});

			if (session?.user) {
				ctx.user = {
					...session.user,
					image: session.user.image ?? null,
				};
			}
		} catch (error) {
			console.error("Session error:", error);
		}
	},

	route("/api/auth/*", ({ request }) => {
		return auth.handler(request);
	}),

	render(Document, [
		route("/", Landing),
		route("/sign-in", [redirectIfAuth, SignIn]),
		route("/guestbook", [requireAuth, Guestbook]),
		route("/counter", [requireAuth, Counter]),
		route("/profile", [requireAuth, Profile]),
		route("*", NotFound),
	]),
]);
