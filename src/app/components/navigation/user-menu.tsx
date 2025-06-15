"use client";

import { LogoutButton } from "@/app/components/navigation/logout-button";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useSession } from "@/app/hooks/use-session";
import { getUserDisplayName, getUserInitials } from "@/lib/utils/user-utils";
import type { AppContext } from "@/types/app";
import { UserCircle } from "lucide-react";

interface UserMenuProps {
	ctx: AppContext;
}

function getAvatarUrl(imagePath: string | null): string | null {
	if (!imagePath) return null;
	return `/r2/avatars/${imagePath.replace("avatars/", "")}`;
}

export function UserMenu({ ctx }: UserMenuProps) {
	// Use the enhanced session hook for user data
	const { user: currentUser } = useSession();

	if (!currentUser) {
		return (
			<Button variant="outline" size="sm" className="h-9 px-3" asChild>
				<a href="/sign-in">Sign In</a>
			</Button>
		);
	}

	const avatarUrl = getAvatarUrl(currentUser.image);
	const displayName = getUserDisplayName(currentUser);
	const initials = getUserInitials(currentUser);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="h-9 px-3">
					Account
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56 rounded-lg" align="end">
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar className="h-7 w-7 rounded-lg">
							<AvatarImage src={avatarUrl || ""} alt={displayName} />
							<AvatarFallback className="rounded-lg text-xs">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium text-sm">
								{displayName}
							</span>
							<span className="truncate text-muted-foreground text-xs">
								{currentUser.email}
							</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild className="text-sm">
						<a href="/profile">
							<UserCircle className="mr-2 h-4 w-4" />
							Profile
						</a>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="p-0">
					<LogoutButton authUrl={ctx.authUrl} />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
