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
import type { AppContext } from "@/worker";
import { UserCircle } from "lucide-react";

interface UserMenuProps {
	ctx: AppContext;
}

export function UserMenu({ ctx }: UserMenuProps) {
	if (!ctx.user) {
		return (
			<Button variant="outline" size="sm" className="h-9 px-3" asChild>
				<a href="/sign-in">Sign In</a>
			</Button>
		);
	}

	// Get user initials for avatar fallback
	const getUserInitials = () => {
		if (!ctx.user?.name) return "U";
		return ctx.user.name
			.split(" ")
			.map((name) => name[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

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
							<AvatarImage
								src={ctx.user.image || ""}
								alt={ctx.user.name || "User"}
							/>
							<AvatarFallback className="rounded-lg text-xs">
								{getUserInitials()}
							</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium text-sm">
								{ctx.user.name || "User"}
							</span>
							<span className="truncate text-muted-foreground text-xs">
								{ctx.user.email}
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
