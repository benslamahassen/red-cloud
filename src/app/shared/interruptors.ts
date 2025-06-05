import { link } from "@/app/shared/links";
import type { AppContext } from "@/worker";

export const redirectIfAuth = ({ ctx }: { ctx: AppContext }) => {
	if (ctx.user) {
		return new Response(null, {
			status: 302,
			headers: { Location: link("/") },
		});
	}
};

export const requireAuth = ({ ctx }: { ctx: AppContext }) => {
	if (!ctx.user) {
		return new Response(null, {
			status: 302,
			headers: { Location: link("/sign-in") },
		});
	}
};
