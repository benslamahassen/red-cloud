import { AppShell } from "@/app/shared/components/app-shell";
import type { AppContext } from "@/worker";

export function Guestbook({ ctx }: { ctx: AppContext }) {
	return (
		<AppShell ctx={ctx}>
			<div className="flex min-h-[60vh] items-center justify-center">
				<h1 className="font-bold text-4xl">Guestbook Page</h1>
			</div>
		</AppShell>
	);
}
