"use server";

import { env } from "cloudflare:workers";

import { desc, eq } from "drizzle-orm";
import { renderRealtimeClients } from "rwsdk/realtime/worker";
import { requestInfo } from "rwsdk/worker";

import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import type { GuestBookMessage } from "@/db/schema/guestbook-schema";
import { guestbook_message } from "@/db/schema/guestbook-schema";
import {
	completeOnboardingSchema,
	createMessageSchema,
} from "@/lib/validators/guestbook";

export async function getAllGuestbookMessages(): Promise<{
	success: boolean;
	messages?: GuestBookMessage[];
	error?: string;
}> {
	try {
		const messages = await db
			.select()
			.from(guestbook_message)
			.orderBy(desc(guestbook_message.createdAt))
			.limit(100); // Limit to prevent performance issues

		return {
			success: true,
			messages,
		};
	} catch {
		return {
			success: false,
			error: "Failed to load messages",
		};
	}
}

export async function createGuestbookMessage(data: {
	name: string;
	message: string;
	country: string;
}) {
	try {
		const { ctx } = requestInfo;

		// Validate input data
		const validationResult = createMessageSchema.safeParse({
			name: data.name?.trim(),
			message: data.message?.trim(),
			country: data.country?.trim() || undefined,
		});

		if (!validationResult.success) {
			return {
				success: false,
				error: "Validation failed",
				details: validationResult.error.flatten().fieldErrors,
			};
		}

		// Determine the name to use (prefer form input, fallback to user name)
		const finalName =
			validationResult.data.name || ctx.user?.name || "Anonymous";

		// Insert message into database
		const [newMessage] = await db
			.insert(guestbook_message)
			.values({
				name: finalName,
				message: validationResult.data.message,
				country: validationResult.data.country,
				userId: ctx.user?.id || null,
			})
			.returning();

		// Trigger realtime updates for all guestbook clients
		await renderRealtimeClients({
			durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
			key: "/guestbook",
		});

		return {
			success: true,
			message: "Message posted successfully!",
			data: newMessage,
		};
	} catch (_error) {
		return {
			success: false,
			error: "Failed to post message. Please try again.",
		};
	}
}

export async function deleteGuestbookMessage(messageId: number) {
	try {
		const { ctx } = requestInfo;

		// Check if user is authenticated
		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		// Find the message to verify ownership
		const [messageToDelete] = await db
			.select()
			.from(guestbook_message)
			.where(eq(guestbook_message.id, messageId))
			.limit(1);

		if (!messageToDelete) {
			return {
				success: false,
				error: "Message not found",
			};
		}

		// Check if user owns the message
		if (messageToDelete.userId !== ctx.user.id) {
			return {
				success: false,
				error: "You can only delete your own messages",
			};
		}

		// Delete the message
		await db
			.delete(guestbook_message)
			.where(eq(guestbook_message.id, messageId));

		// Trigger realtime updates for all guestbook clients
		await renderRealtimeClients({
			durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
			key: "/guestbook",
		});

		return {
			success: true,
			message: "Message deleted successfully",
		};
	} catch {
		return {
			success: false,
			error: "Failed to delete message. Please try again.",
		};
	}
}

export async function completeOnboarding(data: { name: string }) {
	try {
		const { ctx } = requestInfo;

		if (!ctx.user) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		const name = data.name;

		// Validate input using shared schema
		const validation = completeOnboardingSchema.safeParse({
			name: name?.trim(),
		});
		if (!validation.success) {
			return {
				success: false,
				error: "Validation failed",
				details: validation.error.flatten().fieldErrors,
			};
		}

		// Update user with validated name
		await db
			.update(user)
			.set({
				name: validation.data.name,
				updatedAt: new Date(),
			})
			.where(eq(user.id, ctx.user.id));

		return {
			success: true,
			message: "Profile completed successfully!",
		};
	} catch {
		return {
			success: false,
			error: "Failed to complete onboarding. Please try again.",
		};
	}
}

