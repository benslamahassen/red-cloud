"use client";

import type { ReactNode } from "react";

import { ThemeProvider } from "@/app/components/navigation/theme-provider";
import { Toaster } from "@/app/components/ui/sonner";

interface ClientProvidersProps {
	children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
	return (
		<ThemeProvider defaultTheme="system" storageKey="red-cloud-theme">
			{children}
			<Toaster />
		</ThemeProvider>
	);
}
