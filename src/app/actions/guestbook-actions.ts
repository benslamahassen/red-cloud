"use server";

import { db } from "@/db";
import { guestbook_message } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requestInfo } from "rwsdk/worker";
import { z } from "zod";

// Validation schema
const createMessageSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(30, "Name must be 30 characters or less"),
	message: z
		.string()
		.min(1, "Message is required")
		.max(50, "Message must be 50 characters or less"),
	country: z.string().optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export async function createGuestbookMessage(formData: FormData) {
	try {
		const { ctx } = requestInfo;

		// Extract form data
		const rawData = {
			name: formData.get("name") as string,
			message: formData.get("message") as string,
			country: (formData.get("country") as string) || undefined,
		};

		// Validate input
		const validatedData = createMessageSchema.parse(rawData);

		// Determine the display name to use for the message
		// Priority: existing user name > form input name
		const displayName = ctx.user?.name || validatedData.name;

		// Insert the guestbook message
		const result = await db
			.insert(guestbook_message)
			.values({
				name: displayName,
				message: validatedData.message,
				country: validatedData.country || null,
			})
			.returning()
			.get();

		return {
			success: true,
			data: result,
		};
	} catch (error) {
		console.error("Error creating guestbook message:", error);

		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: "Please check your input",
				issues: error.issues.map((issue) => ({
					field: issue.path.join("."),
					message: issue.message,
				})),
			};
		}

		// Handle specific database errors
		if (error instanceof Error) {
			if (error.message.includes("UNIQUE constraint")) {
				return {
					success: false,
					error:
						"A message with this content already exists. Please try a different message.",
				};
			}

			if (
				error.message.includes("timeout") ||
				error.message.includes("network")
			) {
				return {
					success: false,
					error: "Network error. Please check your connection and try again.",
				};
			}
		}

		return {
			success: false,
			error:
				"Unable to save your message right now. Please try again in a moment.",
		};
	}
}

export async function getAllGuestbookMessages() {
	try {
		const messages = await db
			.select()
			.from(guestbook_message)
			.orderBy(desc(guestbook_message.createdAt));

		return {
			success: true,
			data: messages,
		};
	} catch (error) {
		console.error("Error fetching guestbook messages:", error);

		if (error instanceof Error) {
			if (
				error.message.includes("timeout") ||
				error.message.includes("network")
			) {
				return {
					success: false,
					error: "Network timeout. Please refresh the page to try again.",
					data: [],
				};
			}

			if (error.message.includes("database") || error.message.includes("sql")) {
				return {
					success: false,
					error: "Database temporarily unavailable. Please try again later.",
					data: [],
				};
			}
		}

		return {
			success: false,
			error: "Unable to load messages. Please refresh the page.",
			data: [],
		};
	}
}
