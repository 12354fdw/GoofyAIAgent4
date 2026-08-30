import { CheckpointEntryTypes } from "./checkpointTypes.js";

type BasePacket = {
	order: number;
};

export type NetworkedCheckpointDeltaData =
	| {
			type: "entry_text_content_addition";
			index: number;
			delta: string;
	  }
	| {
			type: "entry_addition";
			content: CheckpointEntryTypes;
	  }
	| {
			type: "tool_entry_modification";
			index: number;
			content: CheckpointEntryTypes;
	  };

export type NetworkedCheckpointDeltas = NetworkedCheckpointDeltaData & BasePacket;
