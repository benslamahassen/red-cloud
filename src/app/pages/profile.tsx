import type { AppContext } from "@/worker";

export function Profile({ ctx }: { ctx: AppContext }) {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-y-2">
			<h1 className="font-bold text-4xl">Profile Page</h1>
			<p className="text-muted-foreground">Coming soon...</p>
		</div>
	);
}
