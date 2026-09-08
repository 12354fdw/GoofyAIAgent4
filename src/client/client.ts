import WebSocket from "ws";
import { ComlinkClient } from "./networking/comlinkClient.js";
import { ComlinkClientNetworking } from "./networking/comlinkClientNetworking.js";
import { CheckpointDeltaDecoder } from "./networking/checkpointDeltaDecoder.js";
import { CheckpointEntryTypes } from "../shared/checkpoints/checkpointTypes.js";

export class Client {
	private rpc: ComlinkClient;
	private decoder: CheckpointDeltaDecoder;

	private currentSession = "default-session";

	private constructor(
		private networking: ComlinkClientNetworking,
		private streamSocket: WebSocket,
	) {
		this.rpc = new ComlinkClient(networking);

		this.decoder = new CheckpointDeltaDecoder(streamSocket);
	}

	public static async create() {
		const networking = new ComlinkClientNetworking(4613);
		networking.awaitReady();

		const streamSocket = await networking.createCheckpointSocket();

		const instance = new Client(networking, streamSocket);
		return instance;
	}

	public setOnChange(cb: (history: CheckpointEntryTypes[]) => void) {
		this.decoder.onChange = cb;
	}

	public async sendUserPrompt(prompt: string) {
		await this.rpc.sendUserPrompt(this.currentSession, prompt);
	}
}
