import { tool } from "ai";
import z from "zod";

export const Tool_GetTime = tool({
	description: "get the current UTC time",
	inputSchema: z.object({}),

	execute: async () => {
		return new Date().toUTCString();
	},
});
