export type CheckpointTypes = "user" | "assistant" | "step_end" | "tool";

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
			type: "step_end";
	  }
	| {
			type: "tool";
			status: "pending" | "done" | "rejected";

			toolName: string;
			toolId: string;

			result: string;
			arguments: JSON;
	  };
