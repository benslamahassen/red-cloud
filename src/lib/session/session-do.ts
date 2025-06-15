import { DurableObject } from "cloudflare:workers";
import type { User } from "@/db/schema/auth-schema";
import type { SessionData } from "@/types/session";

export class SessionDurableObject extends DurableObject {
	private session: SessionData | undefined = undefined;
	private readonly MAX_SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

	constructor(state: DurableObjectState, env: Env) {
		super(state, env);
		this.session = undefined;
	}

	async saveSession({
		userId,
		user = null,
	}: {
		userId: string;
		user?: User | null;
	}): Promise<SessionData> {
		if (!userId) {
			throw new Error("userId is required for session creation");
		}

		const session: SessionData = {
			userId,
			user,
			createdAt: Date.now(),
			lastAccessed: Date.now(),
		};

		try {
			await this.ctx.storage.put<SessionData>("session", session);
			this.session = session;
			return session;
		} catch (error) {
			console.error("Failed to save session:", error);
			throw new Error("Failed to save session data");
		}
	}

	async getSession(): Promise<{ value: SessionData } | { error: string }> {
		try {
			if (this.session) {
				// Update last accessed time for in-memory session
				this.session.lastAccessed = Date.now();
				await this.ctx.storage.put<SessionData>("session", this.session);
				return { value: this.session };
			}

			const session = await this.ctx.storage.get<SessionData>("session");

			if (!session) {
				return {
					error: "Invalid session",
				};
			}

			// Check if session has expired
			if (session.createdAt + this.MAX_SESSION_DURATION < Date.now()) {
				await this.revokeSession();
				return {
					error: "Session expired",
				};
			}

			// Update last accessed time
			session.lastAccessed = Date.now();
			await this.ctx.storage.put<SessionData>("session", session);
			this.session = session;
			return { value: session };
		} catch (error) {
			console.error("Failed to get session:", error);
			return {
				error: "Failed to retrieve session data",
			};
		}
	}

	async updateUser(user: User): Promise<SessionData | null> {
		try {
			if (!this.session) {
				const stored = await this.ctx.storage.get<SessionData>("session");
				if (!stored) {
					console.warn("Attempted to update user for non-existent session");
					return null;
				}
				this.session = stored;
			}

			// Check if session has expired before updating
			if (this.session.createdAt + this.MAX_SESSION_DURATION < Date.now()) {
				await this.revokeSession();
				return null;
			}

			this.session.user = user;
			this.session.lastAccessed = Date.now();
			await this.ctx.storage.put<SessionData>("session", this.session);
			return this.session;
		} catch (error) {
			console.error("Failed to update user in session:", error);
			return null;
		}
	}

	async revokeSession(): Promise<void> {
		try {
			await this.ctx.storage.delete("session");
			this.session = undefined;
		} catch (error) {
			console.error("Failed to revoke session:", error);
			throw new Error("Failed to revoke session");
		}
	}

	// Additional utility method to check session validity without updating access time
	async isSessionValid(): Promise<boolean> {
		try {
			const session = await this.ctx.storage.get<SessionData>("session");
			if (!session) return false;
			return session.createdAt + this.MAX_SESSION_DURATION >= Date.now();
		} catch (error) {
			console.error("Failed to check session validity:", error);
			return false;
		}
	}

	// Method to get session info without updating access time (for debugging/monitoring)
	async getSessionInfo(): Promise<{
		exists: boolean;
		createdAt?: number;
		lastAccessed?: number;
		userId?: string | null;
		hasUser?: boolean;
	}> {
		try {
			const session = await this.ctx.storage.get<SessionData>("session");
			if (!session) {
				return { exists: false };
			}

			return {
				exists: true,
				createdAt: session.createdAt,
				lastAccessed: session.lastAccessed,
				userId: session.userId,
				hasUser: !!session.user,
			};
		} catch (error) {
			console.error("Failed to get session info:", error);
			return { exists: false };
		}
	}
}
