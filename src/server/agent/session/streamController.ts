import { isLoopFinished, ModelMessage, ToolLoopAgent } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { SessionController, SessionParameters } from "./sessionController.js";
import { readPrompt } from "../../util.js";
import { ToolRegistry } from "../../tool/toolRegistry.js";
import { toolApproval } from "../security.js";
import { StreamTypes } from "./streamTypes.js";

export class StreamController {
	private agent!: ToolLoopAgent;
	private streamResult?: Awaited<ReturnType<ToolLoopAgent["stream"]>>;

	constructor(
		private params: SessionParameters,
		private toolRegistry: ToolRegistry,
		private sessionController: SessionController,
	) {
		this.createAgent();
	}

	public async *stream(messages: ModelMessage[]): AsyncGenerator<StreamTypes> {
		this.createAgent();
		const result = await this.agent.stream({
			messages,
		} as never);
		this.streamResult = result;

		for await (const part of result.fullStream) {
			switch (part.type) {
				case "text-delta":
					yield { type: "token", content: part.text };
					break;
				case "tool-call":
					yield {
						type: "tool_start",
						name: part.toolName,
						arguments: part.input as JSON,
						id: part.toolCallId,
					};
					break;
				case "tool-result":
					yield { type: "tool_end", name: part.toolName, result: part.output as JSON, id: part.toolCallId };
					break;
				case "finish-step":
					yield { type: "step_end" };
					break;
				case "finish":
					yield { type: "finished" };
					break;
				case "error":
					throw part.error;
			}
		}
	}

	public async getResponseMessages() {
		return await this.streamResult?.responseMessages;
	}

	//

	private createAgent() {
		this.agent = new ToolLoopAgent({
			model: openrouter(this.params.model),
			instructions: readPrompt(this.params.instruction!),

			maxRetries: 0,
			tools: this.toolRegistry.getTools(this.params.toolBlacklist),

			stopWhen: isLoopFinished(),

			toolApproval: ({ toolCall }) => toolApproval(toolCall, this.sessionController, this.toolRegistry),
		});
	}
}
