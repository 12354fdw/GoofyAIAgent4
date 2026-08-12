import { ModelMessage, ToolLoopAgent } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";

export class StreamController {
	private agent!: ToolLoopAgent;

	constructor(private _modelString: string) {
		this.createAgent();
	}

	public async stream(messages: ModelMessage[]) {
		return await this.agent.stream({
			messages,
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
