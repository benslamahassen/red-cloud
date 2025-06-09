import type { AppContext } from "@/worker";

export function Counter({ ctx }: { ctx: AppContext }) {
	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<h1 className="font-bold text-4xl">Counter Page</h1>
		</div>
	);
}
