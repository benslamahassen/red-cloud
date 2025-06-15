import type { User } from "@/db/schema/auth-schema";
import type { SessionData } from "./session";

export interface SessionDurableObjectStub {
	getSession(): Promise<{ value: SessionData } | { error: string }>;
	saveSession(data: {
		userId: string;
		user?: User | null;
	}): Promise<SessionData>;
	updateUser(user: User): Promise<SessionData | null>;
	revokeSession(): Promise<void>;
}

export interface SessionStore {
	load: (request: Request) => Promise<SessionData | null>;
	save: (request: Request, data: Partial<SessionData>) => Promise<void>;
	remove: (request: Request) => Promise<void>;
	updateUser: (
		request: Request,
		user: User,
		forceRefresh?: boolean,
	) => Promise<void>;
}
