import { tool } from "ai";
import axios from "axios";
import z from "zod";
import { SessionController } from "../server/session/sessionController.js";

interface SearXNGResult {
	title: string;
	url: string;
	content?: string;
}

export const Tool_WebSearch = tool({
	description: "searches the web, but it's summarized by an agent",
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

		const cleanResults = results.slice(0, 5).map((item) => ({
			title: item.title,
			url: item.url,
			snippet: item.content || "No snippet available",
		}));

		return await SessionController.getInstance().runTemporaryAgent(
			JSON.stringify(cleanResults, null, 2),
			"SYSTEM/WEBSUMMARY.md",
		);
	},
});
