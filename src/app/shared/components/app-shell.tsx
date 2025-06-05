import { LogoutButton } from "@/app/shared/components/logout-button";
import type { AppContext } from "@/worker";

interface AppShellProps {
	children: React.ReactNode;
	ctx: AppContext;
}

export function AppShell({ children, ctx }: AppShellProps) {
	return (
		<div className="min-h-screen bg-background">
			<header className="border-b bg-card">
				<div className="container mx-auto flex h-16 items-center justify-between px-4">
					<a
						href="/"
						className="font-semibold text-xl transition-colors hover:text-primary"
					>
						Redwood Cloud
					</a>
					<nav className="flex items-center space-x-4">
						<a href="/guestbook" className="text-sm hover:underline">
							Guestbook
						</a>
						<a href="/counter" className="text-sm hover:underline">
							Counter
						</a>
						<a href="/profile" className="text-sm hover:underline">
							Profile
						</a>
						{ctx.user ? (
							<div className="flex items-center space-x-4">
								<span className="text-muted-foreground text-sm">
									Welcome, {ctx.user.name || ctx.user.email}
								</span>
								<LogoutButton
									authUrl={ctx.authUrl}
									className="h-8 rounded-md bg-destructive px-3 text-destructive-foreground text-sm hover:bg-destructive/90"
								/>
							</div>
						) : (
							<a
								href="/sign-in"
								className="rounded-md bg-primary px-3 py-1 text-primary-foreground text-sm hover:bg-primary/90"
							>
								Login
							</a>
						)}
					</nav>
				</div>
			</header>
			<main className="container mx-auto px-4 py-8">{children}</main>
		</div>
	);
}
