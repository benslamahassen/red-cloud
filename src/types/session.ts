import type { User } from "@/db/schema/auth-schema";

export interface SessionData {
	userId: string;
	user: User | null;
	createdAt: number;
	lastAccessed: number;
}
