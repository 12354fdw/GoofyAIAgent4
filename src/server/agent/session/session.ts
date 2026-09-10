import { CheckpointEntryTypes } from "../../../shared/checkpoints/checkpointTypes.js";
import { NetworkedCheckpointDeltaData } from "../../../shared/checkpoints/networkedCheckpoints.js";
import { SessionData } from "../../../shared/types/sessionData.js";
import { SessionWebsocketRegistry } from "../../networking/checkpointSocketRegistry.js";
import { ToolRegistry } from "../../tool/toolRegistry.js";
import { Agent } from "./agent.js";
import { SessionController, SessionParameters } from "./sessionController.js";

export class Session {
	private agent: Agent;
	private sessionData: SessionData = {
		history: [],

		isPending: false,
		promptTime: 0,
		finishTime: 0,
		usage: {
			cost: 0,
			promptTokens: 0,
			completionTokens: 0,
			totalTokens: 0,
		},
	};

	constructor(
		private sessionName: string,
		params: SessionParameters,
		toolRegistry: ToolRegistry,
		private sessionController: SessionController,
	) {
		this.agent = new Agent(params, toolRegistry, sessionController);
	}

	public getSessionData() {
		return this.sessionData;
	}

	//

	public streamRaw(prompt: string) {
		return this.agent.stream(prompt);
	}

	private appendCheckpoint(registry: SessionWebsocketRegistry, checkpoint: CheckpointEntryTypes) {
		if (checkpoint.type === "user") {
			this.sessionData.isPending = true;
			this.sessionData.promptTime = new Date().getTime();
		}

		if (checkpoint.type === "finished") {
			this.sessionData.isPending = false;
			this.sessionData.finishTime = new Date().getTime();
		}

		this.sessionData.history.push(checkpoint);

		registry.broadcast(this.sessionName, {
			type: "entry_addition",
			content: checkpoint,
		} satisfies NetworkedCheckpointDeltaData);
	}

	private appendTextContentCheckpoint(registry: SessionWebsocketRegistry, index: number, delta: string) {
		const entry = this.sessionData.history.at(index)!;
		if (entry.type !== "assistant" && entry.type !== "user" && entry.type !== "reasoning")
			throw new Error(`Checkpoint type isn't text-based at index ${index}: ${entry.type}`);
		entry!.content += delta;

		registry.broadcast(this.sessionName, {
			type: "entry_text_content_addition",
			index,
			delta,
		} satisfies NetworkedCheckpointDeltaData);

		this.sessionData.history.with(index, entry);
	}

	private getLatestType() {
		return this.sessionData.history.at(-1)!.type;
	}

	public async streamCheckpointDeltas(registry: SessionWebsocketRegistry, prompt: string) {
		const stream = this.agent.stream(prompt);

		this.appendCheckpoint(registry, {
			type: "user",
			content: prompt,
		});

		for await (const part of stream) {
			switch (part.type) {
				case "step_end": {
					this.sessionData.usage.cost += part.usage.cost;
					this.sessionData.usage.promptTokens += part.usage.promptTokens;
					this.sessionData.usage.completionTokens += part.usage.completionTokens;
					this.sessionData.usage.totalTokens += part.usage.totalTokens;

					this.appendCheckpoint(registry, { type: "step_end", usage: part.usage });
					break;
				}

				case "token": {
					if (this.getLatestType() !== "assistant")
						this.appendCheckpoint(registry, { type: "assistant", content: "" });
					this.appendTextContentCheckpoint(registry, -1, part.content);
					break;
				}

				case "reasoning": {
					if (this.getLatestType() !== "reasoning")
						this.appendCheckpoint(registry, { type: "reasoning", content: "" });
					this.appendTextContentCheckpoint(registry, -1, part.content);
					break;
				}

				case "tool_start": {
					this.appendCheckpoint(registry, {
						type: "tool",
						status: "pending",

						toolName: part.name,
						toolId: part.id,

						result: "",
						arguments: part.arguments,
					});
					break;
				}

				case "tool_end": {
					const index = this.sessionData.history.findLastIndex(
						(entry) => entry.type === "tool" && entry.toolId === part.id,
					);
					if (index === -1) throw new Error(`No pending tool checkpoint with id ${part.id}`);

					const entry = this.sessionData.history.at(index)!;
					if (entry.type !== "tool") throw new Error(`Checkpoint isn't a tool at index ${index}`);
					entry.status = "done";
					entry.result = JSON.stringify(part.result);

					registry.broadcast(this.sessionName, {
						type: "entry_modification",
						index,
						content: entry,
					} satisfies NetworkedCheckpointDeltaData);

					this.sessionData.history.with(index, entry);
					break;
				}

				case "tool_error": {
					const index = this.sessionData.history.findLastIndex(
						(entry) => entry.type === "tool" && entry.toolId === part.id,
					);
					if (index === -1) throw new Error(`No pending tool checkpoint with id ${part.id}`);

					const entry = this.sessionData.history.at(index)!;
					if (entry.type !== "tool") throw new Error(`Checkpoint isn't a tool at index ${index}`);
					entry.status = "error";
					const error = part.error;
					entry.result = JSON.stringify({
						message:
							error instanceof Error
								? error.message
								: typeof error === "string"
									? error
									: JSON.stringify(error),
					});

					registry.broadcast(this.sessionName, {
						type: "entry_modification",
						index,
						content: entry,
					} satisfies NetworkedCheckpointDeltaData);

					this.sessionData.history.with(index, entry);
					break;
				}

				case "finished": {
					this.appendCheckpoint(registry, {
						type: "finished",
					});
				}
			}
		}
	}
}
