import { tool } from "ai";
import { exec } from "node:child_process";
import z from "zod";
import { SLOGGER } from "../server/slogger.js";

export const Tool_ExecuteBash = tool({
	description: "executes bash on the host computer, do not use interactive commands (including sudo)",
	inputSchema: z.object({
		cmd: z.string(),
	}),

	needsApproval: false, // will be changed later
	execute: async ({ cmd }) => {
		return new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve) => {
			console.log();
			SLOGGER.warn(`executing bash '${cmd}'`);
			exec(cmd, (error, stdout, stderr) => {
				resolve({
					stdout,
					stderr,
					exitCode: typeof error?.code === "number" ? error.code : 1,
				});
			});
		});
	},
});
