import { SessionController, SessionParameters } from "../agent/session/sessionController.js";
import { StreamingSocketRegistry } from "./streamingSocketRegistry.js";

export class ComlinkServerAPI {
	private static instance: ComlinkServerAPI;

	public static getInstance() {
		if (!ComlinkServerAPI.instance) ComlinkServerAPI.instance = new ComlinkServerAPI();
		return ComlinkServerAPI.instance;
	}

	private controller = SessionController.getInstance();
	private streamingWebsocketRegistry = StreamingSocketRegistry.getInstance();

	public async startStreaming(streamID: string, sessionName: string, prompt: string) {
		const stream = this.controller.getSession(sessionName).stream(prompt);
		const socket = await this.streamingWebsocketRegistry.getStreamingSocket(streamID);

		for await (const part of stream) {
			socket.send(JSON.stringify(part));
		}
	}

	public async createSession(sessionName: string, params: SessionParameters) {
		this.controller.createSession(sessionName, params);
	}
}
