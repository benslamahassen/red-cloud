"use client";

import { useState, useTransition } from "react";

import { setupAuthClient } from "@/lib/auth/auth-client";
import { SIGN_IN_FORM, type SocialProvider } from "@/lib/utils/constants";
import { link } from "@/lib/utils/links";
import type { UseSignInFormProps, UseSignInFormReturn } from "@/types/hooks";

export function useSignInForm({
	authUrl,
}: UseSignInFormProps): UseSignInFormReturn {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [result, setResult] = useState("");
	const [isPending, startTransition] = useTransition();
	const [showOtpInput, setShowOtpInput] = useState(false);
	const [emailError, setEmailError] = useState("");
	const [otpError, setOtpError] = useState("");
	const [socialProvider, setSocialProvider] = useState<SocialProvider | null>(
		null,
	);

	const authClient = setupAuthClient(authUrl);

	const validateEmail = (email: string): string => {
		if (!email) return SIGN_IN_FORM.VALIDATION_MESSAGES.EMAIL_REQUIRED;
		if (!SIGN_IN_FORM.EMAIL_REGEX.test(email))
			return SIGN_IN_FORM.VALIDATION_MESSAGES.EMAIL_INVALID;
		return "";
	};

	const validateOtp = (otp: string): string => {
		if (!otp) return SIGN_IN_FORM.VALIDATION_MESSAGES.OTP_REQUIRED;
		if (otp.length !== SIGN_IN_FORM.OTP_LENGTH)
			return SIGN_IN_FORM.VALIDATION_MESSAGES.OTP_INVALID;
		return "";
	};

	const handleSendOtp = (e: React.FormEvent) => {
		e.preventDefault();
		const error = validateEmail(email);
		setEmailError(error);

		if (error) return;

		startTransition(() => {
			authClient.emailOtp.sendVerificationOtp(
				{
					email,
					type: "sign-in",
				},
				{
					onRequest: () => setResult(SIGN_IN_FORM.LOADING_MESSAGES.SENDING_OTP),
					onSuccess: () => {
						setShowOtpInput(true);
						setResult(SIGN_IN_FORM.SUCCESS_MESSAGES.OTP_SENT);
					},
					onError: (ctx) => {
						setResult(`Error: ${ctx.error.message}`);
					},
				},
			);
		});
	};

	const handleVerifyOtp = (e: React.FormEvent) => {
		e.preventDefault();
		const error = validateOtp(otp);
		setOtpError(error);

		if (error) return;

		startTransition(() => {
			authClient.signIn.emailOtp(
				{
					email,
					otp,
				},
				{
					onRequest: () =>
						setResult(SIGN_IN_FORM.LOADING_MESSAGES.VERIFYING_OTP),
					onSuccess: () => {
						window.location.href = link("/guestbook");
					},
					onError: (ctx) => {
						setResult(`Error: ${ctx.error.message}`);
					},
				},
			);
		});
	};

	const handleBackToEmail = () => {
		setShowOtpInput(false);
		setOtp("");
		setOtpError("");
		setResult("");
	};

	const handleSocialSignIn = (provider: SocialProvider) => {
		setSocialProvider(provider);
		startTransition(() => {
			authClient.signIn.social({
				provider,
				callbackURL: link("/guestbook"),
			});
		});
	};

	return {
		// Form state
		email,
		setEmail,
		otp,
		setOtp,
		result,
		showOtpInput,
		emailError,
		otpError,
		isPending,
		socialProvider,

		// Form handlers
		handleSendOtp,
		handleVerifyOtp,
		handleBackToEmail,
		handleSocialSignIn,

		// Validation functions
		validateEmail,
		validateOtp,
	};
}
