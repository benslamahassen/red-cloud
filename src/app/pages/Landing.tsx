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
		<div className="mx-auto max-w-2xl p-8">
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-3xl">Redwood-Cloud</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="text-center">
						<Button asChild size="lg">
							<a href={link("/home")}>Go to Home Page</a>
						</Button>
					</div>

					<div className="rounded-lg bg-muted p-4">
						<p className="text-muted-foreground text-sm">
							<strong>Note:</strong> The home page is protected and requires
							authentication. You will be redirected to login if you're not
							signed in.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
