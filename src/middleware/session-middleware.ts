import { auth } from "@/lib/auth";
import { getSessionStore } from "@/lib/session/store";
import type { AppContext } from "@/types/app";
import { ErrorResponse } from "rwsdk/worker";

/**
 * Session middleware that handles user authentication and session loading.
 * This middleware loads user data from the session store and populates ctx.user.
 */
export const sessionMiddleware = async ({
	ctx,
	request,
}: {
	ctx: AppContext;
	request: Request;
}) => {
	try {
		// Get the initialized session store
		const sessionStore = getSessionStore();

		// First, try to load session from our durable object (canonical store)
		const sessionData = await sessionStore.load(request);

		if (sessionData?.user) {
			// Session found in durable object
			ctx.user = sessionData.user;
			return;
		}

		// Fallback: check Better-Auth for initial authentication
		const authSession = await auth.api.getSession({
			headers: request.headers,
		});

		if (authSession?.user) {
			// User authenticated via Better-Auth, seed the durable object
			const user = {
				...authSession.user,
				image: authSession.user.image ?? null,
			};

			ctx.user = user;

			// Save to durable object for future requests
			await sessionStore.save(request, {
				userId: authSession.user.id,
				user: user,
			});
		}
		// If neither source has a session, ctx.user remains undefined
	} catch (error) {
		// Log error but don't block the request
		if (process.env.NODE_ENV === "development") {
			console.error("Session middleware error:", error);
		}

		// If it's an infrastructure error, we might want to propagate it
		if (error instanceof ErrorResponse) {
			throw error;
		}

		// For other errors, continue without session
		ctx.user = undefined;
	}
};
