import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import type { User } from "@/db/schema/auth-schema";
import { auth } from "@/lib/auth";
import { SESSION_CACHE_REFRESH_MS } from "@/lib/utils/constants";
import type { SessionData } from "@/types/session";
import type {
	SessionDurableObjectStub,
	SessionStore,
} from "@/types/session-api";
import type { WorkerEnv } from "@root/types/env";
import { eq } from "drizzle-orm";
import { ErrorResponse } from "rwsdk/worker";

const createSessionStore = (env: WorkerEnv): SessionStore => ({
	async load(request: Request): Promise<SessionData | null> {
		try {
			// Get session from better-auth first
			const authSession = await auth.api.getSession({
				headers: request.headers,
			});

			if (!authSession?.user || !authSession?.session) {
				return null;
			}

			// Get or create durable object session
			const sessionId = authSession.session.id;
			const durableObjectId = env.SESSION_DO.idFromName(sessionId);
			const durableObject = env.SESSION_DO.get(
				durableObjectId,
			) as unknown as SessionDurableObjectStub;

			const result = await durableObject.getSession();

			if ("error" in result) {
				// Fetch fresh user data from database
				const [dbUser] = await db
					.select()
					.from(user)
					.where(eq(user.id, authSession.user.id))
					.limit(1);

				const newSession = await durableObject.saveSession({
					userId: authSession.user.id,
					user: dbUser || authSession.user,
				});

				return newSession;
			}

			// Check if user data needs refresh (30-second cache)
			const needsRefresh =
				!result.value.user ||
				result.value.lastAccessed < Date.now() - SESSION_CACHE_REFRESH_MS;

			if (needsRefresh) {
				const [freshUser] = await db
					.select()
					.from(user)
					.where(eq(user.id, authSession.user.id))
					.limit(1);

				if (freshUser) {
					const updatedSession = await durableObject.updateUser(freshUser);
					if (updatedSession) {
						return updatedSession;
					}
				}
			}

			return result.value;
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("Error loading session:", error);
			}

			// Propagate infrastructure errors
			if (error instanceof ErrorResponse) {
				throw error;
			}

			// For other errors, wrap in ErrorResponse for consistent error handling
			throw new ErrorResponse(500, "Failed to load session");
		}
	},

	async save(request: Request, data: Partial<SessionData>): Promise<void> {
		// Skip no-op writes when data is empty
		if (!data.userId && !data.user) {
			return;
		}

		if (process.env.NODE_ENV === "development") {
			console.log("💾 [Session Save] Attempting to save session data:", {
				userId: data.userId,
				hasUser: !!data.user,
				userName: data.user?.name,
			});
		}

		try {
			const authSession = await auth.api.getSession({
				headers: request.headers,
			});
			if (!authSession?.session) {
				if (process.env.NODE_ENV === "development") {
					console.warn("⚠️ [Session Save] No valid auth session found");
				}
				return;
			}

			if (process.env.NODE_ENV === "development") {
				console.log("✅ [Session Save] Auth session validated");
			}

			const sessionId = authSession.session.id;
			const durableObjectId = env.SESSION_DO.idFromName(sessionId);
			const durableObject = env.SESSION_DO.get(
				durableObjectId,
			) as unknown as SessionDurableObjectStub;

			await durableObject.saveSession({
				userId: data.userId || authSession.user.id,
				user: data.user,
			});

			if (process.env.NODE_ENV === "development") {
				console.log(
					"✅ [Session Save] Session data saved successfully to durable object",
				);
			}
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("💥 [Session Save] Failed to save session:", error);
			}

			// Propagate infrastructure errors
			if (error instanceof ErrorResponse) {
				throw error;
			}

			// For other errors, wrap in ErrorResponse
			throw new ErrorResponse(500, "Failed to save session");
		}
	},

	async remove(request: Request): Promise<void> {
		if (process.env.NODE_ENV === "development") {
			console.log("🗑️ [Session Remove] Attempting to remove session");
		}

		try {
			const authSession = await auth.api.getSession({
				headers: request.headers,
			});
			if (!authSession?.session) {
				if (process.env.NODE_ENV === "development") {
					console.warn("⚠️ [Session Remove] No valid auth session found");
				}
				return;
			}

			if (process.env.NODE_ENV === "development") {
				console.log("✅ [Session Remove] Auth session validated");
			}

			const sessionId = authSession.session.id;
			const durableObjectId = env.SESSION_DO.idFromName(sessionId);
			const durableObject = env.SESSION_DO.get(
				durableObjectId,
			) as unknown as SessionDurableObjectStub;

			await durableObject.revokeSession();

			if (process.env.NODE_ENV === "development") {
				console.log(
					"✅ [Session Remove] Session removed successfully from durable object",
				);
			}
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("💥 [Session Remove] Failed to remove session:", error);
			}

			// Propagate infrastructure errors
			if (error instanceof ErrorResponse) {
				throw error;
			}

			// For other errors, wrap in ErrorResponse
			throw new ErrorResponse(500, "Failed to remove session");
		}
	},

	async updateUser(
		request: Request,
		userData: User,
	): Promise<void> {
		if (process.env.NODE_ENV === "development") {
			console.log("🔄 [Session Update] Attempting to update user in session:", {
				userId: userData.id,
				userName: userData.name,
			});
		}

		try {
			const authSession = await auth.api.getSession({
				headers: request.headers,
			});
			if (!authSession?.session) {
				if (process.env.NODE_ENV === "development") {
					console.warn("⚠️ [Session Update] No valid auth session found");
				}
				return;
			}

			if (process.env.NODE_ENV === "development") {
				console.log("✅ [Session Update] Auth session validated");
			}

			const sessionId = authSession.session.id;
			const durableObjectId = env.SESSION_DO.idFromName(sessionId);
			const durableObject = env.SESSION_DO.get(
				durableObjectId,
			) as unknown as SessionDurableObjectStub;

			await durableObject.updateUser(userData);

			if (process.env.NODE_ENV === "development") {
				console.log(
					"✅ [Session Update] User data updated successfully in durable object",
				);
			}
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("💥 [Session Update] Failed to update user:", error);
			}

			// Propagate infrastructure errors
			if (error instanceof ErrorResponse) {
				throw error;
			}

			// For other errors, wrap in ErrorResponse
			throw new ErrorResponse(500, "Failed to update user in session");
		}
	},
});

// Global session store instance
let sessionStore: SessionStore | null = null;

export const setupSessionStore = (env: WorkerEnv): SessionStore => {
	sessionStore = createSessionStore(env);
	return sessionStore;
};

export const getSessionStore = (): SessionStore => {
	if (!sessionStore) {
		throw new Error(
			"Session store not initialized. Call setupSessionStore first.",
		);
	}
	return sessionStore;
};
