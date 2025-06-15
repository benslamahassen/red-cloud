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
		// Double-check with fresh data from the database to avoid stale session data
		try {
			const { db } = await import("@/db");
			const { user } = await import("@/db/schema/auth-schema");
			const { eq } = await import("drizzle-orm");

			const freshUser = await db
				.select({ name: user.name })
				.from(user)
				.where(eq(user.id, ctx.user.id))
				.get();

			// Only show onboarding if the user truly doesn't have a name in the database
			if (!freshUser?.name) {
				ctx.needsOnboarding = true;
			}
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("Error checking user onboarding status:", error);
			}
			// Fallback to session data if database check fails
			ctx.needsOnboarding = true;
		}
	}
};
