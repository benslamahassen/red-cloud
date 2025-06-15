"use client";

import { Button } from "@/app/components/ui/button";
import {
	Form,
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/app/components/ui/input-otp";
import { useSignInForm } from "@/app/hooks/use-sign-in-form";
import { SocialSignInButton } from "@/app/pages/sign-in/components/social-sign-in-button";
import { SIGN_IN_FORM, SOCIAL_PROVIDERS } from "@/lib/utils/constants";
import { ExternalLink } from "lucide-react";

interface SignInFormProps {
	authUrl: string;
}

export function SignInForm({ authUrl }: SignInFormProps) {
	const {
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
		handleSendOtp,
		handleVerifyOtp,
		handleBackToEmail,
		handleSocialSignIn,
	} = useSignInForm({ authUrl });

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-2 text-center font-bold text-3xl">Welcome ☁️</h1>
			<p className="mb-6 text-center text-muted-foreground">
				{!showOtpInput ? (
					"Choose a sign in method below."
				) : (
					<>
						We've sent a verification code to{" "}
						<span className="font-medium">{email}</span>.
					</>
				)}
			</p>

			{!showOtpInput ? (
				<>
					<Form onSubmit={handleSendOtp}>
						<div className="space-y-4">
							<FormItem>
								<FormLabel htmlFor="email">Email</FormLabel>
								<FormControl>
									<Input
										id="email"
										name="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@example.com"
										autoComplete="email"
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage>{emailError}</FormMessage>
							</FormItem>

							{result && (
								<FormMessage
									variant={result.includes("Error") ? "destructive" : "success"}
								>
									{result}
								</FormMessage>
							)}

							<Button type="submit" disabled={isPending} className="w-full">
								{isPending
									? SIGN_IN_FORM.LOADING_MESSAGES.SENDING_OTP
									: "Send verification code"}
							</Button>
						</div>
					</Form>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-gray-300 border-t dark:border-gray-600" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="bg-background px-2 text-gray-500 dark:text-gray-400">
								Or continue with
							</span>
						</div>
					</div>

					<div className="space-y-4">
						<SocialSignInButton
							provider={SOCIAL_PROVIDERS.GOOGLE}
							onClick={handleSocialSignIn}
							disabled={isPending}
							isLoading={socialProvider !== null}
							currentProvider={socialProvider}
						/>

						<SocialSignInButton
							provider={SOCIAL_PROVIDERS.GITHUB}
							onClick={handleSocialSignIn}
							disabled={isPending}
							isLoading={socialProvider !== null}
							currentProvider={socialProvider}
						/>
					</div>
				</>
			) : (
				<Form onSubmit={handleVerifyOtp}>
					<div className="space-y-4">
						<FormItem>
							<FormLabel htmlFor="otp">Verification Code</FormLabel>
							<FormControl>
								<InputOTP
									id="otp"
									name="otp"
									value={otp}
									onChange={setOtp}
									disabled={isPending}
									autoComplete="one-time-code"
									maxLength={SIGN_IN_FORM.OTP_LENGTH}
									className="w-full"
								>
									<InputOTPGroup className="w-full justify-between gap-2">
										{Array.from(
											{ length: SIGN_IN_FORM.OTP_LENGTH },
											(_, index) => (
												<InputOTPSlot
													// biome-ignore lint/suspicious/noArrayIndexKey: Index is stable for OTP slots
													key={`otp-slot-${index}`}
													index={index}
													className="h-12 flex-1 rounded-md border border-input text-xl"
												/>
											),
										)}
									</InputOTPGroup>
								</InputOTP>
							</FormControl>
							<FormMessage>{otpError}</FormMessage>
						</FormItem>

						{result && (
							<FormMessage
								variant={result.includes("Error") ? "destructive" : "success"}
							>
								{result}
							</FormMessage>
						)}

						<Button type="submit" disabled={isPending} className="w-full">
							{isPending
								? SIGN_IN_FORM.LOADING_MESSAGES.VERIFYING_OTP
								: "Verify & Sign In"}
						</Button>

						<Button
							type="button"
							variant="link"
							className="w-full"
							onClick={handleBackToEmail}
							disabled={isPending}
						>
							Back to Email
						</Button>
					</div>
				</Form>
			)}

			<div className="mt-8 text-center text-muted-foreground text-sm italic">
				Authentication powered by{" "}
				<a
					href="https://better-auth.com"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1 text-muted-foreground underline hover:text-muted-foreground/80"
				>
					Better Auth
					<ExternalLink className="h-3 w-3" />
				</a>
				<br />
				and Cloudflare D1+KV
			</div>
		</div>
	);
}
