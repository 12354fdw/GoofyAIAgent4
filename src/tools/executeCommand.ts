import { tool } from "ai";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import z from "zod";
import { LOGGER } from "../shared/globals/logger.js";
import os from "node:os";

const execAsync = promisify(exec);
const MAX_BUFFER = 1 * 1024 * 1024

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
		timeout: z.number().int().min(1).max(60).default(10).describe("Timeout in seconds."),
	}),

	needsApproval: true,
	execute: async ({ cmd, timeout }) => {
		LOGGER.warn(`Executing command '${cmd}' with timeout ${timeout}s`);

		try {
			const { stdout, stderr } = await execAsync(cmd, { timeout: timeout * 1000 + 1000, windowsHide: true, maxBuffer: MAX_BUFFER });

			return {
				stdout: stdout,
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
				stdout: err.stdout ?? "",
				stderr: err.stderr ?? err.message,
				exitCode: typeof err.code === "number" ? err.code : 1,
			};
		}
	},
});
