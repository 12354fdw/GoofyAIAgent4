export type CheckpointTypes =
	| {
			type: "user";
			content: string;
	  }
	| {
			type: "assistant";
	  }
	| {
			type: "step_end";
	  }
	| {
			type: "tool";
			status: "pending" | "done" | "rejected";
			result: string;
	  };
