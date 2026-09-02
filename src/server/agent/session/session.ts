import { CheckpointEntryTypes } from "../../../shared/checkpoints/checkpointTypes.js";
import { NetworkedCheckpointDeltaData } from "../../../shared/checkpoints/networkedCheckpoints.js";
import { SessionWebsocketRegistry } from "../../networking/checkpointSocketRegistry.js";
import { ToolRegistry } from "../../tool/toolRegistry.js";
import { Agent } from "./agent.js";
import { SessionController, SessionParameters } from "./sessionController.js";

export class Session {
	private agent: Agent;
	private history: CheckpointEntryTypes[] = [];

	constructor(
		private sessionName: string,
		params: SessionParameters,
		toolRegistry: ToolRegistry,
		private sessionController: SessionController,
	) {
		this.agent = new Agent(params, toolRegistry, sessionController);
	}

	public streamRaw(prompt: string) {
		return this.agent.stream(prompt);
	}

	private appendCheckpoint(registry: SessionWebsocketRegistry, checkpoint: CheckpointEntryTypes) {
		this.history.push(checkpoint);

		registry.broadcast(this.sessionName, {
			type: "entry_addition",
			content: checkpoint,
		} satisfies NetworkedCheckpointDeltaData);
	}

	private appendTextContentCheckpoint(registry: SessionWebsocketRegistry, index: number, delta: string) {
		const entry = this.history.at(index)!;
		if (entry.type !== "assistant" && entry.type !== "user")
			throw new Error(`Checkpoint type isn't text-based at index ${index}: ${entry.type}`);
		entry!.content += delta;

		registry.broadcast(this.sessionName, {
			type: "entry_text_content_addition",
			index,
			delta,
		} satisfies NetworkedCheckpointDeltaData);

		this.history.with(index, entry);
	}

	private getLatestType() {
		return this.history.at(-1)!.type;
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
					this.appendCheckpoint(registry, { type: "step_end" });
					break;
				}

				case "token": {
					if (this.getLatestType() !== "assistant")
						this.appendCheckpoint(registry, { type: "assistant", content: "" });
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
					const index = this.history.findLastIndex(
						(entry) => entry.type === "tool" && entry.toolId === part.id,
					);
					if (index === -1) throw new Error(`No pending tool checkpoint with id ${part.id}`);

					const entry = this.history.at(index)!;
					if (entry.type !== "tool") throw new Error(`Checkpoint isn't a tool at index ${index}`);
					entry.status = "done";
					entry.result = JSON.stringify(part.result);

					registry.broadcast(this.sessionName, {
						type: "entry_modification",
						index,
						content: entry,
					} satisfies NetworkedCheckpointDeltaData);

					this.history.with(index, entry);
					break;
				}
			}
		}
	}
}
