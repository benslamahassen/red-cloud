import { auth } from "@/lib/auth";
import type { AppContext } from "@/types/app";

/**
 * Onboarding interruptor that checks if authenticated users need to complete onboarding.
 * Sets ctx.needsOnboarding flag for UI components to display onboarding modals.
 */
export const requireOnboarding = async ({
	ctx,
	request,
}: { ctx: AppContext; request: Request }) => {
	// Skip onboarding check for API routes and auth routes
	const url = new URL(request.url);
	if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) {
		return;
	}

	// Check if user is authenticated but missing profile data (name)
	if (ctx.user && !ctx.user.name) {
		// Use better-auth API to get fresh session data (already loaded in app middleware)
		// Since app middleware runs before this interruptor, ctx.user should already be fresh
		// But we can double-check by refetching if needed
		try {
			const sessionResult = await auth.api.getSession({
				headers: request.headers,
				query: {
					disableCookieCache: true,
				},
			});

			// Only show onboarding if the user truly doesn't have a name
			if (sessionResult?.user && !sessionResult.user.name) {
				ctx.needsOnboarding = true;
			}
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("Error checking user onboarding status:", error);
			}
			// Fallback to session data if API check fails
			ctx.needsOnboarding = true;
		}
	}
};
