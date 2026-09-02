import { CheckpointEntryTypes } from "../../../shared/checkpoints/checkpointTypes.js";
import { NetworkedCheckpointDeltas } from "../../../shared/checkpoints/networkedCheckpoints.js";

export class CheckpointStore {
	private history: CheckpointEntryTypes[] = [];
	private deltas: NetworkedCheckpointDeltas[] = [];
	private currentOrder: number = 0;

	public onChange: (history: CheckpointEntryTypes[]) => void = () => {};

	public handleDelta(delta: NetworkedCheckpointDeltas) {
		this.deltas.push(delta);
		this.decodeDelta();
	}

	private decodeDelta() {
		const delta = this.deltas.find((delta) => delta.order === this.currentOrder);
		if (!delta) return;

		this.currentOrder++;

		switch (delta.type) {
			case "entry_addition": {
				this.history.push(delta.content);
				break;
			}

			case "entry_text_content_addition": {
				const entry = this.history.at(delta.index)!;
				if (entry.type !== "assistant" && entry.type !== "user")
					throw new Error(`Checkpoint type isn't text-based!`);

				entry.content += delta.delta;
				this.history.with(delta.index, entry);
				break;
			}

			case "entry_modification": {
				this.history = this.history.with(delta.index, delta.content);
				break;
			}
		}

		this.onChange([...this.history]);
		this.decodeDelta();
	}
}
