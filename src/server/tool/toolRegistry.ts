import { Tool } from "ai";
import { Tool_GetTime } from "../../tools/getTime.js";
import { Tool_ExecuteBash } from "../../tools/executeBash.js";
import { Tool_WebSearch } from "../../tools/webSearch/websearch.js";
import { Tool_RawWebSearch } from "../../tools/webSearch/rawWebSearch.js";

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

	public getTools(blacklist: Tool[] = []): { [k: string]: Tool } {
		const blacklistSet = new Set(blacklist);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const tools = this.tools.entries().filter(([_, tool]) => !blacklistSet.has(tool));
		return Object.fromEntries(tools);
	}

	public getToolsMap() {
		return this.tools;
	}

	private registerBuiltinTools() {
		this.register("get_time", Tool_GetTime);
		this.register("execute_bash", Tool_ExecuteBash);
		this.register("web_search", Tool_WebSearch);
		this.register("raw_web_search", Tool_RawWebSearch);
	}

	//

	private register(key: string, tool: Tool) {
		this.tools.set(key, tool);
	}
}
