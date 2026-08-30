import { SessionController, SessionParameters } from "../agent/session/sessionController.js";
import { SessionWebsocketRegistry } from "./checkpointSocketRegistry.js";

export class ComlinkServerAPI {
	private static instance: ComlinkServerAPI;

	public static getInstance() {
		if (!ComlinkServerAPI.instance) ComlinkServerAPI.instance = new ComlinkServerAPI();
		return ComlinkServerAPI.instance;
	}

	private controller = SessionController.getInstance();
	private sessionWebsocketRegistry = SessionWebsocketRegistry.getInstance();

	public async processUserRequest(streamID: string, sessionName: string, prompt: string) {
		const stream = this.controller.getSession(sessionName).stream(prompt);
	}

	public async createSession(sessionName: string, params: SessionParameters) {
		this.controller.createSession(sessionName, params);
	}
}
