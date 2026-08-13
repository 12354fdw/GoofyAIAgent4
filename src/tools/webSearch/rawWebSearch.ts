import { tool } from "ai";
import z from "zod";
import { webSearch } from "./common.js";

export const Tool_RawWebSearch = tool({
	description: "searches the web, and its the raw searxng result",
	inputSchema: z.object({
		query: z.string().describe("the search query string"),
	}),

	execute: async ({ query }) => {
		const results = await webSearch(query);

		if (results.length === 0) return `No search results found for query: ${query}`;

		return JSON.stringify(results, null, 2);
	},
});
