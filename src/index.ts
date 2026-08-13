import { ENTRY_server } from "./server/index.js";
import { SessionController } from "./server/session/sessionController.js";

const controller = SessionController.getInstance();

const session = controller.getSession("default-session");

async function runAgent(prompt: string) {
	const stream = await session.stream(prompt);

	for await (const tok of stream.textStream) {
		process.stdout.write(tok);
	}
	process.stdout.write("\n----------------------------\n");
}

ENTRY_server();

await runAgent("test out the websearch and raw_web_search");
