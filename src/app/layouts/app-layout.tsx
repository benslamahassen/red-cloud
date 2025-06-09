import { Header } from "@/app/components/navigation/header";
import { ThemeProvider } from "@/app/components/navigation/theme-provider";
import type { LayoutProps } from "rwsdk/router";

export function AppLayout({ children, requestInfo }: LayoutProps) {
	return (
		<ThemeProvider defaultTheme="system" storageKey="red-cloud-theme">
			<div className="min-h-screen bg-background">
				<header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 dark:bg-background/50">
					<div className="container mx-auto flex h-16 items-center justify-between px-6">
						<a href="/" className="font-semibold text-3xl">
							☁️
						</a>
						{requestInfo && <Header ctx={requestInfo.ctx} />}
					</div>
				</header>
				<main className="container mx-auto px-6 py-8">{children}</main>
			</div>
		</ThemeProvider>
	);
}
