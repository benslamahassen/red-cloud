import { env } from "cloudflare:workers";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";

import { db } from "@/db";
import * as schema from "@/db/schema";
import {
	DeleteAccountEmail,
	VerificationCodeEmail,
} from "@/lib/auth/email-templates";
import { EMAIL_FROM_ADDRESS, EMAIL_FROM_NAME } from "@/lib/utils/constants";
import { sendEmail } from "@/lib/utils/email";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: schema,
	}),
	secret: env.BETTER_AUTH_SECRET,
	session: {
		storeSessionInDatabase: true,
	},
	user: {
		deleteUser: {
			enabled: true,
			sendDeleteAccountVerification: async ({ user, url, token }) => {
				await sendEmail(
					{
						from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
						to: user.email,
						subject: "Confirm Account Deletion",
						html: DeleteAccountEmail({ url, token }),
					},
					env.RESEND_API_KEY as string,
				);
			},
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
					await sendEmail(
						{
							from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
							to: email,
							subject: "Your Verification Code",
							html: VerificationCodeEmail({ otp }),
						},
						env.RESEND_API_KEY as string,
					);
				}
			},
		}),
	],
});
