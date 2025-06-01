"use client";

import { link } from "@/app/shared/links";
import { setupAuthClient } from "@/lib/auth-client";
import { useTransition } from "react";
import { Button } from "./ui/button";

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
						window.location.href = link("/user/login");
					},
				},
			});
		});
	};

	return (
		<Button onClick={handleSignOut} disabled={isPending} className={className}>
			{isPending ? "Logging out..." : "Log Out"}
		</Button>
	);
}
