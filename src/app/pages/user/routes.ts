import { Login } from "@/app/pages/user/login";
import { link } from "@/app/shared/links";
import type { AppContext } from "@/worker";
import { route } from "rwsdk/router";

const redirectIfAuthenticated = ({ ctx }: { ctx: AppContext }) => {
	if (ctx.user) {
		return new Response(null, {
			status: 302,
			headers: { Location: link("/home") },
		});
	}
};

export const userRoutes = [route("/login", [redirectIfAuthenticated, Login])];
