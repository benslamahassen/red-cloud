import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import type { RequestInfo } from "rwsdk/worker";

import { ProfileForm } from "./components/profile-form";
import { ProfileInfo } from "./components/profile-info";
import { SessionManager } from "./components/session-manager";

async function getUserProfile(userId: string) {
	try {
		const userRecord = await db
			.select()
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		if (userRecord.length === 0) {
			throw new Error("User not found");
		}

		return userRecord[0];
	} catch (error) {
		throw new Error("Failed to fetch user profile");
	}
}

export async function ProfilePage({ ctx, request }: RequestInfo) {
	if (!ctx.user) {
		throw new Error("User not authenticated");
	}

	// Fetch user profile data on server-side
	const userProfile = await getUserProfile(ctx.user.id);

	// Get the base URL for the auth client
	const url = new URL(request.url);
	const authUrl = `${url.protocol}//${url.host}`;

	return (
		<div className="container mx-auto max-w-6xl space-y-8">
			<div className="space-y-2">
				<h1 className="font-bold text-4xl">Profile</h1>
				<p className="text-muted-foreground">
					Manage your account settings and profile information.
				</p>
			</div>

			{/* Render page structure with grid layout */}
			<div className="grid gap-8 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					{/* Pass user data as props to child components */}
					<ProfileInfo user={userProfile} />
					<ProfileForm user={userProfile} />
				</div>
				<div className="space-y-6">
					<SessionManager authUrl={authUrl} />
				</div>
			</div>
		</div>
	);
}
