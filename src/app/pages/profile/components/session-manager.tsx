"use client";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import { setupAuthClient } from "@/lib/auth/auth-client";
import { Monitor, Smartphone, Tablet, Trash2 } from "lucide-react";
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
	if (!userAgent) return <Monitor className="h-4 w-4" />;

	const ua = userAgent.toLowerCase();
	if (
		ua.includes("mobile") ||
		ua.includes("android") ||
		ua.includes("iphone")
	) {
		return <Smartphone className="h-4 w-4" />;
	}
	if (ua.includes("tablet") || ua.includes("ipad")) {
		return <Tablet className="h-4 w-4" />;
	}
	return <Monitor className="h-4 w-4" />;
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
	if (userAgent.includes("Windows")) os = "Windows";
	else if (userAgent.includes("Mac")) os = "macOS";
	else if (userAgent.includes("Linux")) os = "Linux";
	else if (userAgent.includes("Android")) os = "Android";
	else if (userAgent.includes("iOS")) os = "iOS";

	return `${browser} on ${os}`;
}

function formatDate(date: Date): string {
	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
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
			console.log("🔍 [Session Manager] Current session:", currentSession);

			let currentToken: string | undefined;
			if (currentSession?.session) {
				currentToken = currentSession.session.token;
				setCurrentSessionToken(currentToken);
			}

			// List all sessions
			const { data: allSessions, error } = await authClient.listSessions();
			console.log(
				"📱 [Session Manager] All sessions response:",
				allSessions,
				error,
			);

			if (error) {
				console.error("❌ [Session Manager] Error listing sessions:", error);
				toast.error("Failed to load sessions");
				// Fallback to current session if available
				if (currentSession?.session) {
					setSessions([currentSession.session]);
				} else {
					setSessions([]);
				}
			} else if (allSessions && Array.isArray(allSessions)) {
				console.log(
					"✅ [Session Manager] Valid sessions array:",
					allSessions.length,
				);
				setSessions(allSessions);
			} else {
				console.log(
					"❌ [Session Manager] Invalid sessions response, falling back to current session",
				);
				// If API fails but we have current session, show at least that
				if (currentSession?.session) {
					setSessions([currentSession.session]);
				} else {
					setSessions([]);
				}
			}
		} catch (error) {
			console.error("💥 [Session Manager] Error loading sessions:", error);
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
				console.error("💥 [Session Manager] Fallback error:", fallbackError);
				setSessions([]);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleRevokeSession = (sessionToken: string) => {
		if (
			!confirm(
				"Are you sure you want to revoke this session? You will be logged out from that device.",
			)
		) {
			return;
		}

		startTransition(async () => {
			try {
				const { error } = await authClient.revokeSession({
					token: sessionToken,
				});

				if (error) {
					console.error("Error revoking session:", error);
					toast.error("Failed to revoke session");
				} else {
					toast.success("Session revoked successfully");
					// Reload sessions to reflect changes
					await loadSessions();
				}
			} catch (error) {
				console.error("Error revoking session:", error);
				toast.error("Failed to revoke session");
			}
		});
	};

	const handleRevokeOtherSessions = () => {
		if (
			!confirm(
				"Are you sure you want to revoke all other sessions? You will be logged out from all other devices.",
			)
		) {
			return;
		}

		startTransition(async () => {
			try {
				const { error } = await authClient.revokeOtherSessions();

				if (error) {
					console.error("Error revoking other sessions:", error);
					toast.error("Failed to revoke other sessions");
				} else {
					toast.success("All other sessions revoked successfully");
					// Reload sessions to reflect changes
					await loadSessions();
				}
			} catch (error) {
				console.error("Error revoking other sessions:", error);
				toast.error("Failed to revoke other sessions");
			}
		});
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Active Sessions</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">Loading sessions...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					Active Sessions
					{sessions.length > 1 && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleRevokeOtherSessions}
							disabled={isPending}
						>
							Revoke All Others
						</Button>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{sessions.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						No active sessions found.
					</p>
				) : (
					<div className="space-y-3">
						{sessions.map((session) => {
							const isCurrent = isCurrentSession(session, currentSessionToken);

							return (
								<div
									key={session.id}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div className="flex items-center space-x-3">
										{getDeviceIcon(session.userAgent)}
										<div className="space-y-1">
											<div className="flex items-center space-x-2">
												<p className="font-medium text-sm">
													{getDeviceInfo(session.userAgent)}
												</p>
												{isCurrent && (
													<Badge variant="default" className="text-xs">
														Current
													</Badge>
												)}
											</div>
											<div className="space-y-1 text-muted-foreground text-xs">
												{session.ipAddress && <p>IP: {session.ipAddress}</p>}
												<p>
													Last active: {formatDate(new Date(session.updatedAt))}
												</p>
												<p>
													Created: {formatDate(new Date(session.createdAt))}
												</p>
											</div>
										</div>
									</div>

									{!isCurrent && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleRevokeSession(session.token)}
											disabled={isPending}
											className="flex items-center space-x-1"
										>
											<Trash2 className="h-3 w-3" />
											<span>Revoke</span>
										</Button>
									)}
								</div>
							);
						})}
					</div>
				)}

				<div className="pt-4 text-muted-foreground text-xs">
					<p>
						Sessions are automatically created when you sign in from different
						devices or browsers. You can revoke sessions from devices you no
						longer use for security.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
