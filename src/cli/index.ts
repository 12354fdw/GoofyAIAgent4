import { LOGGER } from "../server/logger.js";
import { ToolRegistry } from "../server/tool/toolRegistry.js";
import { ComlinkClient } from "../common/client/networking/comlinkClient.js";

async function runAgent(client: ComlinkClient, prompt: string, session: string = "default-session") {
	let text = "";
	let newStep = true;

	for await (const part of client.stream(session, prompt)) {
		if (part.type === "finished") break;

		if (part.type === "step_end") {
			process.stdout.write("\n-[STEP END]-\n");
			newStep = true;
			continue;
		}

		if (part.type !== "token") continue;

		if (newStep) {
			text = "";
			newStep = false;
		}

		process.stdout.write(part.content);
		text += part.content;
	}

	process.stdout.write("\n----------------------------\n");

	return text;
}

export async function ENTRY_CLIENT() {
	const client = new ComlinkClient();
	await client.awaitReady();

	await client.createSession("agent", {
		model: "deepseek/deepseek-v4-flash-0731",
		instruction: "SYSTEM/AGENT.md",
		toolBlacklist: Object.keys(ToolRegistry.getInstance().getTools()),
	});

	await client.createSession("hotel", {
		model: "deepseek/deepseek-v4-flash-0731",
		instruction: {
			type: "custom",
			content:
				"you are a hotel's automated reception. You will help with any customer's requests regarding the hotel. Only room 2 is available as of right now",
		},
		toolBlacklist: Object.keys(ToolRegistry.getInstance().getTools()),
	});

	let prompt =
		"your final completion output is routed to a hotel. reserve me a room under the name Matthew. I'll be staying there on 8/2/2023 for 1 week.";

	for (;;) {
		LOGGER.info("AGENT");
		prompt = await runAgent(client, prompt, "agent");
		LOGGER.info("HOTEL");
		prompt = await runAgent(client, prompt, "hotel");
	}
}
