"use server";

import { env } from "cloudflare:workers";
import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { auth } from "@/lib/auth";
import { getSessionStore } from "@/lib/session/store";
import {
	avatarUploadSchema,
	updateProfileSchema,
} from "@/lib/validators/profile";
import { eq } from "drizzle-orm";
import { requestInfo } from "rwsdk/worker";

export async function getUserProfile(userId: string) {
	try {
		const userRecord = await db
			.select()
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		if (userRecord.length === 0) {
			throw new Error("User not found");
		}

		return userRecord[0];
	} catch (error) {
		throw new Error("Failed to fetch user profile");
	}
}

// Server Functions
export async function updateProfile(formData: FormData) {
	try {
		const { ctx, request } = requestInfo;

		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		// Extract form data
		const name = formData.get("name") as string;

		// Validate form data using Zod schema
		const validation = updateProfileSchema.safeParse({ name });
		if (!validation.success) {
			return {
				success: false,
				error: "Please check your input",
				issues: validation.error.issues.map((issue) => ({
					field: issue.path.join("."),
					message: issue.message,
				})),
			};
		}

		// Update user record in database
		await db
			.update(user)
			.set({
				name: validation.data.name,
				updatedAt: new Date(),
			})
			.where(eq(user.id, ctx.user.id));

		// Fetch updated user data
		const [updatedUser] = await db
			.select()
			.from(user)
			.where(eq(user.id, ctx.user.id))
			.limit(1);

		// Update session with fresh user data (force refresh to ensure immediate update)
		if (updatedUser) {
			const sessionStore = getSessionStore();
			await sessionStore.updateUser(request, updatedUser, true);
		}

		// Return structured success response
		return {
			success: true,
			message: "Profile updated successfully",
		};
	} catch (error) {
		// Add comprehensive error handling
		console.error("Profile update error:", error);
		return {
			success: false,
			error: "Unable to update profile. Please try again.",
		};
	}
}

export async function uploadAvatar(formData: FormData) {
	try {
		const { ctx, request } = requestInfo;

		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		// Extract file from form data
		const file = formData.get("file") as File;

		if (!file) {
			return {
				success: false,
				error: "No file provided",
			};
		}

		// Validate file using Zod schema
		const validation = avatarUploadSchema.safeParse({ file });
		if (!validation.success) {
			return {
				success: false,
				error: validation.error.issues[0].message,
			};
		}

		// Generate unique filename with timestamp
		const fileExtension = file.name.split(".").pop();
		const fileName = `avatar-${ctx.user.id}-${Date.now()}.${fileExtension}`;
		const r2ObjectKey = `avatars/${fileName}`;

		// Upload file to R2 storage
		await env.AVATARS_BUCKET.put(r2ObjectKey, await file.arrayBuffer(), {
			httpMetadata: {
				contentType: file.type,
			},
		});

		// Update user record with new avatar URL
		await db
			.update(user)
			.set({
				image: r2ObjectKey,
				updatedAt: new Date(),
			})
			.where(eq(user.id, ctx.user.id));

		// Fetch updated user data
		const [updatedUser] = await db
			.select()
			.from(user)
			.where(eq(user.id, ctx.user.id))
			.limit(1);

		// Update session with fresh user data (force refresh to ensure immediate update)
		if (updatedUser) {
			const sessionStore = getSessionStore();
			await sessionStore.updateUser(request, updatedUser, true);
		}

		// Return structured success response
		return {
			success: true,
			message: "Avatar updated successfully",
			avatarUrl: r2ObjectKey,
		};
	} catch (error) {
		// Add error handling for R2 operations
		console.error("Avatar upload error:", error);
		return {
			success: false,
			error: "Unable to upload avatar. Please try again.",
		};
	}
}

export async function removeAvatar() {
	try {
		const { ctx, request } = requestInfo;

		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		// Check user authentication
		// Fetch current user data to get existing avatar
		const currentUser = await db
			.select()
			.from(user)
			.where(eq(user.id, ctx.user.id))
			.limit(1);

		if (currentUser.length === 0) {
			return {
				success: false,
				error: "User not found",
			};
		}

		const userRecord = currentUser[0];

		// Delete avatar file from R2 storage (only if it's stored in R2, not a social provider URL)
		if (
			userRecord.image &&
			!userRecord.image.startsWith("http://") &&
			!userRecord.image.startsWith("https://")
		) {
			try {
				await env.AVATARS_BUCKET.delete(userRecord.image);
			} catch (error) {
				console.warn("Failed to delete avatar from R2:", error);
				// Continue with database update even if R2 deletion fails
			}
		}

		// Update user record to remove avatar URL
		await db
			.update(user)
			.set({
				image: null,
				updatedAt: new Date(),
			})
			.where(eq(user.id, ctx.user.id));

		// Fetch updated user data
		const [updatedUser] = await db
			.select()
			.from(user)
			.where(eq(user.id, ctx.user.id))
			.limit(1);

		// Update session with fresh user data (force refresh to ensure immediate update)
		if (updatedUser) {
			const sessionStore = getSessionStore();
			await sessionStore.updateUser(request, updatedUser, true);
		}

		// Return structured success response
		return {
			success: true,
			message: "Avatar removed successfully",
		};
	} catch (error) {
		// Handle R2 deletion failures gracefully
		console.error("Avatar removal error:", error);
		return {
			success: false,
			error: "Unable to remove avatar. Please try again.",
		};
	}
}

export async function resendVerificationEmail() {
	try {
		const { ctx } = requestInfo;

		// Check user authentication
		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		// Verify user exists in database
		const currentUser = await db
			.select()
			.from(user)
			.where(eq(user.id, ctx.user.id))
			.limit(1);

		if (currentUser.length === 0) {
			return {
				success: false,
				error: "User not found",
			};
		}

		const userRecord = currentUser[0];

		// Check if email is already verified
		if (userRecord.emailVerified) {
			return {
				success: false,
				error: "Email is already verified",
			};
		}

		// Send verification OTP using Better Auth
		try {
			await auth.api.sendVerificationOTP({
				body: {
					email: userRecord.email,
					type: "email-verification",
				},
			});
		} catch (error) {
			console.error("Failed to send verification OTP:", error);
			return {
				success: false,
				error: "Failed to send verification email. Please try again.",
			};
		}

		// Return structured success response
		return {
			success: true,
			message: "Verification email sent successfully",
		};
	} catch (error) {
		// Add proper error handling
		console.error("Email verification error:", error);
		return {
			success: false,
			error: "Unable to send verification email. Please try again.",
		};
	}
}
