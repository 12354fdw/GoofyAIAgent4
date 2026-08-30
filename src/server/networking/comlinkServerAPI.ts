import { SessionController, SessionParameters } from "../agent/session/sessionController.js";
import { SessionWebsocketRegistry } from "./checkpointSocketRegistry.js";
import { NetworkedCheckpointDeltaData } from "../../shared/checkpoints/networkedCheckpoints.js";

export class ComlinkServerAPI {
	private static instance: ComlinkServerAPI;

	public static getInstance() {
		if (!ComlinkServerAPI.instance) ComlinkServerAPI.instance = new ComlinkServerAPI();
		return ComlinkServerAPI.instance;
	}

	private controller = SessionController.getInstance();
	private sessionWebsocketRegistry = SessionWebsocketRegistry.getInstance();

	public async processUserRequest(sessionName: string, prompt: string) {
		this.sessionWebsocketRegistry.broadcast(sessionName, {
			type: "entry_addition",
			content: {
				type: "user",
				content: prompt,
			},
		} satisfies NetworkedCheckpointDeltaData);

		this.controller.getSession(sessionName).streamCheckpointDeltas(this.sessionWebsocketRegistry, prompt);
	}

	public async createSession(sessionName: string, params: SessionParameters) {
		this.controller.createSession(sessionName, params);
	}
}
