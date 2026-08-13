import axios from "axios";

export interface SearXNGResult {
	title: string;
	url: string;
	content?: string;
}

export async function webSearch(query: string) {
	const searXNGUrl = "localhost:8080";
	const response = await axios.get(`http://${searXNGUrl}/search`, {
		params: {
			q: query,
			format: "json",
			language: "en-US",
		},
		timeout: 6000,
	});

	const results: SearXNGResult[] = response.data?.results || [];
	return results;
}
