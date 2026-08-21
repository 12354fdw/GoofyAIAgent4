import { ModelMessage, ToolLoopAgent } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { ToolRegistry } from "../toolRegistry.js";
import { readPrompt } from "../util.js";
import { SessionParameters } from "./sessionController.js";

export class StreamController {
	private agent!: ToolLoopAgent;

	constructor(
		private params: SessionParameters,
		private toolRegistry: ToolRegistry,
	) {
		this.createAgent();
	}

	public async stream(messages: ModelMessage[]) {
		return await this.agent.stream({
			instructions: readPrompt(this.params.instruction!),
			messages,
			tools: this.toolRegistry.getTools(this.params.toolBlacklist),
			onError: (e: { error: Error }) => {
				throw e.error;
			},
			onStepFinish: (step: any) => {
				if (step.toolCalls && step.toolCalls.length > 0) {
					process.stdout.write("\n\n\x1b[35m=== [TOOL CALL COMPLETED - NEXT ITERATION] ===\x1b[0m\n\n");
				}
			},
		} as never);
	}

	//

	private createAgent() {
		this.agent = new ToolLoopAgent({
			model: openrouter(this.params.model),
			maxRetries: 0,
		});
	}
}
