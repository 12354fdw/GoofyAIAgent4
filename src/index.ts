import { ENTRY_server } from "./server/index.js";
import { SessionController } from "./server/session/sessionController.js";
import { ToolRegistry } from "./server/tools.js";

const toolRegistry = new ToolRegistry();
const controller = new SessionController(toolRegistry);

const session = controller.getSession("default-session");

async function runAgent(prompt: string) {
	const stream = await session.stream(prompt);

	for await (const tok of stream.textStream) {
		process.stdout.write(tok);
	}
	process.stdout.write("\n----------------------------\n");
}

ENTRY_server();

await runAgent("what is the current EST time?");
