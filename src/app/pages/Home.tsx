import { LogoutButton } from "@/app/shared/components";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/app/shared/components/ui/card";
import { db } from "@/db";
import { user } from "@/db/schema";
import type { AppContext } from "@/worker";

const Home = async ({ ctx }: { ctx: AppContext }) => {
	const allUsers = await db.select().from(user).all();
	const { authUrl } = ctx;

	return (
		<div className="mx-auto max-w-4xl space-y-6 p-8">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-3xl">Home Page</h1>
				<LogoutButton authUrl={authUrl} className="button" />
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Users in Database</CardTitle>
					<p className="text-muted-foreground">
						{allUsers.length} user{allUsers.length !== 1 ? "s" : ""} registered
					</p>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg bg-muted p-4">
						<pre className="max-h-96 overflow-auto whitespace-pre-wrap text-sm">
							{JSON.stringify(allUsers, null, 2)}
						</pre>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export { Home };
