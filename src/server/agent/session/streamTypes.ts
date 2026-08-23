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
			id: string;
	  }
	| {
			type: "tool_end";
			name: string;
			id: string;
	  };
