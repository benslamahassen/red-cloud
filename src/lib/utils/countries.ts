interface Country {
	name: {
		common: string;
	};
}

export async function getCountries(): Promise<{
	success: boolean;
	countries?: string[];
	error?: string;
}> {
	try {
		const response = await fetch(
			"https://restcountries.com/v3.1/all?fields=name",
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: Country[] = await response.json();

		// Extract country names and sort alphabetically
		const countryNames = data
			.map((country) => country.name.common)
			.filter(Boolean) // Remove any undefined/null values
			.sort((a, b) => a.localeCompare(b));

		return {
			success: true,
			countries: countryNames,
		};
	} catch (error) {
		console.error("Failed to fetch countries:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to fetch countries",
		};
	}
}
