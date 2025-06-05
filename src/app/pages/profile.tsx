import { AppShell } from "@/app/shared/components/app-shell";
import type { AppContext } from "@/worker";

export function Profile({ ctx }: { ctx: AppContext }) {
	return (
		<AppShell ctx={ctx}>
			<div className="flex min-h-[60vh] items-center justify-center">
				<h1 className="font-bold text-4xl">Profile Page</h1>
			</div>
		</AppShell>
	);
}
