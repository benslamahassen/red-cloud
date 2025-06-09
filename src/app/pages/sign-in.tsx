import { SignInForm } from "@/app/components/pages/sign-in/form";
import type { AppContext } from "@/worker";

export function SignIn({ ctx }: { ctx: AppContext }) {
	return (
		<div className="mx-auto max-w-md py-8">
			<SignInForm authUrl={ctx.authUrl} />
		</div>
	);
}
