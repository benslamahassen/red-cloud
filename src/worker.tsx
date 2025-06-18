import { layout, render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/document/Document";
import { setCommonHeaders } from "@/app/document/headers";

import { AppLayout } from "@/app/layouts/app-layout";

import { Counter } from "@/app/pages/counter";
import { GuestbookPage } from "@/app/pages/guestbook/guestbook-page";
import { Landing } from "@/app/pages/landing";
import { NotFound } from "@/app/pages/not-found";
import { ProfilePage } from "@/app/pages/profile/profile-page";
import { SignIn } from "@/app/pages/sign-in/sign-in-page";

import { apiRoutes } from "@/api/routes";

import { appMiddleware } from "@/middleware/app-middleware";
import { redirectIfAuth, requireAuth } from "@/middleware/auth-interruptors";

export default defineApp([
	setCommonHeaders(),

	appMiddleware,

	apiRoutes,

	render(Document, [
		layout(AppLayout, [
			route("/", Landing),
			route("/sign-in", [redirectIfAuth, SignIn]),
			route("/guestbook", [requireAuth, GuestbookPage]),
			route("/counter", [requireAuth, Counter]),
			route("/profile", [requireAuth, ProfilePage]),
		]),
		route("*", NotFound),
	]),
]);
