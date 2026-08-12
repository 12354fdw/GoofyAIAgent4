import { ENTRY_server } from "./server/index.js";
import { SessionController } from "./server/session/sessionController.js";
const controller = new SessionController();
const session = controller.getSession("default-session");

async function runAgent(prompt: string) {
	const stream = await session.stream(prompt);

	for await (const tok of stream.textStream) {
		process.stdout.write(tok);
	}
	process.stdout.write("\n----------------------------\n");
}

ENTRY_server();

await runAgent("i want you to remember this number which is 42");
await runAgent("ok now what is that number");
await runAgent("ok what did you just say");
await runAgent("ok now what is an RAID array?");
