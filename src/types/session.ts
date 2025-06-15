import type { User } from "@/db/schema/auth-schema";

export interface SessionData {
	userId: string;
	user: User | null;
	createdAt: number;
	lastAccessed: number;
}

export interface DeviceSession {
	session: {
		id: string;
		token: string;
		expiresAt: Date;
		createdAt: Date;
		updatedAt: Date;
		ipAddress?: string | null;
		userAgent?: string | null;
		userId: string;
	};
	user: {
		id: string;
		name: string | null;
		email: string;
		image?: string | null | undefined;
		emailVerified?: boolean;
		createdAt?: Date;
		updatedAt?: Date;
	};
}
