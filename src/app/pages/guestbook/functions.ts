"use server";

import { env } from "cloudflare:workers";

import { desc, eq } from "drizzle-orm";
import { renderRealtimeClients } from "rwsdk/realtime/worker";
import { requestInfo } from "rwsdk/worker";

import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import type { GuestBookMessage } from "@/db/schema/guestbook-schema";
import { guestbook_message } from "@/db/schema/guestbook-schema";
import { COUNTRIES } from "@/lib/utils/constants";
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

// Server function to fetch countries with timeout and retry logic
export async function getCountries(): Promise<{
	success: boolean;
	countries?: string[];
	error?: string;
	debug?: {
		apiAttempted: boolean;
		apiError?: string;
		fallbackUsed: boolean;
		environment: string;
	};
}> {
	const TIMEOUT_MS = 5000; // 5 second timeout
	const MAX_RETRIES = 2;
	const debug = {
		apiAttempted: false,
		apiError: undefined as string | undefined,
		fallbackUsed: false,
		environment: typeof window !== "undefined" ? "client" : "server",
	};

	const fetchWithTimeout = async (url: string, timeoutMs: number) => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		try {
			const response = await fetch(url, {
				signal: controller.signal,
				headers: {
					Accept: "application/json",
					"User-Agent": "RedCloud-App/1.0",
				},
			});
			clearTimeout(timeoutId);
			return response;
		} catch (error) {
			clearTimeout(timeoutId);
			throw error;
		}
	};

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			debug.apiAttempted = true;
			console.log(
				`[getCountries] Attempt ${attempt}/${MAX_RETRIES} - Fetching from REST Countries API`,
			);

			const response = await fetchWithTimeout(
				"https://restcountries.com/v3.1/all?fields=name",
				TIMEOUT_MS,
			);

			console.log(
				`[getCountries] API Response - Status: ${response.status}, OK: ${response.ok}`,
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data: Array<{ name: { common: string } }> = await response.json();
			console.log(
				`[getCountries] API Data received - Array length: ${Array.isArray(data) ? data.length : "not array"}`,
			);

			// Validate data structure
			if (!Array.isArray(data)) {
				throw new Error("Invalid response format");
			}

			// Extract country names and sort alphabetically
			const countryNames = data
				.map((country) => country?.name?.common)
				.filter(
					(name): name is string => typeof name === "string" && name.length > 0,
				)
				.sort((a, b) => a.localeCompare(b));

			if (countryNames.length === 0) {
				throw new Error("No valid countries found in response");
			}

			console.log(
				`[getCountries] API Success - ${countryNames.length} countries processed`,
			);
			return {
				success: true,
				countries: countryNames,
				debug,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			debug.apiError = errorMessage;
			console.warn(`[getCountries] Attempt ${attempt} failed:`, errorMessage);

			// If this is the last attempt, fallback to static list
			if (attempt === MAX_RETRIES) {
				debug.fallbackUsed = true;
				console.info(
					`[getCountries] Using fallback country list after API failures. Fallback has ${COUNTRIES.length} countries`,
				);
				return {
					success: true,
					countries: [...COUNTRIES], // Use static fallback list
					debug,
				};
			}

			// Wait before retry (exponential backoff)
			const waitTime = attempt * 1000;
			console.log(`[getCountries] Waiting ${waitTime}ms before retry...`);
			await new Promise((resolve) => setTimeout(resolve, waitTime));
		}
	}

	// This should never be reached, but fallback to static list as safety
	debug.fallbackUsed = true;
	console.info(
		`[getCountries] Using fallback country list as safety measure. Fallback has ${COUNTRIES.length} countries`,
	);
	return {
		success: true,
		countries: [...COUNTRIES],
		debug,
	};
}
