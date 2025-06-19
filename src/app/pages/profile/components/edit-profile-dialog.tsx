"use client";

import { Pencil, Trash2, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
	removeAvatar,
	updateProfile,
	uploadAvatar,
} from "@/app/pages/profile/functions";

interface EditProfileDialogProps {
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

export function EditProfileDialog({ user }: EditProfileDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: user.name || "",
	});
	const [isPending, startTransition] = useTransition();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Use plain object instead of FormData
		// since rwsdk realtime client doesn't work with FormData
		const data = {
			name: formData.name,
		};

		startTransition(async () => {
			const result = await updateProfile(data);

			if (result.success) {
				toast.success(result.message);
				// Refresh the page to get updated user data
				window.location.reload();
			} else {
				toast.error(result.error);

				if (result.issues) {
					for (const issue of result.issues) {
						toast.error(`${issue.field}: ${issue.message}`);
					}
				}
			}
		});
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

		try {
			// Convert File to base64 for rwsdk compatibility (JSON serializable)
			const fileBase64 = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					const result = reader.result as string;
					// Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
					const base64 = result.split(",")[1];
					resolve(base64);
				};
				reader.onerror = reject;
				reader.readAsDataURL(file);
			});

			const data = {
				fileBase64,
				fileName: file.name,
				fileType: file.type,
				fileSize: file.size,
			};

			startTransition(async () => {
				const result = await uploadAvatar(data);

				if (result.success) {
					toast.success(result.message);
					window.location.reload();
				} else {
					toast.error(result.error);
				}
			});
		} catch (error) {
			console.error("File processing error:", error);
			toast.error("Failed to process file");
		}

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleRemoveAvatar = () => {
		if (!confirm("Are you sure you want to remove your avatar?")) {
			return;
		}

		startTransition(async () => {
			const result = await removeAvatar();

			if (result.success) {
				toast.success(result.message);
				window.location.reload();
			} else {
				toast.error(result.error);
			}
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="flex w-full items-center justify-center space-x-2 text-sm sm:w-auto"
				>
					<Pencil className="h-4 w-4" />
					<span>Edit Profile</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
				</DialogHeader>
				<div className="space-y-6">
					{/* Avatar Management */}
					<div className="space-y-4">
						<Label>Profile Picture</Label>
						<div className="flex space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => fileInputRef.current?.click()}
								disabled={isPending}
								className="flex items-center space-x-2"
							>
								<Upload className="h-4 w-4" />
								<span>{user.image ? "Change" : "Upload"}</span>
							</Button>

							{user.image && (
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

							<Input
								ref={fileInputRef}
								type="file"
								accept="image/jpeg,image/png,image/webp"
								onChange={handleFileUpload}
								className="hidden"
								disabled={isPending}
							/>
						</div>
					</div>

					{/* Name Form */}
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

						<div className="flex justify-end space-x-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsOpen(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
