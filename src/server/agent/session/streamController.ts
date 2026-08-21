import { GenerateTextStepEndEvent, ModelMessage, ToolLoopAgent } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { SessionController, SessionParameters } from "./sessionController.js";
import { readPrompt } from "../../util.js";
import { ToolRegistry } from "../../toolRegistry.js";
import { toolApproval } from "../security.js";

export class StreamController {
	private agent!: ToolLoopAgent;

	constructor(
		private params: SessionParameters,
		private toolRegistry: ToolRegistry,
		private sessionController: SessionController,
	) {
		this.createAgent();
	}

	public async stream(messages: ModelMessage[]) {
		this.createAgent();
		return await this.agent.stream({
			messages,
			onError: (e: { error: Error }) => {
				throw e.error;
			},
			// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type
			onStepEnd: (event: GenerateTextStepEndEvent<{}>) => {
				console.log("\n--[STEP END]--\n");
			},
		} as never);
	}

	//

	private createAgent() {
		this.agent = new ToolLoopAgent({
			model: openrouter(this.params.model),
			instructions: readPrompt(this.params.instruction!),

			maxRetries: 0,
			tools: this.toolRegistry.getTools(this.params.toolBlacklist),

			toolApproval: ({ toolCall }) => toolApproval(toolCall, this.sessionController, this.toolRegistry),
		});
	}
}
