import type { User } from "@/db/schema/auth-schema";

/**
 * Checks if the given user is the current authenticated user.
 * Safely handles null/undefined values.
 */
export function isCurrentUser(
	user: User | null | undefined,
	currentUser: User | null | undefined,
): boolean {
	if (!user || !currentUser) {
		return false;
	}
	return user.id === currentUser.id;
}

/**
 * Checks if the given user ID matches the current user's ID.
 * Useful for checking ownership of resources.
 */
export function isCurrentUserId(
	userId: string | null | undefined,
	currentUser: User | null | undefined,
): boolean {
	if (!userId || !currentUser) {
		return false;
	}
	return userId === currentUser.id;
}

/**
 * Gets the display name for a user, falling back to email if name is not available.
 */
export function getUserDisplayName(user: User | null | undefined): string {
	if (!user) {
		return "Unknown User";
	}
	return user.name || user.email || "Unknown User";
}

/**
 * Gets user initials for avatar fallbacks.
 */
export function getUserInitials(user: User | null | undefined): string {
	if (!user?.name) {
		return "U";
	}
	return user.name
		.split(" ")
		.map((name) => name[0])
		.join("")
		.toUpperCase()
		.substring(0, 2);
}
