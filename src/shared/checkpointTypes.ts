export type CheckpointTypes =
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
			result: string;
	  };
