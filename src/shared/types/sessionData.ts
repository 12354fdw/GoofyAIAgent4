import { CheckpointEntryTypes } from "../checkpoints/checkpointTypes.js";

export interface SessionData {
	history: CheckpointEntryTypes[];

	isPending: boolean;
	promptTime: number;
	finishTime: number;
}
