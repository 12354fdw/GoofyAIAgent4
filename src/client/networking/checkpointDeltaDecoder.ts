import WebSocket from "ws";
import { CheckpointEntryTypes } from "../../shared/checkpoints/checkpointTypes.js";
import { NetworkedCheckpointDeltas } from "../../shared/checkpoints/networkedCheckpoints.js";
import { SessionUsage } from "../../shared/types/sessionUsage.js";
import { Signal } from "../../shared/signal.js";

export class CheckpointDeltaDecoder {
	private deltas: NetworkedCheckpointDeltas[] = [];
	private currentOrder: number = 0;

	public onChange = new Signal<(history: CheckpointEntryTypes[], newEntry: CheckpointEntryTypes) => void>();

	constructor(
		ws: WebSocket,
		private historyRef: CheckpointEntryTypes[],
		private usageRef: SessionUsage,
	) {
		ws.on("message", (raw) => {
			const delta = JSON.parse(raw.toString()) as NetworkedCheckpointDeltas;
			this.handleDelta(delta);
		});
	}

	private handleDelta(delta: NetworkedCheckpointDeltas) {
		this.deltas.push(delta);
		this.decodeDelta();
	}

	private decodeDelta() {
		const delta = this.deltas.find((delta) => delta.order === this.currentOrder);
		if (!delta) return;

		this.currentOrder++;

		switch (delta.type) {
			case "entry_addition": {
				this.historyRef.push(delta.content);

				if (delta.content.type !== "step_end") break;

				this.usageRef.cost += delta.content.usage.cost;
				this.usageRef.promptTokens = delta.content.usage.promptTokens;
				this.usageRef.completionTokens = delta.content.usage.completionTokens;
				this.usageRef.totalTokens = delta.content.usage.totalTokens;

				break;
			}

			case "entry_text_content_addition": {
				const entry = this.historyRef.at(delta.index)!;
				if (entry.type !== "assistant" && entry.type !== "user" && entry.type !== "reasoning")
					throw new Error(`Checkpoint type isn't text-based!`);

				entry.content += delta.delta;
				break;
			}

			case "entry_modification": {
				this.historyRef[delta.index] = delta.content;
				break;
			}
		}

		this.onChange.fire(this.historyRef, this.historyRef.at(-1)!);
		this.decodeDelta();
	}
}
