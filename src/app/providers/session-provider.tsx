"use client";

import { SessionContext } from "@/app/hooks/use-session";
import type { User } from "@/db/schema/auth-schema";
import { type ReactNode, useState } from "react";

interface SessionProviderProps {
	children: ReactNode;
	initialUser?: User;
}

export function SessionProvider({
	children,
	initialUser,
}: SessionProviderProps) {
	const [user, setUser] = useState<User | undefined>(initialUser);

	return (
		<SessionContext.Provider value={{ user, setUser }}>
			{children}
		</SessionContext.Provider>
	);
}
