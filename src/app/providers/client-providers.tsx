"use client";

import { ThemeProvider } from "@/app/components/navigation/theme-provider";
import { SessionProvider } from "@/app/providers/session-provider";
import type { User } from "@/db/schema/auth-schema";
import type { ReactNode } from "react";

interface ClientProvidersProps {
	children: ReactNode;
	initialUser?: User;
}

export function ClientProviders({
	children,
	initialUser,
}: ClientProvidersProps) {
	return (
		<SessionProvider initialUser={initialUser}>
			<ThemeProvider defaultTheme="system" storageKey="red-cloud-theme">
				{children}
			</ThemeProvider>
		</SessionProvider>
	);
}
