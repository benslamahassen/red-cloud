import { Header } from "@/app/components/navigation/header";
import { OnboardingModal } from "@/app/pages/guestbook/components/onboarding-modal";
import { ClientProviders } from "@/app/providers/client-providers";
import type { LayoutProps } from "rwsdk/router";

export function AppLayout({ children, requestInfo }: LayoutProps) {
	const ctx = requestInfo?.ctx;

	return (
		<ClientProviders initialUser={ctx?.user}>
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

				{/* Onboarding Modal */}
				{ctx?.needsOnboarding && ctx.user && (
					<OnboardingModal isOpen={true} userEmail={ctx.user.email} />
				)}
			</div>
		</ClientProviders>
	);
}
