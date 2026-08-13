import { tool } from "ai";
import axios from "axios";
import z from "zod";

interface SearXNGResult {
	title: string;
	url: string;
	content?: string;
}

export const Tool_RawWebSearch = tool({
	description: "searches the web, and its the raw searxng result",
	inputSchema: z.object({
		query: z.string().describe("the search query string"),
	}),

	execute: async ({ query }) => {
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

		if (results.length === 0) return `No search results found for query: ${query}`;

		return JSON.stringify(results, null, 2);
	},
});
