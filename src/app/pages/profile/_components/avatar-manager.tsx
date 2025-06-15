"use client";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Trash2, Upload } from "lucide-react";
import { useRef, useTransition } from "react";
import { toast } from "sonner";

import { removeAvatar, uploadAvatar } from "@/app/pages/profile/functions";

// Define AvatarManagerProps interface
interface AvatarManagerProps {
	currentAvatar: string | null;
}

export function AvatarManager({ currentAvatar }: AvatarManagerProps) {
	// Set up transition states for operations
	const [isPending, startTransition] = useTransition();
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Implement file selection and preview
	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Add file validation on client-side
		if (file.size > 5 * 1024 * 1024) {
			toast.error("File size must be less than 5MB");
			return;
		}

		if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
			toast.error("File must be a JPEG, PNG, or WebP image");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);

		// Handle upload operation with error handling
		startTransition(async () => {
			const result = await uploadAvatar(formData);

			// Handle success/error responses
			if (result.success) {
				toast.success(result.message);
				// Session is automatically updated by the server function
				// Refresh page to show updated data
				window.location.reload();
			} else {
				toast.error(result.error);
			}
		});

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Add "Remove Avatar" functionality
	const handleRemoveAvatar = () => {
		// Add confirmation dialogs for destructive actions
		if (!confirm("Are you sure you want to remove your avatar?")) {
			return;
		}

		startTransition(async () => {
			const result = await removeAvatar();

			if (result.success) {
				toast.success(result.message);
				// Session is automatically updated by the server function
				// Refresh page to show updated data
				window.location.reload();
			} else {
				toast.error(result.error);
			}
		});
	};

	return (
		<div className="flex space-x-2">
			{/* Implement "Change Avatar" functionality */}
			<Button
				variant="outline"
				size="sm"
				onClick={() => fileInputRef.current?.click()}
				disabled={isPending}
				className="flex items-center space-x-2"
			>
				<Upload className="h-4 w-4" />
				<span>{currentAvatar ? "Change Avatar" : "Upload Avatar"}</span>
			</Button>

			{currentAvatar && (
				<Button
					variant="outline"
					size="sm"
					onClick={handleRemoveAvatar}
					disabled={isPending}
					className="flex items-center space-x-2"
				>
					<Trash2 className="h-4 w-4" />
					<span>Remove</span>
				</Button>
			)}

			{/* Show upload progress and loading states */}
			<Input
				id="avatar-upload"
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				onChange={handleFileUpload}
				className="hidden"
				disabled={isPending}
			/>
		</div>
	);
}
