"use client";

import type { User } from "@/db/schema/auth-schema";
import type {
	SessionContextType,
	SessionRefreshResponse,
	UseSessionReturn,
} from "@/types/hooks";
import { createContext, useContext } from "react";

export const SessionContext = createContext<SessionContextType | null>(null);

/**
 * Enhanced session hook that provides context-based user state management.
 * Supports efficient refresh without page reloads by calling the durable object directly.
 */
export function useSession(): UseSessionReturn {
	const context = useContext(SessionContext);

	if (!context) {
		throw new Error("useSession must be used within a SessionProvider");
	}

	const { user, setUser } = context;

	const refreshSession = async (): Promise<void> => {
		try {
			// Call our session refresh endpoint that will update the durable object
			// and return fresh user data
			const response = await fetch("/api/session/refresh", {
				method: "POST",
				credentials: "include",
			});

			if (response.ok) {
				const data = (await response.json()) as SessionRefreshResponse;
				if (data.user) {
					setUser(data.user);
				} else {
					setUser(undefined);
				}
			} else {
				// If refresh fails, fall back to page reload
				window.location.reload();
			}
		} catch (error) {
			console.error("Failed to refresh session:", error);
			// Fall back to page reload on error
			window.location.reload();
		}
	};

	const updateUser = (newUser: User): void => {
		setUser(newUser);
	};

	return {
		user,
		refreshSession,
		updateUser,
	};
}
