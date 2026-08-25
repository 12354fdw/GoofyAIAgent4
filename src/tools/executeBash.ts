import { tool } from "ai";
import { exec } from "node:child_process";
import z from "zod";
import { LOGGER } from "../server/slogger.js";

export const Tool_ExecuteBash = tool({
	description: "executes bash on the host computer, do not use interactive commands (including sudo)",
	inputSchema: z.object({
		cmd: z.string().describe("the command, CANNOT be any interactive commands including sudo"),
		timeout: z.number().default(10).describe("timeout, defaults to 10"),
	}),

	needsApproval: true,
	execute: async ({ cmd, timeout }) => {
		return new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve) => {
			console.log();
			LOGGER.warn(`executing bash '${cmd}' with timeout ${timeout}s`);
			exec(cmd, { timeout: timeout * 1000 }, (error, stdout, stderr) => {
				if (error && error.killed) {
					resolve({
						stdout,
						stderr: stderr || `Command timed out after ${timeout}s`,
						exitCode: 124,
					});
					return;
				}
				resolve({
					stdout,
					stderr,
					exitCode: typeof error?.code === "number" ? error.code : 1,
				});
			});
		});
	},
});
