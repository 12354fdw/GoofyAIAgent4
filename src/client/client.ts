import WebSocket from "ws";
import { ComlinkClient } from "./networking/comlinkClient.js";
import { ComlinkClientNetworking } from "./networking/comlinkClientNetworking.js";
import { CheckpointDeltaDecoder } from "./networking/checkpointDeltaDecoder.js";
import { ClientSession } from "./clientSession.js";

export class Client {
	private rpc: ComlinkClient;
	private decoder: CheckpointDeltaDecoder;

	private constructor(
		private networking: ComlinkClientNetworking,
		private streamSocket: WebSocket,
	) {
		this.rpc = new ComlinkClient(networking);

		this.decoder = new CheckpointDeltaDecoder(streamSocket);
	}

	public static async create() {
		const networking = new ComlinkClientNetworking(4613);
		await networking.awaitReady();

		const streamSocket = await networking.createCheckpointSocket();

		const instance = new Client(networking, streamSocket);
		return instance;
	}

	public connectToSession(sessionName: string): Promise<ClientSession> {
		return ClientSession.create(sessionName, this.rpc, this.networking);
	}
}
