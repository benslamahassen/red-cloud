"use client";

import { Button } from "@/app/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import {
	Form,
	FormControl,
	FormItem,
	FormLabel,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/app/components/ui/select";
import {
	createGuestbookMessage,
	getCountriesServer,
} from "@/app/pages/guestbook/functions";
import { useEffect, useState, useTransition } from "react";
import type { RequestInfo } from "rwsdk/worker";
import { toast } from "sonner";

interface GuestbookFormProps {
	user?: RequestInfo["ctx"]["user"];
}

export function GuestbookForm({ user }: GuestbookFormProps) {
	const [isPending, startTransition] = useTransition();
	const [countries, setCountries] = useState<string[]>([]);
	const [formData, setFormData] = useState({
		name: "",
		message: "",
		country: "",
	});
	const [errors, setErrors] = useState<Record<string, string[]>>({});

	// Fetch countries using server function - silently in background
	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const result = await getCountriesServer();

				if (result.success && result.countries) {
					setCountries(result.countries);
				} else {
					setCountries([]);
					// Only show error if user tries to interact with the select
				}
			} catch (error) {
				setCountries([]);
				// Silently fail - user can still submit without country
			}
		};

		fetchCountries();
	}, []);

	// Use user data directly from props - server handles session management
	const currentUser = user;

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form = new FormData();

		// Set form data from React state to ensure processed values are used
		form.set("name", currentUser?.name || formData.name);
		form.set("message", formData.message);
		form.set("country", formData.country); // This will be empty string if "__CLEAR__" was selected

		startTransition(async () => {
			try {
				const result = await createGuestbookMessage(form);

				if (result.success) {
					toast.success(result.message || "Message posted successfully!");
					// Reset form
					setFormData({ name: "", message: "", country: "" });
					setErrors({});
					// Refresh the page to show new message
					window.location.reload();
				} else {
					if (result.details) {
						setErrors(result.details);
					}
					toast.error(result.error || "Failed to post message");
				}
			} catch (error) {
				toast.error("An unexpected error occurred");
			}
		});
	};

	const handleInputChange = (field: string, value: string) => {
		// Convert "__CLEAR__" value to empty string for country field
		const actualValue =
			field === "country" && value === "__CLEAR__" ? "" : value;
		setFormData((prev) => ({ ...prev, [field]: actualValue }));
		// Clear errors for this field when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: [] }));
		}
	};

	return (
		<Card className="bg-background">
			<CardContent>
				<Form onSubmit={handleSubmit}>
					<FormItem>
						<FormLabel htmlFor="name">
							Name {!currentUser && <span className="text-destructive">*</span>}
						</FormLabel>
						<FormControl>
							<Input
								id="name"
								name="name"
								type="text"
								placeholder={
									currentUser ? currentUser.name || "Your name" : "Your name"
								}
								value={currentUser ? currentUser.name || "" : formData.name}
								onChange={(e) => handleInputChange("name", e.target.value)}
								disabled={!!currentUser || isPending}
								maxLength={30}
								aria-invalid={!!errors.name}
								readOnly={!!currentUser}
								autoComplete="name"
							/>
						</FormControl>
						{errors.name && (
							<p className="text-destructive text-sm">{errors.name[0]}</p>
						)}
						{!currentUser && (
							<p className="text-muted-foreground text-xs">
								{30 - formData.name.length} characters remaining
							</p>
						)}
					</FormItem>

					<FormItem>
						<FormLabel htmlFor="message">
							Message <span className="text-destructive">*</span>
						</FormLabel>
						<FormControl>
							<Input
								id="message"
								name="message"
								type="text"
								placeholder="Share your thoughts..."
								value={formData.message}
								onChange={(e) => handleInputChange("message", e.target.value)}
								disabled={isPending}
								maxLength={50}
								aria-invalid={!!errors.message}
								autoComplete="off"
							/>
						</FormControl>
						{errors.message && (
							<p className="text-destructive text-sm">{errors.message[0]}</p>
						)}
						<p className="text-muted-foreground text-xs">
							{50 - formData.message.length} characters remaining
						</p>
					</FormItem>

					<FormItem>
						<FormLabel htmlFor="country">Country (optional)</FormLabel>
						<FormControl>
							<div className="relative">
								<Select
									value={formData.country}
									onValueChange={(value) => handleInputChange("country", value)}
									disabled={isPending}
								>
									<SelectTrigger id="country">
										<SelectValue placeholder="Select your country" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="__CLEAR__">
											<span className="text-muted-foreground">
												Clear selection
											</span>
										</SelectItem>
										{countries.map((country) => (
											<SelectItem key={country} value={country}>
												{country}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{/* Hidden input for form submission and browser validation */}
								<input
									type="hidden"
									name="country"
									value={formData.country}
									readOnly
								/>
							</div>
						</FormControl>
						{errors.country && (
							<p className="text-destructive text-sm">{errors.country[0]}</p>
						)}
					</FormItem>

					<Button type="submit" disabled={isPending} className="w-full">
						{isPending ? "Posting..." : "Post Message"}
					</Button>
				</Form>
			</CardContent>
		</Card>
	);
}
