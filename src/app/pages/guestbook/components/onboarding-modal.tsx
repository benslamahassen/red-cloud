"use client";

import { useState } from "react";

import { Button } from "@/app/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { completeOnboarding } from "@/app/pages/guestbook/functions";

interface OnboardingModalProps {
	isOpen: boolean;
	userEmail: string;
}

export function OnboardingModal({ isOpen, userEmail }: OnboardingModalProps) {
	const [name, setName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!name.trim()) {
			setError("Name is required");
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			// Use plain object instead of FormData
			// since rwsdk realtime client doesn't work with FormData
			const data = {
				name: name.trim(),
			};

			const result = await completeOnboarding(data);

			if (result.success) {
				// Trigger session refresh event for other components
				window.dispatchEvent(new CustomEvent("onboarding-completed"));
				localStorage.setItem("onboarding-completed", "true");

				// Redirect to refresh the context and remove the modal
				window.location.href = window.location.pathname;
			} else {
				setError(result.error || "Failed to update profile");
			}
		} catch (_err) {
			setError("An unexpected error occurred");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Dialog open={isOpen}>
			<DialogContent className="sm:max-w-md" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Complete Your Profile</DialogTitle>
					<DialogDescription>
						Welcome! Please complete your profile to continue using the app.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							value={userEmail}
							disabled
							className="bg-muted"
							autoComplete="email"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="name">Full Name *</Label>
						<Input
							id="name"
							name="name"
							type="text"
							placeholder="Enter your full name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={isSubmitting}
							required
							autoComplete="name"
						/>
					</div>

					{error && <div className="text-destructive text-sm">{error}</div>}

					<Button
						type="submit"
						className="w-full"
						disabled={isSubmitting || !name.trim()}
					>
						{isSubmitting ? "Saving..." : "Complete Profile"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
