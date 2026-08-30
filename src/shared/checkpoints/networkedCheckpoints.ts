import { CheckpointEntryTypes, CheckpointTypes } from "./checkpointTypes.js";

type BasePacket = {
	order: number;
};

export type NetworkedCheckpointDeltas =
	| (BasePacket & {
			type: "entry_text_content_addition";
			index: number;
			content: string;
	  })
	| {
			type: "entry_addition";
			role: CheckpointTypes;
			content: CheckpointEntryTypes;
	  }
	| {
			type: "tool_entry_modification";
			index: number;
			content: CheckpointEntryTypes;
	  };
