import { tool } from "ai";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import z from "zod";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import { LOGGER } from "../../shared/globals/logger.js";

const execFileAsync = promisify(execFile);
const turndownService = new TurndownService({
	headingStyle: "atx",
	codeBlockStyle: "fenced",
});

const MAX_BUFFER = 1024 * 1024;

function htmlToMarkdown(html: string): string {
	const dom = new JSDOM(html);
	const { document } = dom.window;

	document.querySelectorAll("script, style, noscript, template, iframe, object, embed, canvas, svg, form")
            .forEach((element: { remove: () => any; }) => element.remove());

	document.querySelectorAll("*").forEach((element: { attributes: any; removeAttribute: (arg0: any) => void; }) => {
		for (const attribute of [...element.attributes]) {
			const name = attribute.name.toLowerCase();
			const value = attribute.value.trim().toLowerCase();

			if (name.startsWith("on") || name === "style" || name.startsWith("data-")) {
				element.removeAttribute(attribute.name);
				continue;
			}

			if ((name === "href" || name === "src" || name === "action") && /^(javascript|vbscript|data):/i.test(value)) {
				element.removeAttribute(attribute.name);
			}
		}
	});


	document.querySelectorAll("nav, footer, [role='navigation'], [role='banner'], [role='contentinfo']")
	        .forEach((element: { remove: () => any; }) => element.remove());

	return turndownService.turndown(document.body.innerHTML).trim();
}

export const Tool_Curl = tool({
	description: "Fetches a webpage and returns its content as markdown using the curl command. The webpage will be stripped, however, so use the raw curl command if necessary, this is used for reading websites.",
	inputSchema: z.object({
		link: z.url().describe("The link to fetch."),
		timeout: z
			.number()
			.int()
			.min(1)
			.max(60)
			.default(10)
			.describe("Timeout in seconds."),
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
					"--header=\"Accept-Language: en-US,en;q=0.9\"",
					"--max-time",
					String(timeout),
					"--proto=http,https",
					link,
				],
				{
					timeout: timeout * 1000 + 1000,
					maxBuffer: MAX_BUFFER,
					windowsHide: true,
				},
			);

			return {
				stdout: htmlToMarkdown(stdout),
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