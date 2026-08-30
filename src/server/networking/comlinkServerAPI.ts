import WebSocket from "ws";
import { SessionController, SessionParameters } from "../agent/session/sessionController.js";
import { SessionWebsocketRegistry } from "./checkpointSocketRegistry.js";
import { NetworkedCheckpointDeltas } from "../../shared/checkpoints/networkedCheckpoints.js";

export class ComlinkServerAPI {
	private static instance: ComlinkServerAPI;

	public static getInstance() {
		if (!ComlinkServerAPI.instance) ComlinkServerAPI.instance = new ComlinkServerAPI();
		return ComlinkServerAPI.instance;
	}

	private controller = SessionController.getInstance();
	private sessionWebsocketRegistry = SessionWebsocketRegistry.getInstance();

	public async processUserRequest(sessionName: string, prompt: string) {
		this.sessionWebsocketRegistry.broadcast(sessionName, (ws: WebSocket) => {
			ws.send(
				JSON.stringify({
					type: "entry_addition",
					content: {
						type: "user",
						content: prompt,
					},
				} satisfies NetworkedCheckpointDeltas),
			);
		});

		const stream = this.controller.getSession(sessionName).stream(prompt);
	}

	public async createSession(sessionName: string, params: SessionParameters) {
		this.controller.createSession(sessionName, params);
	}
}
