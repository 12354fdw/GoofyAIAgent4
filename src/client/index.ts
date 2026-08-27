import { readFileSync } from "node:fs";
import { ComlinkClient } from "./networking/comlinkClient.js";

const client = new ComlinkClient();

async function runAgent(prompt: string) {
	let text = "";
	for await (const part of client.stream("default-session", prompt)) {
		if (part.type === "finished") break;

		if (part.type === "step_end") {
			process.stdout.write("\n-[STEP END]-\n");
			continue;
		}

		if (part.type !== "token") continue;
		process.stdout.write(part.content);
		text += part.content;
	}

	process.stdout.write("\n----------------------------\n");

	return text;
}

export async function ENTRY_CLIENT() {
	runAgent(readFileSync("prompt.txt", "utf-8"));
}
