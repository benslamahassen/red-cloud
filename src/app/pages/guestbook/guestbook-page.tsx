import { GuestbookForm } from "@/app/pages/guestbook/_components/guestbook-form";
import { GuestbookList } from "@/app/pages/guestbook/_components/guestbook-list";
import { db } from "@/db";
import { guestbook_message } from "@/db/schema/guestbook-schema";
import type { GuestBookMessage } from "@/db/schema/guestbook-schema";
import { desc } from "drizzle-orm";
import type { RequestInfo } from "rwsdk/worker";

// Server function to get all guestbook messages
async function getAllGuestbookMessages(): Promise<{
	success: boolean;
	messages?: GuestBookMessage[];
	error?: string;
}> {
	try {
		const messages = await db
			.select()
			.from(guestbook_message)
			.orderBy(desc(guestbook_message.createdAt))
			.limit(100); // Limit to prevent performance issues

		return {
			success: true,
			messages,
		};
	} catch (error) {
		return {
			success: false,
			error: "Failed to load messages",
		};
	}
}

// Main Guestbook Page Component
export async function GuestbookPage({ ctx }: RequestInfo) {
	const messagesResult = await getAllGuestbookMessages();

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<div className="space-y-8">
				{/* Page Header */}
				<div className="space-y-2 text-center">
					<h1 className="font-bold text-3xl tracking-tight">Guestbook</h1>
					<p className="text-muted-foreground">
						Leave a message and see what others have shared
					</p>
				</div>

				{/* Guestbook Form */}
				<GuestbookForm user={ctx?.user} />

				{/* Messages List */}
				<GuestbookList
					messagesResult={messagesResult}
					currentUser={ctx?.user}
				/>
			</div>
		</div>
	);
}
