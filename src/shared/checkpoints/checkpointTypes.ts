import { SessionUsage } from "../types/sessionUsage.js";

export type CheckpointEntryTypes =
	| {
			type: "user";
			content: string;
	  }
	| {
			type: "assistant";
			content: string;
	  }
	| {
			type: "reasoning";
			content: string;
	  }
	| {
			type: "step_end";
			usage: SessionUsage;
	  }
	| {
			type: "finished";
	  }
	| {
			type: "tool";
			status: "pending" | "done" | "error" | "rejected";

			toolName: string;
			toolId: string;

			result: string;
			arguments: object;
	  };
