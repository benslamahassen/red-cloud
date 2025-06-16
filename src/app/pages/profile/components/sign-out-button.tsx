"use client";

import { Button } from "@/app/components/ui/button";
import { setupAuthClient } from "@/lib/auth/auth-client";
import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface SignOutButtonProps {
	authUrl: string;
}

export function SignOutButton({ authUrl }: SignOutButtonProps) {
	const [isPending, startTransition] = useTransition();
	const authClient = setupAuthClient(authUrl);

	const handleSignOut = () => {
		startTransition(async () => {
			try {
				const { error } = await authClient.signOut();

				if (error) {
					console.error("Error signing out:", error);
					toast.error("Failed to sign out");
				} else {
					toast.success("Signed out successfully");
					// Redirect to home page after successful sign out
					window.location.href = "/";
				}
			} catch (error) {
				console.error("Error signing out:", error);
				toast.error("Failed to sign out");
			}
		});
	};

	return (
		<Button
			variant="outline"
			onClick={handleSignOut}
			disabled={isPending}
			className="flex w-full items-center justify-center space-x-2 text-sm sm:w-auto"
		>
			<LogOut className="h-4 w-4" />
			<span>{isPending ? "Signing out..." : "Sign Out"}</span>
		</Button>
	);
}
