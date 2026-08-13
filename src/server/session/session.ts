import { ModelMessage } from "ai";
import { StreamController } from "./streamController.js";
import { ToolRegistry } from "../toolRegistry.js";
import { InstructionPaths } from "../util.js";

export class Session {
	private streamController: StreamController;
	private messages: ModelMessage[] = [];

	constructor(
		private _modelString: string,
		private toolRegistry: ToolRegistry,
		instruction: InstructionPaths,
	) {
		this.streamController = new StreamController(_modelString, toolRegistry, instruction);
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
