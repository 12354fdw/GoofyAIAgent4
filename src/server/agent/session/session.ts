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
		const item = this.history[index]!;
		if (item.type !== "assistant" && item.type !== "user")
			throw new Error(`Unexpected checkpoint type at index ${index}: ${item.type}`);
		item!.content += delta;

		registry.broadcast(this.sessionName, {
			type: "entry_text_content_addition",
			index,
			delta,
		} satisfies NetworkedCheckpointDeltaData);
	}

	public async streamCheckpointDeltas(registry: SessionWebsocketRegistry, prompt: string) {
		const stream = this.agent.stream(prompt);

		for await (const part of stream) {
			switch (part.type) {
				case "token": {
					
				}
			}
		}
	}
}
