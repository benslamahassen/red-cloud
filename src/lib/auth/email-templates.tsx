import {
	Body,
	Container,
	Font,
	Head,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

import { RenderEmail } from "./render-email";

interface VerificationCodeEmailProps {
	otp: string;
}

interface DeleteAccountEmailProps {
	url: string;
	token: string;
}

export function VerificationCodeEmail({ otp }: VerificationCodeEmailProps) {
	return (
		<RenderEmail>
			<Html>
				<Head>
					<Font fontFamily="Inter" fallbackFontFamily="Arial" />
				</Head>
				<Preview>Your verification code: {otp}</Preview>
				<Body style={main}>
					<Container style={container}>
						<Section>
							<Text style={heading}>Hi!</Text>
							<Text style={text}>
								Please use the following code to verify your account:
							</Text>
							<Section style={codeContainer}>
								<Text style={code}>{otp}</Text>
							</Section>
							<Text style={text}>
								This code will expire in 10 minutes. If you didn't request this
								code, you can safely ignore this email.
							</Text>
						</Section>
						<Section style={footer}>
							<Text style={footerText}>
								Best regards,
								<br />
								Better ☁️
							</Text>
						</Section>
					</Container>
				</Body>
			</Html>
		</RenderEmail>
	);
}

export function DeleteAccountEmail({ url, token }: DeleteAccountEmailProps) {
	const deleteUrl = `${url}?token=${token}`;

	return (
		<RenderEmail>
			<Html>
				<Head>
					<Font fontFamily="Inter" fallbackFontFamily="Arial" />
				</Head>
				<Preview>Confirm account deletion</Preview>
				<Body style={main}>
					<Container style={container}>
						<Section>
							<Text style={heading}>Hi!</Text>
							<Text style={text}>
								We received a request to delete your account. To confirm this
								action, please click the button below:
							</Text>
							<Section style={buttonContainer}>
								<Link href={deleteUrl} style={button}>
									Delete Account
								</Link>
							</Section>
							<Text style={text}>
								If you didn't request this action, you can safely ignore this
								email.
							</Text>
						</Section>
						<Section style={footer}>
							<Text style={footerText}>
								Best regards,
								<br />
								Better ☁️
							</Text>
						</Section>
					</Container>
				</Body>
			</Html>
		</RenderEmail>
	);
}

// Styles
const main = {
	backgroundColor: "#ffffff",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
	lineHeight: "1.6",
	color: "#333333",
};

const container = {
	maxWidth: "600px",
	margin: "0 auto",
	padding: "20px",
	backgroundColor: "#ffffff",
	borderRadius: "8px",
};

const heading = {
	fontSize: "24px",
	fontWeight: "600",
	margin: "0 0 20px 0",
	color: "#333333",
};

const text = {
	fontSize: "16px",
	margin: "0 0 16px 0",
	color: "#333333",
};

const codeContainer = {
	textAlign: "center" as const,
	margin: "20px 0",
};

const code = {
	fontSize: "32px",
	fontWeight: "bold",
	letterSpacing: "4px",
	textAlign: "center" as const,
	padding: "20px",
	backgroundColor: "#f8f9fa",
	borderRadius: "6px",
	margin: "0",
	display: "inline-block",
};

const buttonContainer = {
	textAlign: "center" as const,
	margin: "30px 0",
};

const button = {
	backgroundColor: "#007bff",
	color: "#ffffff",
	padding: "12px 24px",
	borderRadius: "6px",
	textDecoration: "none",
	display: "inline-block",
	fontWeight: "600",
	fontSize: "16px",
};

const footer = {
	marginTop: "30px",
	textAlign: "center" as const,
};

const footerText = {
	fontSize: "14px",
	color: "#666666",
	margin: "0",
};
