export type StreamTypes =
	| {
			type: "token";
			content: string;
	  }
	| {
			type: "step_end";
	  }
	| {
			type: "tool_start";
			name: string;
			arguments: JSON;
			id: string;
	  }
	| {
			type: "tool_end";
			name: string;
			result: JSON;
			id: string;
	  }
	| {
			type: "finished";
	  };
