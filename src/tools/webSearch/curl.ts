import { tool } from "ai";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import z from "zod";
import TurndownService from "turndown";
import { LOGGER } from "../../shared/globals/logger.js";

const execFileAsync = promisify(execFile);
const turndownService = new TurndownService();

const MAX_BUFFER = 10 * 1024 * 1024;

export const Tool_Curl = tool({
	description: "Fetches a webpage and returns its content as markdown using the curl command.",
	inputSchema: z.object({
		link: z.string().url().describe("The link to fetch."),
		timeout: z.number().int().min(1).max(60).default(10).describe("Timeout in seconds."),
	}),

	execute: async ({ link, timeout }) => {
		LOGGER.warn(`Curling webpage '${link}' with timeout ${timeout}s`);

		try {
			const { stdout, stderr } = await execFileAsync(
				"curl",
				[
					"--silent",
                    "--show-error",
                    "--location",
					"--fail",
					"--max-time",
					String(timeout),
                    "--proto=http,https",
					link,
				],
				{
					timeout: (timeout * 1000) + 1000,
					maxBuffer: MAX_BUFFER,
					windowsHide: true,
				},
			);

			return {
				stdout: turndownService.turndown(stdout),
				stderr,
				exitCode: 0,
			};
		} catch (error) {
			const err = error as NodeJS.ErrnoException & {
				stdout?: string;
				stderr?: string;
				signal?: string;
			};

			return {
				stdout: "",
				stderr: err.stderr ?? err.message,
				exitCode: typeof err.code === "number" ? err.code : 1,
			};
		}
	},
});