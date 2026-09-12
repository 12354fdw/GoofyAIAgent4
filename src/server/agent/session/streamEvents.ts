import { SessionUsage } from "../../../shared/types/sessionUsage.js";

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
			usage: SessionUsage;
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
			type: "tool_rejection";
			message: string;
			id: string;
	  }
	| {
			type: "finished";
	  };
