import { z } from "zod";

export const signInEmailSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

export const signInOtpSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	otp: z.string().length(6, "Verification code must be 6 digits"),
});

export type SignInEmailInput = z.infer<typeof signInEmailSchema>;
export type SignInOtpInput = z.infer<typeof signInOtpSchema>;
