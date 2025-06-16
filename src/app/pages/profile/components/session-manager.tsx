"use client";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { setupAuthClient } from "@/lib/auth/auth-client";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface SessionData {
	id: string;
	token: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
	ipAddress?: string | null;
	userAgent?: string | null;
	userId: string;
}

interface SessionManagerProps {
	authUrl: string;
}

function getDeviceIcon(userAgent?: string | null) {
	if (!userAgent) return <Monitor className="h-3 w-3" />;

	const ua = userAgent.toLowerCase();
	if (
		ua.includes("mobile") ||
		ua.includes("android") ||
		ua.includes("iphone")
	) {
		return <Smartphone className="h-3 w-3" />;
	}
	if (ua.includes("tablet") || ua.includes("ipad")) {
		return <Tablet className="h-3 w-3" />;
	}
	return <Monitor className="h-3 w-3" />;
}

function getDeviceInfo(userAgent?: string | null): string {
	if (!userAgent) return "Unknown Device";

	// Extract browser info
	let browser = "Unknown Browser";
	if (userAgent.includes("Chrome")) browser = "Chrome";
	else if (userAgent.includes("Firefox")) browser = "Firefox";
	else if (userAgent.includes("Safari")) browser = "Safari";
	else if (userAgent.includes("Edge")) browser = "Edge";

	// Extract OS info
	let os = "Unknown OS";
	if (
		userAgent.includes("iPhone") ||
		userAgent.includes("iPad") ||
		userAgent.includes("iPod") ||
		userAgent.includes("iOS")
	)
		os = "iOS";
	else if (userAgent.includes("Android")) os = "Android";
	else if (userAgent.includes("Windows")) os = "Windows";
	else if (userAgent.includes("Mac")) os = "macOS";
	else if (userAgent.includes("Linux")) os = "Linux";

	return `${browser} on ${os}`;
}

function isCurrentSession(
	session: SessionData,
	currentSessionToken?: string,
): boolean {
	return session.token === currentSessionToken;
}

export function SessionManager({ authUrl }: SessionManagerProps) {
	const [sessions, setSessions] = useState<SessionData[]>([]);
	const [currentSessionToken, setCurrentSessionToken] = useState<string>();
	const [isLoading, setIsLoading] = useState(true);
	const [isPending, startTransition] = useTransition();

	const authClient = setupAuthClient(authUrl);

	// Load sessions on component mount
	useEffect(() => {
		loadSessions();
	}, []);

	const loadSessions = async () => {
		try {
			setIsLoading(true);

			// Get current session to identify which one is active
			const { data: currentSession } = await authClient.getSession();

			let currentToken: string | undefined;
			if (currentSession?.session) {
				currentToken = currentSession.session.token;
				setCurrentSessionToken(currentToken);
			}

			// List all sessions
			const { data: allSessions, error } = await authClient.listSessions();

			if (error) {
				console.error("Error listing sessions:", error);
				toast.error("Failed to load sessions");
				// Fallback to current session if available
				if (currentSession?.session) {
					setSessions([currentSession.session]);
				} else {
					setSessions([]);
				}
			} else if (allSessions && Array.isArray(allSessions)) {
				setSessions(allSessions);
			} else {
				// If API fails but we have current session, show at least that
				if (currentSession?.session) {
					setSessions([currentSession.session]);
				} else {
					setSessions([]);
				}
			}
		} catch (error) {
			console.error("Error loading sessions:", error);
			toast.error("Failed to load sessions");

			// Try to show current session even if API fails
			try {
				const { data: currentSession } = await authClient.getSession();
				if (currentSession?.session) {
					setSessions([currentSession.session]);
					setCurrentSessionToken(currentSession.session.token);
				} else {
					setSessions([]);
				}
			} catch (fallbackError) {
				console.error("Fallback error:", fallbackError);
				setSessions([]);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleSignOut = (sessionToken: string) => {
		startTransition(async () => {
			try {
				const { error } = await authClient.revokeSession({
					token: sessionToken,
				});

				if (error) {
					console.error("Error revoking session:", error);
					toast.error("Failed to sign out");
				} else {
					toast.success("Signed out successfully");
					// Reload sessions to reflect changes
					await loadSessions();
				}
			} catch (error) {
				console.error("Error revoking session:", error);
				toast.error("Failed to sign out");
			}
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-3">
				<h3 className="font-medium text-sm">Active Sessions</h3>
				<p className="text-muted-foreground text-xs">Loading sessions...</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<h3 className="font-medium text-sm">Active Sessions</h3>
			{sessions.length === 0 ? (
				<p className="text-muted-foreground text-xs">
					No active sessions found.
				</p>
			) : (
				<div className="space-y-2">
					{sessions.map((session) => {
						const isCurrent = isCurrentSession(session, currentSessionToken);

						return (
							<div key={session.id} className="flex items-center space-x-2">
								{getDeviceIcon(session.userAgent)}
								<div className="flex items-center space-x-2">
									<span className="text-xs">
										{getDeviceInfo(session.userAgent)}
									</span>
									{!isCurrent && (
										<button
											type="button"
											onClick={() => handleSignOut(session.token)}
											disabled={isPending}
											className="text-destructive text-xs underline hover:text-destructive/90 disabled:opacity-50"
										>
											Sign Out
										</button>
									)}
									{isCurrent && (
										<Badge variant="default" className="text-xs">
											Current
										</Badge>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
