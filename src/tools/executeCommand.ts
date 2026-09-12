import { tool } from "ai";
import { exec } from "node:child_process";
import z from "zod";
import { LOGGER } from "../shared/globals/logger.js";
import os from "node:os";

function getOsAgentDescription(platformName: string): string {
	switch (platformName) {
		case "aix":
			return "The OS you are using is IBM Advanced Interactive Executive.";
		case "win32":
			return "The OS you are using is Windows 32/64-bit.";
		case "darwin":
			return "The OS you are using is Apple macOS or iOS (Apple Darwin OS).";
		case "linux":
			return "The OS you are using is Linux.";
		case "freebsd":
			return "The OS you are using is FreeBSD.";
		case "openbsd":
			return "The OS you are using is OpenBSD.";
		case "sunos":
			return "The OS you are using is Oracle Solaris / SunOS.";
		default:
			LOGGER.warn("Attempted to give the agent a description of the OS, but the OS identifier is unknown.", {
				osIdentifier: platformName,
			});

			return `The OS you are using is unidentifiable, but the platform name as returned by Node.js is ${platformName}`;
	}
}

export const Tool_ExecuteCommand = tool({
	description:
		"Executes a command by sending a string to the terminal of the user. Do not use interactive commands, such as text editors, or sudo. " +
		getOsAgentDescription(os.platform()),
	inputSchema: z.object({
		cmd: z.string().describe("The command CANNOT be any interactive commands, including sudo."),
		timeout: z.number().default(10).describe("timeout, defaults to 10"),
	}),

	needsApproval: true,
	execute: async ({ cmd, timeout }) => {
		return new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve, reject) => {
			LOGGER.warn(`executing command '${cmd}' with timeout ${timeout}s`);
			exec(cmd, { timeout: timeout * 1000 }, (error, stdout, stderr) => {
				if (error && error.killed) {
					reject({
						stdout,
						stderr: stderr || `Command timed out after ${timeout}s`,
						exitCode: 124,
					});
					return;
				}
				resolve({
					stdout,
					stderr,
					exitCode: error ? (typeof error.code === "number" ? error.code : 1) : 0,
				});
			});
		});
	},
});
