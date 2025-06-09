"use client";

import { createGuestbookMessage } from "@/app/actions/guestbook-actions";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import type { AppContext } from "@/worker";
import { useActionState, useEffect, useState } from "react";

interface GuestbookFormProps {
	ctx: AppContext;
}

export function GuestbookForm({ ctx }: GuestbookFormProps) {
	// Wrapper function to handle useActionState properly
	const handleFormSubmission = async (
		prevState: Awaited<ReturnType<typeof createGuestbookMessage>> | null,
		formData: FormData,
	) => {
		return await createGuestbookMessage(formData);
	};

	const [state, formAction, isPending] = useActionState(
		handleFormSubmission,
		null,
	);
	const [name, setName] = useState("");
	const [message, setMessage] = useState("");

	// Determine user's display name and if they can edit it
	// Only show name input if user doesn't have a name
	const userDisplayName = ctx.user?.name || "";
	const shouldShowNameInput = !ctx.user?.name; // Show input if user doesn't have a name
	const isAuthenticated = !!ctx.user;

	// Reset form on successful submission and auto-clear success message
	useEffect(() => {
		if (state?.success) {
			setName("");
			setMessage("");
			// Auto-clear success message after 3 seconds
			const timer = setTimeout(() => {
				window.location.reload();
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [state?.success]);

	return (
		<div className="space-y-4">
			<form
				action={formAction}
				className="space-y-4"
				aria-label="Add guestbook message"
			>
				{/* Name Input - Show only if user doesn't have a name */}
				{shouldShowNameInput && (
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<div className="relative">
							<Input
								id="name"
								name="name"
								placeholder="Your Name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								maxLength={30}
								required
							/>
							{name.length >= 25 && (
								<span className="-translate-y-1/2 absolute top-1/2 right-2 text-muted-foreground text-sm">
									{name.length}/30
								</span>
							)}
						</div>
						{state?.issues?.find((issue) => issue.field === "name") && (
							<div className="flex items-start space-x-2 rounded-md border border-red-200 bg-red-50 p-2">
								<div className="mt-0.5 h-4 w-4 text-red-600">⚠</div>
								<p className="text-red-700 text-sm">
									{
										state.issues.find((issue) => issue.field === "name")
											?.message
									}
								</p>
							</div>
						)}
					</div>
				)}

				{/* Disabled Name Input - Show if user has a name */}
				{!shouldShowNameInput && (
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<div className="group relative">
							<Input
								id="name"
								name="name"
								value={userDisplayName}
								disabled
								className="cursor-not-allowed"
							/>
							<input type="hidden" name="name" value={userDisplayName} />
							<div className="-top-2 absolute left-2 rounded bg-primary px-2 py-0.5 text-primary-foreground text-xs opacity-0 transition-opacity group-hover:opacity-100">
								Visit your profile to change your name
							</div>
						</div>
					</div>
				)}

				{/* Message Input */}
				<div className="space-y-2">
					<Label htmlFor="message">Message</Label>
					<div className="relative">
						<Input
							id="message"
							name="message"
							placeholder="Write a short message..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							maxLength={50}
							required
						/>
						<span className="-translate-y-1/2 absolute top-1/2 right-2 text-muted-foreground text-sm">
							{message.length}/50
						</span>
					</div>
					{state?.issues?.find((issue) => issue.field === "message") && (
						<div className="flex items-start space-x-2 rounded-md border border-red-200 bg-red-50 p-2">
							<div className="mt-0.5 h-4 w-4 text-red-600">⚠</div>
							<p className="text-red-700 text-sm">
								{
									state.issues.find((issue) => issue.field === "message")
										?.message
								}
							</p>
						</div>
					)}
				</div>

				{/* Country Input (Optional) */}
				<div className="space-y-2">
					<Label htmlFor="country">Country (Optional)</Label>
					<Input
						id="country"
						name="country"
						placeholder="e.g., USA, Canada, UK"
					/>
				</div>

				{/* Submit Button */}
				<Button
					type="submit"
					disabled={isPending || !message.trim()}
					className="w-full"
				>
					{isPending ? (
						<div className="flex items-center space-x-2">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
							<span>Adding...</span>
						</div>
					) : (
						"Add Message"
					)}
				</Button>

				{/* Success Message */}
				{state?.success && (
					<div className="rounded-md border border-green-200 bg-green-50 p-4">
						<div className="flex items-center space-x-2">
							<div className="h-5 w-5 text-green-600">✓</div>
							<p className="font-medium text-green-700 text-sm">
								Message added successfully!
							</p>
						</div>
					</div>
				)}

				{/* Error Message */}
				{state?.error && !state?.issues && (
					<div className="rounded-md border border-red-200 bg-red-50 p-4">
						<div className="flex items-start space-x-2">
							<div className="mt-0.5 h-5 w-5 text-red-600">⚠</div>
							<div className="space-y-1">
								<p className="font-medium text-red-700 text-sm">
									{state.error}
								</p>
								<p className="text-red-600 text-xs">
									Please check your input and try again.
								</p>
							</div>
						</div>
					</div>
				)}
			</form>
		</div>
	);
}
