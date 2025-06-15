import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import type { GuestBookMessage } from "@/db/schema/guestbook-schema";
import { DeleteMessageButton } from "./delete-message-button";

interface GuestbookMessageProps {
	message: GuestBookMessage;
	canDelete: boolean;
}

// Utility function to format date
function formatDate(date: Date): string {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) {
		return "just now";
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
	}

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) {
		return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
	}

	// For older messages, show the actual date
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export function GuestbookMessage({
	message,
	canDelete,
}: GuestbookMessageProps) {
	return (
		<Card className="gap-3 py-4 transition-all hover:shadow-md">
			<CardHeader className="px-4 pb-0">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<div className="flex items-center gap-3">
							<span className="font-bold text-lg">{message.name}</span>
							{message.country && (
								<span className="text-muted-foreground text-sm">
									from {message.country}
								</span>
							)}
						</div>
						<div className="text-muted-foreground text-xs">
							{formatDate(message.createdAt)}
						</div>
					</div>
					{canDelete && <DeleteMessageButton messageId={message.id} />}
				</div>
			</CardHeader>
			<CardContent className="px-4 pt-0">
				<p className="text-base text-foreground leading-relaxed">
					{message.message}
				</p>
			</CardContent>
		</Card>
	);
}
