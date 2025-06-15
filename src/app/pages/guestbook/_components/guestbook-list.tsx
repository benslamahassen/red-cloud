import type { GuestBookMessage } from "@/db/schema/guestbook-schema";
import type { RequestInfo } from "rwsdk/worker";
import { GuestbookMessage } from "./guestbook-message";

interface GuestbookListProps {
	messagesResult: {
		success: boolean;
		messages?: GuestBookMessage[];
		error?: string;
	};
	currentUser?: RequestInfo["ctx"]["user"];
}

export function GuestbookList({
	messagesResult,
	currentUser,
}: GuestbookListProps) {
	// Handle error state
	if (!messagesResult.success) {
		return (
			<div className="py-12 text-center">
				<div className="font-semibold text-destructive text-lg">
					Failed to load messages
				</div>
				<p className="mt-3 text-muted-foreground text-sm">
					{messagesResult.error || "Please try refreshing the page"}
				</p>
			</div>
		);
	}

	const messages = messagesResult.messages || [];

	// Handle empty state
	if (messages.length === 0) {
		return (
			<div className="py-16 text-center">
				<div className="text-muted-foreground">
					<h3 className="mb-3 font-semibold text-xl">No messages yet</h3>
					<p className="text-base">Be the first to leave a message!</p>
				</div>
			</div>
		);
	}

	// Helper function to determine if user can delete a message
	const canDeleteMessage = (message: GuestBookMessage): boolean => {
		if (!currentUser?.id) return false;

		// Check by userId first (for new messages), fallback to name (for legacy messages)
		return message.userId
			? message.userId === currentUser.id
			: message.name === currentUser.name;
	};

	// Render messages
	return (
		<div className="space-y-8">
			<div className="border-border border-b pb-4">
				<h2 className="font-bold text-2xl tracking-tight">
					Messages ({messages.length})
				</h2>
				<p className="mt-2 text-muted-foreground text-sm">
					Recent messages from our community
				</p>
			</div>

			<div className="space-y-6">
				{messages.map((message) => (
					<GuestbookMessage
						key={message.id}
						message={message}
						canDelete={canDeleteMessage(message)}
					/>
				))}
			</div>
		</div>
	);
}
