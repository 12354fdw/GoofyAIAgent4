import { tool } from "ai";
import z from "zod";
import { SessionController } from "../../server/session/sessionController.js";
import { webSearch } from "./common.js";
import { ToolRegistry } from "../../server/toolRegistry.js";

export const Tool_WebSearch = tool({
	description: "searches the web, but it's summarized by an agent",
	inputSchema: z.object({
		query: z.string().describe("the search query string"),
	}),

	execute: async ({ query }) => {
		const results = await webSearch(query);

		if (results.length === 0) return `No search results found for query: ${query}`;

		return await SessionController.getInstance().runTemporaryAgent(JSON.stringify(results, null, 2), {
			model: "deepseek/deepseek-v4-flash-0731",
			instruction: "SYSTEM/WEBSUMMARY.md",
			toolBlacklist: Object.values(ToolRegistry.getInstance().getTools()),
		});
	},
});
