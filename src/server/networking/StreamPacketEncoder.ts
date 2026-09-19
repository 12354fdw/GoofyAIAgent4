import { CheckpointEntryTypes } from "../../shared/checkpoints/checkpointTypes.js";
import { NetworkedCheckpointDeltaData } from "../../shared/checkpoints/networkedCheckpoints.js";
import { SessionUsage } from "../../shared/types/sessionUsage.js";
import { Session } from "../agent/session/session.js";
import { StreamEvents } from "../agent/session/streamEvents.js";
import { SessionStore } from "../storage/SessionStore.js";
import { SessionWebsocketRegistry } from "./checkpointSocketRegistry.js";

export class StreamPacketEncoder {
	private lastTotalTokens = 0;
	private persistedCount = 0;

	private sessionName: string;

	constructor(
		private session: Session,
		private registry: SessionWebsocketRegistry,
		private historyRef: CheckpointEntryTypes[],
		private usage: SessionUsage,
		private store: SessionStore,
	) {
		this.sessionName = session.sessionName;
	}

	private persistCheckpoint(entry: CheckpointEntryTypes) {
		this.store.appendCheckpoint(this.sessionName, entry);
		this.persistedCount++;
	}

	private persistRemaining() {
		while (this.historyRef.length > this.persistedCount) {
			const entry = this.historyRef[this.persistedCount];
			if (entry) this.persistCheckpoint(entry);
		}
	}

	public appendCheckpoint(checkpoint: CheckpointEntryTypes) {
		this.historyRef.push(checkpoint);

		this.registry.broadcast(this.sessionName, {
			type: "entry_addition",
			content: checkpoint,
		} satisfies NetworkedCheckpointDeltaData);

		if (checkpoint.type !== "assistant" && checkpoint.type !== "reasoning" && checkpoint.type !== "tool") {
			this.persistCheckpoint(checkpoint);
		}
	}

	private appendTextContentCheckpoint(index: number, delta: string) {
		const entry = this.historyRef.at(index)!;
		if (entry.type !== "assistant" && entry.type !== "user" && entry.type !== "reasoning")
			throw new Error(`Checkpoint type isn't text-based at index ${index}: ${entry.type}`);
		entry!.content += delta;

		this.registry.broadcast(this.sessionName, {
			type: "entry_text_content_addition",
			index,
			delta,
		} satisfies NetworkedCheckpointDeltaData);
	}

	private getLatestType() {
		return this.historyRef.at(-1)!.type;
	}

	public async encodeStreamingPackets(stream: AsyncGenerator<StreamEvents>) {
		try {
			for await (const part of stream) {
				switch (part.type) {
					case "step_end": {
						this.usage.cost += part.usage.cost;
						this.usage.promptTokens = part.usage.promptTokens;
						this.usage.completionTokens = part.usage.completionTokens;
						this.usage.totalTokens = part.usage.totalTokens;
						this.usage.accTotalTokens += part.usage.totalTokens - this.lastTotalTokens;

						// funny water calculations
						const joules = this.usage.accTotalTokens * 2;
						this.usage.waterEvaporatedLiters = joules / 2260000;

						this.lastTotalTokens = part.usage.totalTokens;

						this.appendCheckpoint({ type: "step_end", usage: this.usage });
						this.store.saveSessionData(this.session);
						break;
					}

					case "token": {
						if (this.getLatestType() !== "assistant")
							this.appendCheckpoint({ type: "assistant", content: "" });
						this.appendTextContentCheckpoint(-1, part.content);
						break;
					}

					case "reasoning": {
						if (this.getLatestType() !== "reasoning")
							this.appendCheckpoint({ type: "reasoning", content: "" });
						this.appendTextContentCheckpoint(-1, part.content);
						break;
					}

					case "tool_start": {
						this.appendCheckpoint({
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
						const index = this.historyRef.findLastIndex(
							(entry) => entry.type === "tool" && entry.toolId === part.id,
						);
						if (index === -1) throw new Error(`No pending tool checkpoint with id ${part.id}`);

						const entry = this.historyRef.at(index)!;
						if (entry.type !== "tool") throw new Error(`Checkpoint isn't a tool at index ${index}`);
						entry.status = "done";
						entry.result = JSON.stringify(part.result);

						this.registry.broadcast(this.sessionName, {
							type: "entry_modification",
							index,
							content: entry,
						} satisfies NetworkedCheckpointDeltaData);
						this.persistCheckpoint(entry);
						break;
					}

					case "tool_error": {
						const index = this.historyRef.findLastIndex(
							(entry) => entry.type === "tool" && entry.toolId === part.id,
						);
						if (index === -1) throw new Error(`No pending tool checkpoint with id ${part.id}`);

						const entry = this.historyRef.at(index)!;
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

						this.registry.broadcast(this.sessionName, {
							type: "entry_modification",
							index,
							content: entry,
						} satisfies NetworkedCheckpointDeltaData);
						this.persistCheckpoint(entry);
						break;
					}

					case "tool_rejection": {
						const index = this.historyRef.findLastIndex(
							(entry) => entry.type === "tool" && entry.toolId === part.id,
						);
						if (index === -1) throw new Error(`No pending tool checkpoint with id ${part.id}`);

						const entry = this.historyRef.at(index)!;
						if (entry.type !== "tool") throw new Error(`Checkpoint isn't a tool at index ${index}`);

						entry.status = "rejected";
						entry.result = part.message;

						this.registry.broadcast(this.sessionName, {
							type: "entry_modification",
							index,
							content: entry,
						} satisfies NetworkedCheckpointDeltaData);
						this.persistCheckpoint(entry);
						break;
					}

					case "finish_reasoning": {
						if (this.getLatestType() === "reasoning") {
							this.persistCheckpoint({ type: "reasoning", content: part.content });
						}
						break;
					}

					case "finish_text": {
						if (this.getLatestType() === "assistant") {
							this.persistCheckpoint({ type: "assistant", content: part.content });
						}
						break;
					}

					case "finished": {
						this.appendCheckpoint({
							type: "finished",
						});
						break;
					}
				}
			}
		} finally {
			this.persistRemaining();
		}
	}
}
