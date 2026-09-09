import WebSocket from "ws";
import { ComlinkClient } from "./networking/comlinkClient.js";
import { CheckpointDeltaDecoder } from "./networking/checkpointDeltaDecoder.js";
import { ComlinkClientNetworking } from "./networking/comlinkClientNetworking.js";
import { CheckpointEntryTypes } from "../shared/checkpoints/checkpointTypes.js";

export class ClientSession {
	private decoder: CheckpointDeltaDecoder;
	public onCheckpointChange: (history: CheckpointEntryTypes[]) => void = () => {};

	private constructor(
		private sessionName: string,
		private rpc: ComlinkClient,
		streamSocket: WebSocket,
	) {
		this.decoder = new CheckpointDeltaDecoder(streamSocket);

		this.decoder.onChange = (history: CheckpointEntryTypes[]) => {
			this.onCheckpointChange(history);
		};
	}

	public static async create(sessionName: string, rpc: ComlinkClient, networking: ComlinkClientNetworking) {
		const streamingSocket = await networking.createCheckpointSocket();
		return new ClientSession(sessionName, rpc, streamingSocket);
	}

	public sendUserPrompt(prompt: string) {
		this.rpc.sendUserPrompt(this.sessionName, prompt);
	}
}
