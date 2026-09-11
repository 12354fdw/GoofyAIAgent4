import { isLoopFinished, ModelMessage, ToolLoopAgent } from "ai";
import { openrouter, type OpenRouterUsageAccounting } from "@openrouter/ai-sdk-provider";
import { SessionController, SessionParameters } from "../sessionController.js";
import { readPrompt } from "../../util.js";
import { ToolRegistry } from "../../tool/toolRegistry.js";
import { toolApproval } from "../security.js";
import { StreamEvents } from "./streamEvents.js";

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

	public async *stream(messages: ModelMessage[]): AsyncGenerator<StreamEvents> {
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
				case "reasoning-delta":
					yield { type: "reasoning", content: part.text };
					break;
				case "tool-call":
					yield {
						type: "tool_start",
						name: part.toolName,
						arguments: part.input as object,
						id: part.toolCallId,
					};
					break;
				case "tool-result":
					yield { type: "tool_end", result: part.output as object, id: part.toolCallId };
					break;
				case "tool-error": {
					const error = part.error as Error;
					yield {
						type: "tool_error",
						error,
						id: part.toolCallId,
					};
					break;
				}
				case "finish-step": {
					const providerUsage = (
						part.providerMetadata?.openrouter as { usage?: OpenRouterUsageAccounting } | undefined
					)?.usage;

					yield {
						type: "step_end",
						usage: {
							cost: providerUsage?.cost ?? 0,
							promptTokens: part.usage.inputTokens ?? providerUsage?.promptTokens ?? 0,
							completionTokens: part.usage.outputTokens ?? providerUsage?.completionTokens ?? 0,
							totalTokens: part.usage.totalTokens ?? providerUsage?.totalTokens ?? 0,
							waterEvaporatedLiters: 0,
						},
					};
					break;
				}
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
