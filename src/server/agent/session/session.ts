import { SessionWebsocketRegistry } from "../../networking/checkpointSocketRegistry.js";
import { ToolRegistry } from "../../tool/toolRegistry.js";
import { Agent } from "./agent.js";
import { SessionController, SessionParameters } from "./sessionController.js";
import { WebSocket } from "ws";

export class Session {
	private agent: Agent;

	constructor(
		params: SessionParameters,
		toolRegistry: ToolRegistry,
		private sessionController: SessionController,
	) {
		this.agent = new Agent(params, toolRegistry, sessionController);
	}

	public streamRaw(prompt: string) {
		return this.agent.stream(prompt);
	}

	public async streamCheckpointDeltas(registry: SessionWebsocketRegistry, sessionName: string, prompt: string) {
		const stream = this.agent.stream(prompt);
	}
}
