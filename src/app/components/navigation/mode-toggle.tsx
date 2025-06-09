"use client";

import { Check, Moon, Sun } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useTheme } from "@/app/hooks/use-theme";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="h-9 w-9 p-0">
					<Sun className="dark:-rotate-90 h-4 w-4 rotate-0 scale-100 transition-all dark:scale-0" />
					<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-36">
				<DropdownMenuItem
					onClick={() => setTheme("light")}
					className="flex justify-between text-sm"
				>
					Light
					<Check
						className={`h-3 w-3 ${theme === "light" ? "opacity-100" : "opacity-0"}`}
					/>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setTheme("dark")}
					className="flex justify-between text-sm"
				>
					Dark
					<Check
						className={`h-3 w-3 ${theme === "dark" ? "opacity-100" : "opacity-0"}`}
					/>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setTheme("system")}
					className="flex justify-between text-sm"
				>
					System
					<Check
						className={`h-3 w-3 ${theme === "system" ? "opacity-100" : "opacity-0"}`}
					/>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
