import { ModelMessage, ToolLoopAgent } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { ToolRegistry } from "../tools.js";

export class StreamController {
	private agent!: ToolLoopAgent;

	constructor(
		private _modelString: string,
		private toolRegistry: ToolRegistry,
	) {
		this.createAgent();
	}

	public async stream(messages: ModelMessage[]) {
		return await this.agent.stream({
			messages,
			tools: this.toolRegistry.getTools(),
			onError: (e: { error: Error }) => {
				throw e.error;
			},
		} as never);
	}

	//

	private createAgent() {
		this.agent = new ToolLoopAgent({
			model: openrouter(this._modelString),
			maxRetries: 0,
		});
	}
}
