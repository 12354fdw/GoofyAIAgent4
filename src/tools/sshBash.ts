import { tool } from "ai";
import { Client } from "ssh2";
import z from "zod";
import { LOGGER } from "../server/logger.js";

export const Tool_SshBash = tool({
	description: "executes one bash command over a single ssh connection that terminates when the command finishes",
	inputSchema: z.object({
		host: z.string().describe("the ssh host"),
		cmd: z
			.string()
			.describe("the command to run on the remote host, CANNOT be any interactive commands including sudo"),
		user: z.string().describe("the ssh username"),
		password: z.string().describe("the ssh password"),
		timeout: z.number().default(10).describe("timeout in seconds, defaults to 10"),
	}),

	needsApproval: true,
	execute: async ({ host, cmd, user, password, timeout }) => {
		return new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve, reject) => {
			console.log();
			LOGGER.warn(`executing ssh bash '${cmd}' on '${host}' as '${user}' with timeout ${timeout}s`);

			let settled = false;

			const finish = (stdout: string, stderr: string, exitCode: number, isError: boolean) => {
				if (settled) return;
				settled = true;
				clearTimeout(connectionTimer);
				conn.end();
				if (isError) reject({ stdout, stderr, exitCode });
				if (!isError) resolve({ stdout, stderr, exitCode });
			};

			const connectionTimer = setTimeout(() => {
				finish("", `Command timed out after ${timeout}s`, 124, true);
			}, timeout * 1000);

			const conn = new Client();

			conn.on("ready", () => {
				if (settled) return;
				conn.exec(cmd, (err, stream) => {
					if (err) {
						finish("", err.message, 1, true);
						return;
					}

					let stdout = "";
					let stderr = "";
					stream
						.on("close", (code: number) => {
							finish(stdout, stderr, code ?? 1, false);
						})
						.on("data", (data: Buffer) => {
							stdout += data.toString();
						});
					stream.stderr.on("data", (data: Buffer) => {
						stderr += data.toString();
					});
				});
			})
				.on("error", (err) => {
					finish("", err.message, 1, true);
				})
				.connect({
					host,
					username: user,
					password,
					readyTimeout: timeout * 1000,
				});
		});
	},
});
