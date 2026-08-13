import { Tool } from "ai";
import { Tool_GetTime } from "../tools/getTime.js";
import { Tool_ExecuteBash } from "../tools/executeBash.js";

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
		this.register(Tool_ExecuteBash);
	}

	//

	private register(tool: Tool) {
		this.tools.push(tool);
	}
}
