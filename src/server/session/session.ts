import { ModelMessage } from "ai";
import { StreamController } from "./streamController.js";

export class Session {
	private streamController: StreamController;
	private messages: ModelMessage[] = [];

	constructor(private _modelString: string) {
		this.streamController = new StreamController(_modelString);
	}

	public async stream(prompt: string) {
		this.messages.push({
			role: "user",
			content: prompt,
		});

		return await this.streamController.stream(this.messages);
	}
}
