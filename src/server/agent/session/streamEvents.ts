export type StreamEvents =
	| {
			type: "token";
			content: string;
	  }
	| {
			type: "reasoning";
			content: string;
	  }
	| {
			type: "step_end";
			usage: { cost: number; promptTokens: number; completionTokens: number; totalTokens: number };
	  }
	| {
			type: "tool_start";
			name: string;
			arguments: object;
			id: string;
	  }
	| {
			type: "tool_end";
			result: object;
			id: string;
	  }
	| {
			type: "tool_error";
			error: Error;
			id: string;
	  }
	| {
			type: "finished";
	  };
