import { env } from "cloudflare:workers";
import type { RouteMiddleware } from "rwsdk/router";

import { setupSessionStore } from "@/lib/session/store";
import { requireOnboarding } from "@/middleware/onboarding-interruptor";
import { sessionMiddleware } from "@/middleware/session-middleware";

/**
 * Central application middleware that runs on every request.
 * Handles url context setup, user auth and session loading, and onboarding flow checks.
 */
export const appMiddleware: RouteMiddleware = async ({ ctx, request }) => {
	const url = new URL(request.url);
	ctx.authUrl = url.origin;

	// Setup session store with environment
	setupSessionStore(env);

	// Use unified session middleware
	await sessionMiddleware({ ctx, request });

	// Check if user needs onboarding
	await requireOnboarding({ ctx, request });
};
