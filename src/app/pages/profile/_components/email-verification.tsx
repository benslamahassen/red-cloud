"use client";

import { Button } from "@/app/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

import { resendVerificationEmail } from "@/app/pages/profile/functions";

export function EmailVerification() {
	// Set up transition state for resend operation
	const [isPending, startTransition] = useTransition();

	// Implement "Resend Verification" functionality
	const handleResendVerification = () => {
		startTransition(async () => {
			const result = await resendVerificationEmail();

			// Handle success/error responses with toast
			if (result.success) {
				toast.success(result.message);
			} else {
				toast.error(result.error);
			}
		});
	};

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleResendVerification}
			disabled={isPending}
		>
			{isPending ? "Sending..." : "Resend Verification"}
		</Button>
	);
}
