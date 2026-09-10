import { Tool } from "ai";
import { Tool_GetTime } from "../../tools/getTime.js";
import { Tool_ExecuteCommand } from "../../tools/executeCommand.js";
import { Tool_SshBash } from "../../tools/sshBash.js";
import { Tool_WebSearch } from "../../tools/webSearch/webSearch.js";

export class ToolRegistry {
	private static instance: ToolRegistry;
	private tools = new Map<string, Tool>();

	private constructor() {
		this.registerBuiltinTools();
	}

	public static getInstance() {
		if (!ToolRegistry.instance) ToolRegistry.instance = new ToolRegistry();
		return ToolRegistry.instance;
	}

	public getTools(blacklist: string[] = []): { [k: string]: Tool } {
		const blacklistSet = new Set(blacklist);

		const tools = this.tools.entries().filter(([key]) => !blacklistSet.has(key));
		return Object.fromEntries(tools);
	}

	public getToolsMap() {
		return this.tools;
	}

	private registerBuiltinTools() {
		this.register("get_time", Tool_GetTime);
		this.register("execute_bash", Tool_ExecuteCommand);
		this.register("ssh_bash", Tool_SshBash);
		this.register("web_search", Tool_WebSearch);
	}

	//

	private register(key: string, tool: Tool) {
		this.tools.set(key, tool);
	}
}
