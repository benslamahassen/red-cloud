const title = `

 ███████████                █████      █████████  ████                          █████
░░███░░░░░███              ░░███      ███░░░░░███░░███                         ░░███ 
 ░███    ░███   ██████   ███████     ███     ░░░  ░███   ██████  █████ ████  ███████ 
 ░██████████   ███░░███ ███░░███    ░███          ░███  ███░░███░░███ ░███  ███░░███ 
 ░███░░░░░███ ░███████ ░███ ░███    ░███          ░███ ░███ ░███ ░███ ░███ ░███ ░███ 
 ░███    ░███ ░███░░░  ░███ ░███    ░░███     ███ ░███ ░███ ░███ ░███ ░███ ░███ ░███ 
 █████   █████░░██████ ░░████████    ░░█████████  █████░░██████  ░░████████░░████████
░░░░░   ░░░░░  ░░░░░░   ░░░░░░░░      ░░░░░░░░░  ░░░░░  ░░░░░░    ░░░░░░░░  ░░░░░░░░ 

`;

export function Landing() {
	return (
		<div className="flex min-h-[60vh] items-center justify-center bg-background">
			<div className="text-center">
				<pre className="mx-auto overflow-x-auto text-center font-mono text-[0.5rem] sm:text-xs md:text-sm">
					{title}
				</pre>
				<p className="mt-4 flex flex-col items-center gap-2 text-muted-foreground text-xl sm:flex-row sm:justify-center">
					<a
						href="https://github.com/redwoodjs/sdk"
						className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text font-bold text-transparent underline"
					>
						RedwoodSDK
					</a>
					<span className="text-2xl">➕</span>
					<a
						href="https://github.com/sam-goodwin/alchemy"
						className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text font-bold text-transparent underline"
					>
						Alchemy
					</a>
					<span className="text-2xl">🤝</span>
					<a
						href="https://github.com/oscabriel/better-cloud"
						className="font-bold"
					>
						Better-Cloud
					</a>
				</p>
				<div className="mt-8 space-x-4">
					<a
						href="/guestbook"
						className="inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
					>
						Get Started
					</a>
				</div>
			</div>
		</div>
	);
}
