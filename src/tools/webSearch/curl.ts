import { tool } from "ai";
import { exec } from "node:child_process";
import z from "zod";
import { webSearch } from "./common.js";
import TurndownService from "turndown";
import { LOGGER } from "../../shared/globals/logger.js";

const turndownService: TurndownService = new TurndownService();

export const Tool_Curl = tool({
	description: "Returns a markdown-formatted HTML link, using curl.",
	inputSchema: z.object({
		link: z.string().describe(""),
		timeout: z.number().default(10).describe("timeout in seconds, defaults to 10"),
	}),

	execute: async ({ link, timeout }) => {
		return new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve, reject) => {
			LOGGER.warn(`Curling webpage '${link}' with timeout ${timeout}s`);
			exec("curl -sL " + link, { timeout: timeout * 1000 }, (error, stdout, stderr) => {
				if (error && error.killed) {
					reject({
						stdout,
						stderr: stderr || `Curl timed out after ${timeout}s`,
						exitCode: 124,
					});
					return;
				}
				resolve({
					stdout: turndownService.turndown(stdout),
					stderr,
					exitCode: error ? (typeof error.code === "number" ? error.code : 1) : 0,
				});
			});
		});
	},
});
