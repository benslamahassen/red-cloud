import type { User } from "@/db/schema/auth-schema";

/**
 * Application context type that defines the shape of data available
 * throughout the entire application via the ctx parameter.
 */
export type AppContext = {
	user: User | undefined;
	authUrl: string;
	needsOnboarding?: boolean;
};
