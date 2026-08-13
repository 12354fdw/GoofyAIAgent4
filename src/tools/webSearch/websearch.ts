import { tool } from "ai";
import z from "zod";
import { SessionController } from "../../server/session/sessionController.js";
import { webSearch } from "./common.js";

export const Tool_WebSearch = tool({
	description: "searches the web, but it's summarized by an agent",
	inputSchema: z.object({
		query: z.string().describe("the search query string"),
	}),

	execute: async ({ query }) => {
		const results = await webSearch(query);

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
