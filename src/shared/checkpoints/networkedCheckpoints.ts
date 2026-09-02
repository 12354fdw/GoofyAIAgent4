import { CheckpointEntryTypes } from "./checkpointTypes.js";

type BasePacket = {
	order: number;
	sessionName: string;
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
			type: "entry_modification";
			index: number;
			content: CheckpointEntryTypes;
	  };

export type NetworkedCheckpointDeltas = NetworkedCheckpointDeltaData & BasePacket;
