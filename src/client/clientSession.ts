import WebSocket from "ws";
import { ComlinkClient } from "./networking/comlinkClient.js";
import { CheckpointDeltaDecoder } from "./networking/checkpointDeltaDecoder.js";
import { ComlinkClientNetworking } from "./networking/comlinkClientNetworking.js";

export class ClientSession {
	private decoder: CheckpointDeltaDecoder;

	private constructor(
		private sessionName: string,
		private rpc: ComlinkClient,
		streamSocket: WebSocket,
	) {
		this.decoder = new CheckpointDeltaDecoder(streamSocket);
	}

	public static async create(sessionName: string, rpc: ComlinkClient, networking: ComlinkClientNetworking) {
		const streamingSocket = await networking.createCheckpointSocket();
		return new ClientSession(sessionName, rpc, streamingSocket);
	}

	public sendUserPrompt(prompt: string) {
		this.rpc.sendUserPrompt(this.sessionName, prompt);
	}
}
