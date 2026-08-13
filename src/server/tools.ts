import { Tool } from "ai";
import { Tool_GetTime } from "../tools/getTime.js";

export class ToolRegistry {
	private tools: Tool[] = [];

	constructor() {
		this.registerBuiltinTools();
	}

	public getTools() {
		return this.tools;
	}

	private registerBuiltinTools() {
		this.register(Tool_GetTime);
	}

	//

	private register(tool: Tool) {
		this.tools.push(tool);
	}
}
