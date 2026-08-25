import { SessionController } from "../agent/session/sessionController.js";
import { WebSocket } from "ws";

export class ComlinkServerAPI {
	private static instance: ComlinkServerAPI;

	public static getInstance() {
		if (!ComlinkServerAPI.instance) ComlinkServerAPI.instance = new ComlinkServerAPI();
		return ComlinkServerAPI.instance;
	}

	// TODO: delegate this to somewhere else
	private streamingSockets = new Map<string, WebSocket>();
	private pendingStreamingSockets = new Map<string, (socket: WebSocket) => void>();

	public registerStreamingSocket(id: string, socket: WebSocket) {
		this.streamingSockets.set(id, socket);
		const resolve = this.pendingStreamingSockets.get(id);
		if (resolve) {
			resolve(socket);
			this.pendingStreamingSockets.delete(id);
		}
		socket.once("close", () => this.streamingSockets.delete(id));
	}

	private async getStreamingSocket(id: string): Promise<WebSocket> {
		const existing = this.streamingSockets.get(id);
		if (existing) return existing;
		return new Promise((resolve) => {
			this.pendingStreamingSockets.set(id, resolve);
		});
	}

	public async startStreaming(streamID: string, sessionName: string, prompt: string) {
		const stream = SessionController.getInstance().getSession(sessionName).stream(prompt);
		const socket = await this.getStreamingSocket(streamID);

		for await (const part of stream) {
			socket.send(JSON.stringify(part));
		}
	}
}
