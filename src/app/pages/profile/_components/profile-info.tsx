import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";

import { AvatarManager } from "./avatar-manager";

// Define ProfileInfoProps interface
interface ProfileInfoProps {
	user: {
		id: string;
		name: string | null;
		email: string;
		emailVerified: boolean | null;
		image: string | null;
		createdAt: Date | null;
		updatedAt: Date | null;
	};
}

function getInitials(name: string | null, email: string): string {
	if (name) {
		return name
			.split(" ")
			.map((part) => part.charAt(0))
			.join("")
			.toUpperCase()
			.slice(0, 2);
	}
	return email.charAt(0).toUpperCase();
}

function getAvatarUrl(imagePath: string | null): string | null {
	if (!imagePath) return null;
	return `/r2/avatars/${imagePath.replace("avatars/", "")}`;
}

function formatDate(date: Date | null): string {
	if (!date) return "Unknown";
	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export function ProfileInfo({ user }: ProfileInfoProps) {
	const initials = getInitials(user.name, user.email);
	const avatarUrl = getAvatarUrl(user.image);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile Information</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Avatar display with fallback to initials */}
				<div className="flex items-center space-x-4">
					<div className="relative">
						<Avatar className="h-20 w-20">
							<AvatarImage
								src={avatarUrl || undefined}
								alt={user.name || "User avatar"}
							/>
							<AvatarFallback className="text-lg">{initials}</AvatarFallback>
						</Avatar>
					</div>
					<div className="space-y-1">
						{/* Display user name with fallback handling */}
						<h3 className="font-semibold text-lg">
							{user.name || "No name set"}
						</h3>
						<div className="flex items-center space-x-2">
							{/* Show email with verification status indicator */}
							<p className="text-muted-foreground text-sm">{user.email}</p>
							{user.emailVerified ? (
								<Badge variant="default" className="text-xs">
									Verified
								</Badge>
							) : (
								<Badge variant="secondary" className="text-xs">
									Unverified
								</Badge>
							)}
						</div>
					</div>
				</div>

				<AvatarManager currentAvatar={user.image} />

				{/* Display account creation and last updated dates */}
				<div className="space-y-2 text-muted-foreground text-sm">
					<div className="flex justify-between">
						<span>Member since:</span>
						<span>{formatDate(user.createdAt)}</span>
					</div>
					{user.updatedAt && (
						<div className="flex justify-between">
							<span>Last updated:</span>
							<span>{formatDate(user.updatedAt)}</span>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
