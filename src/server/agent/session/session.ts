import { ModelMessage } from "ai";
import { StreamController } from "./streamController.js";
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
