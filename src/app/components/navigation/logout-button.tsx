"use client";

import { Button } from "@/app/components/ui/button";
import { setupAuthClient } from "@/lib/auth/auth-client";
import { link } from "@/lib/utils/links";
import { LogOutIcon } from "lucide-react";
import { useTransition } from "react";

export function LogoutButton({
	className,
	authUrl,
}: { className?: string; authUrl: string }) {
	const [isPending, startTransition] = useTransition();
	const authClient = setupAuthClient(authUrl);

	const handleSignOut = () => {
		startTransition(() => {
			authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						window.location.href = link("/sign-in");
					},
				},
			});
		});
	};

	return (
		<Button
			variant="ghost"
			onClick={handleSignOut}
			disabled={isPending}
			className={className}
		>
			<LogOutIcon className="mr-2 size-4" />
			{isPending ? "Signing out..." : "Sign Out"}
		</Button>
	);
}
