"use client";

import { AppShell } from "@/app/shared/components/app-shell";
import { Button } from "@/app/shared/components/ui/button";
import { Card, CardContent } from "@/app/shared/components/ui/card";
import {
	Form,
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/app/shared/components/ui/form";
import { Input } from "@/app/shared/components/ui/input";
import { link } from "@/app/shared/links";
import { setupAuthClient } from "@/lib/auth-client";
import type { AppContext } from "@/worker";
import { useState, useTransition } from "react";

export function SignIn({ ctx }: { ctx: AppContext }) {
	const { authUrl } = ctx;
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [result, setResult] = useState("");
	const [isPending, startTransition] = useTransition();
	const [showOtpInput, setShowOtpInput] = useState(false);
	const [emailError, setEmailError] = useState("");
	const [otpError, setOtpError] = useState("");
	const authClient = setupAuthClient(authUrl);

	const validateEmail = (email: string) => {
		if (!email) return "Email is required";
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			return "Please enter a valid email address";
		return "";
	};

	const validateOtp = (otp: string) => {
		if (!otp) return "Verification code is required";
		if (otp.length !== 6) return "Verification code must be 6 digits";
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
					onRequest: () => setResult("Sending verification code..."),
					onSuccess: () => {
						setShowOtpInput(true);
						setResult("Check your email for the verification code");
					},
					onError: (ctx) => {
						console.log("error sending OTP", ctx.error);
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
					onRequest: () => setResult("Verifying code..."),
					onSuccess: () => {
						window.location.href = link("/");
					},
					onError: (ctx) => {
						console.log("error verifying OTP", ctx.error);
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

	const handleSocialSignIn = (provider: "google" | "github") => {
		startTransition(() => {
			authClient.signIn.social({
				provider,
				callbackURL: link("/"),
			});
		});
	};

	return (
		<AppShell ctx={ctx}>
			<div className="mx-auto max-w-md py-8">
				<div className="mb-6 text-center">
					<h1 className="mb-4 font-semibold text-2xl">Sign In</h1>
					<p className="text-muted-foreground">
						Welcome back! Please sign in to your account.
					</p>
				</div>

				<Card>
					<CardContent className="p-6">
						{!showOtpInput ? (
							<>
								<Form onSubmit={handleSendOtp}>
									<FormItem>
										<FormLabel htmlFor="email">Email</FormLabel>
										<FormControl>
											<Input
												id="email"
												type="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												placeholder="Enter your email"
												autoComplete="email"
											/>
										</FormControl>
										<FormMessage>{emailError}</FormMessage>
									</FormItem>

									{result && (
										<FormMessage
											variant={
												result.includes("Error") ? "destructive" : "success"
											}
										>
											{result}
										</FormMessage>
									)}

									<Button type="submit" disabled={isPending} className="w-full">
										{isPending ? "Sending Code..." : "Continue with Email"}
									</Button>
								</Form>
								<div className="mt-4 space-y-2">
									<Button
										variant="outline"
										onClick={() => handleSocialSignIn("google")}
										disabled={isPending}
										className="w-full"
									>
										Continue with Google
									</Button>
									<Button
										variant="outline"
										onClick={() => handleSocialSignIn("github")}
										disabled={isPending}
										className="w-full"
									>
										Continue with GitHub
									</Button>
								</div>
							</>
						) : (
							<Form onSubmit={handleVerifyOtp}>
								<FormItem>
									<FormLabel htmlFor="otp">Verification Code</FormLabel>
									<FormControl>
										<Input
											id="otp"
											type="text"
											value={otp}
											onChange={(e) => setOtp(e.target.value)}
											placeholder="Enter 6-digit code"
											maxLength={6}
											autoComplete="one-time-code"
										/>
									</FormControl>
									<FormMessage>{otpError}</FormMessage>
								</FormItem>

								{result && (
									<FormMessage
										variant={
											result.includes("Error") ? "destructive" : "success"
										}
									>
										{result}
									</FormMessage>
								)}

								<div className="flex gap-3">
									<Button
										type="button"
										variant="outline"
										onClick={handleBackToEmail}
										disabled={isPending}
									>
										← Back
									</Button>
									<Button type="submit" disabled={isPending} className="flex-1">
										{isPending ? "Verifying..." : "Verify Code"}
									</Button>
								</div>
							</Form>
						)}
					</CardContent>
				</Card>

				<p className="mt-4 text-center text-muted-foreground text-sm">
					<a href="/" className="text-primary hover:underline">
						Back to Landing Page
					</a>
				</p>
			</div>
		</AppShell>
	);
}
