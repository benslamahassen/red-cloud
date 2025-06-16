import { Card, CardContent } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import type { RequestInfo } from "rwsdk/worker";
import { DeleteAccountButton } from "./components/delete-account-button";
import { ProfileInfo } from "./components/profile-info";
import { SessionManager } from "./components/session-manager";
import { SignOutButton } from "./components/sign-out-button";
import { getUserProfile } from "./functions";

export async function ProfilePage({ ctx, request }: RequestInfo) {
	if (!ctx.user) {
		throw new Error("User not authenticated");
	}

	// Fetch user profile data on server-side
	const userProfile = await getUserProfile(ctx.user.id as string);

	// Get the base URL for the auth client
	const url = new URL(request.url);
	const authUrl = `${url.protocol}//${url.host}`;

	return (
		<div className="container mx-auto max-w-4xl">
			<div className="space-y-4 sm:space-y-8">
				{/* Page Header */}
				<div className="space-y-2 text-center">
					<h1 className="font-bold text-2xl tracking-tight sm:text-3xl">
						Profile
					</h1>
					<p className="text-muted-foreground text-sm sm:text-base">
						Manage your account settings and profile information
					</p>
				</div>

				<Card className="bg-background">
					<CardContent className="space-y-3 sm:space-y-6">
						{/* Profile Information */}
						<ProfileInfo user={userProfile} />

						<Separator />

						{/* Active Sessions */}
						<SessionManager authUrl={authUrl} />

						<Separator />

						{/* Action Buttons */}
						<div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-x-3 sm:space-y-0">
							<SignOutButton authUrl={authUrl} />
							<DeleteAccountButton authUrl={authUrl} />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
