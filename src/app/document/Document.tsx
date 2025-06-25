import styles from "./styles.css?url";

export const Document: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Red Cloud</title>
				<script src="/theme-script.js" />
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<link rel="modulepreload" href="/src/client.tsx" />
				<link rel="stylesheet" href={styles} />
				<script>import("/src/client.tsx")</script>
			</head>
			<body>
				<div id="root">{children}</div>
			</body>
		</html>
	);
};
