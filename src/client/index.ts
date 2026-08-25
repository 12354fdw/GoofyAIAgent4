import { readFileSync } from "node:fs";

const client = new ComlinkClient();

async function runAgent(prompt: string) {
	for await (const part of client.stream("default-session", prompt)) {
		if (part.type === "finished") return;
		if (part.type !== "token") continue;
		process.stdout.write(part.content);
	}
	process.stdout.write("\n----------------------------\n");
}

import { ComlinkClient } from "./networking/comlinkClient.js";

export async function ENTRY_CLIENT() {
	runAgent(readFileSync("prompt.txt", "utf-8"));
}
