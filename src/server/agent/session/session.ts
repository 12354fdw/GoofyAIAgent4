import { ModelMessage } from "ai";
import { StreamController } from "./streamController.js";
import { StreamTypes } from "./streamTypes.js";
import { SessionController, SessionParameters } from "./sessionController.js";
import { ToolRegistry } from "../../toolRegistry.js";

export class Session {
	private streamController: StreamController;
	private messages: ModelMessage[] = [];

	private params: SessionParameters;

	constructor(
		_params: SessionParameters,
		toolRegistry: ToolRegistry,
		private sessionController: SessionController,
	) {
		this.params = {
			model: _params.model,
			instruction: _params.instruction ?? "SYSTEM/AGENT.md",
			toolBlacklist: _params.toolBlacklist ?? [],
		};

		this.streamController = new StreamController(this.params, toolRegistry, sessionController);
	}

	public async *stream(prompt: string): AsyncGenerator<StreamTypes> {
		this.messages.push({
			role: "user",
			content: prompt,
		});

		for await (const part of this.streamController.stream(this.messages)) {
			yield part;
		}

		const responseMessages = await this.streamController.getResponseMessages();
		if (responseMessages) this.messages.push(...responseMessages);
	}
}
