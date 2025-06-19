import type { AppContext } from "@/types/app";

export function Counter({ ctx: _ }: { ctx: AppContext }) {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-y-2">
			<h1 className="font-bold text-4xl">Counter Page</h1>
			<p className="text-muted-foreground">Coming soon...</p>
		</div>
	);
}
