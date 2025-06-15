import { z } from "zod";

// Validation schema for updating user profile
export const updateProfileSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(50, "Name must be 50 characters or less"),
});

// Validation schema for avatar upload
export const avatarUploadSchema = z.object({
	file: z
		.instanceof(File)
		.refine(
			(file) => file.size <= 5 * 1024 * 1024,
			"File size must be less than 5MB",
		)
		.refine(
			(file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
			"File must be a JPEG, PNG, or WebP image",
		),
});

// Type exports for use in components
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
