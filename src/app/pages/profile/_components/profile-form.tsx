"use client";

import { Button } from "@/app/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useSession } from "@/app/hooks/use-session";
import type { User } from "@/db/schema/auth-schema";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateProfile } from "@/app/pages/profile/functions";

// Define ProfileFormProps interface
interface ProfileFormProps {
	user: {
		id: string;
		name: string | null;
		email: string;
		emailVerified: boolean | null;
		image: string | null;
		createdAt: Date | null;
		updatedAt: Date | null;
	};
}

export function ProfileForm({ user }: ProfileFormProps) {
	// Use the enhanced session hook
	const { refreshSession, updateUser } = useSession();

	// Set up form state with useState
	const [formData, setFormData] = useState({
		name: user.name || "",
	});

	// Set up transition state with useTransition
	const [isPending, startTransition] = useTransition();

	// Implement form submission handler
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form = e.currentTarget;
		const formDataObj = new FormData(form);

		startTransition(async () => {
			const result = await updateProfile(formDataObj);

			// Handle success/error responses with toast notifications
			if (result.success) {
				toast.success(result.message);

				// Update the user in the session context immediately
				const updatedUser: User = {
					...user,
					name: formData.name,
					emailVerified: user.emailVerified ?? false,
					createdAt: user.createdAt ?? new Date(),
					updatedAt: user.updatedAt ?? new Date(),
				};
				updateUser(updatedUser);

				// Also refresh from server to ensure we have the latest data
				await refreshSession();
			} else {
				toast.error(result.error);

				// Add form validation and error display
				if (result.issues) {
					for (const issue of result.issues) {
						toast.error(`${issue.field}: ${issue.message}`);
					}
				}
			}
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Edit Profile</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Display Name</Label>
						<Input
							id="name"
							name="name"
							type="text"
							value={formData.name}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
							}
							placeholder="Enter your display name"
							disabled={isPending}
							autoComplete="name"
						/>
					</div>

					{/* Add loading states during form submission */}
					<Button type="submit" disabled={isPending} className="w-full">
						{isPending ? "Updating..." : "Update Profile"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
