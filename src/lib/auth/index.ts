import { env } from "cloudflare:workers";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { verificationCodeEmail } from "@/lib/auth/email-templates";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, multiSession } from "better-auth/plugins";
import { Resend } from "resend";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: schema,
	}),
	secret: env.BETTER_AUTH_SECRET,
	session: {
		storeSessionInDatabase: true,
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		},
	},

	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				if (process.env.NODE_ENV === "development") {
					console.log(`Sending ${type} code to ${email}: ${otp}`);
					return;
				}
				if (type === "sign-in") {
					const resend = new Resend(env.RESEND_API_KEY as string);
					await resend.emails.send({
						from: `${env.APP_NAME} <${env.RESEND_FROM_EMAIL}>`,
						to: email,
						subject: "Your Verification Code",
						html: verificationCodeEmail(otp),
					});
				}
			},
		}),
		multiSession(),
	],
});
