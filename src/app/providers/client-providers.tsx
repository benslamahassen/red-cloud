"use client";

import { ThemeProvider } from "@/app/components/navigation/theme-provider";
import type { ReactNode } from "react";

interface ClientProvidersProps {
	children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
	return (
		<ThemeProvider defaultTheme="system" storageKey="red-cloud-theme">
			{children}
		</ThemeProvider>
	);
}
