import { Button } from "@/app/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/app/shared/components/ui/card";
import { link } from "@/app/shared/links";

export function Landing() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="text-center">
				<h1 className="font-bold text-6xl">Redwood Cloud</h1>
				<p className="mt-4 text-muted-foreground text-xl">
					A modern full-stack application built with RedwoodSDK
				</p>
				<div className="mt-8 space-x-4">
					<a
						href="/sign-in"
						className="inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
					>
						Get Started
					</a>
					<a
						href="/guestbook"
						className="inline-block rounded-md border px-6 py-3 hover:bg-accent"
					>
						View Guestbook
					</a>
				</div>
			</div>
		</div>
	);
}
