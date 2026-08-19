import { ModelMessage } from "ai";
import { StreamController } from "./streamController.js";
import { ToolRegistry } from "../toolRegistry.js";
import { SessionParameters } from "./sessionController.js";

export class Session {
	private streamController: StreamController;
	private messages: ModelMessage[] = [];

	private params: SessionParameters;

	constructor(_params: SessionParameters, toolRegistry: ToolRegistry) {
		this.params = {
			model: _params.model,
			instruction: _params.instruction ?? "SYSTEM/AGENT.md",
			toolBlacklist: _params.toolBlacklist ?? [],
		};

		this.streamController = new StreamController(this.params, toolRegistry);
	}

	public async stream(prompt: string) {
		this.messages.push({
			role: "user",
			content: prompt,
		});

		const stream = await this.streamController.stream(this.messages);
		stream.responseMessages.then((msgs) => {
			this.messages.push(...msgs);
		});

		return stream;
	}
}
