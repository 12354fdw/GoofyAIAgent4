import { readFileSync } from "node:fs";
import { ENTRY_server } from "./server/index.js";
import { SessionController } from "./server/agent/session/sessionController.js";

const controller = SessionController.getInstance();

const session = controller.getSession("default-session");

async function runAgent(prompt: string) {
	for await (const part of session.stream(prompt)) {
		if (part.type === "token") process.stdout.write(part.content);
	}
	process.stdout.write("\n----------------------------\n");
}

ENTRY_server();

await runAgent(readFileSync("prompt.txt", "utf-8"));
