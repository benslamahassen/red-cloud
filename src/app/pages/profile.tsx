import type { AppContext } from "@/worker";

export function Profile({ ctx }: { ctx: AppContext }) {
	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<h1 className="font-bold text-4xl">Profile Page</h1>
		</div>
	);
}
