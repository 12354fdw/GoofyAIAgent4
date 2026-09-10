import { CheckpointEntryTypes } from "../checkpoints/checkpointTypes.js";
import { SessionUsage } from "./sessionUsage.js";

export interface SessionData {
	history: CheckpointEntryTypes[];
	usage: SessionUsage;

	isPending: boolean;
	promptTime: number;
	finishTime: number;
}
