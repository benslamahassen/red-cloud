import { getAllGuestbookMessages } from "@/app/actions/guestbook-actions";
import { GuestbookForm } from "@/app/components/pages/guestbook/form";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import type { AppContext } from "@/worker";

export async function Guestbook({ ctx }: { ctx: AppContext }) {
	// Fetch all messages on the server
	const messagesResult = await getAllGuestbookMessages();
	const messages = messagesResult.success ? messagesResult.data : [];

	return (
		<div className="container mx-auto w-full min-w-0 max-w-[90vw] px-3 py-2 sm:max-w-2xl sm:px-4 md:max-w-3xl">
			<div className="mx-auto w-full max-w-xl space-y-8">
				<div className="space-y-4">
					<div className="space-y-2 text-center">
						<h1 className="font-bold text-4xl">Guestbook</h1>
						<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
							Powered by Cloudflare D1.
						</p>
					</div>

					{/* Guestbook Form */}
					<GuestbookForm ctx={ctx} />
				</div>

				{/* Messages Display */}
				<div className="space-y-4">
					{!messagesResult.success ? (
						<div className="space-y-2 text-center">
							<p className="font-medium text-red-500">Error loading messages</p>
							<p className="text-muted-foreground text-sm">
								{messagesResult.error}
							</p>
							<p className="text-muted-foreground text-xs">
								Please try refreshing the page or check your connection.
							</p>
						</div>
					) : messages.length === 0 ? (
						<div className="space-y-2 text-center">
							<p className="text-lg text-muted-foreground">
								No guestbook messages yet.
							</p>
							<p className="text-muted-foreground text-sm">
								Be the first to leave a message! 👆
							</p>
						</div>
					) : (
						messages.map((msg) => (
							<Card key={msg.id} className="gap-0 py-3">
								<CardHeader>
									<div className="flex items-start justify-between">
										<CardTitle className="font-bold text-xl">
											{msg.name}
										</CardTitle>
										<time className="text-muted-foreground text-sm">
											{formatDate(msg.createdAt)}
										</time>
									</div>
								</CardHeader>
								<CardContent>
									<p>{msg.message}</p>
									{msg.country && (
										<p className="mt-2 text-muted-foreground text-sm">
											From: {msg.country}
										</p>
									)}
								</CardContent>
							</Card>
						))
					)}
				</div>
			</div>
		</div>
	);
}

function formatDate(date: Date): string {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}
