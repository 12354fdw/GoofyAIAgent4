import WebSocket from "ws";
import { ComlinkClient } from "./networking/comlinkClient.js";
import { CheckpointDeltaDecoder } from "./networking/checkpointDeltaDecoder.js";
import { ComlinkClientNetworking } from "./networking/comlinkClientNetworking.js";
import { CheckpointEntryTypes } from "../shared/checkpoints/checkpointTypes.js";
import { SessionData } from "../shared/types/sessionData.js";
import { Signal } from "../shared/signal.js";

export class ClientSession {
	private decoder: CheckpointDeltaDecoder;

	public readonly onCheckpointChange = new Signal<(history: CheckpointEntryTypes[]) => void>();

	public readonly onPendingChange = new Signal<(isPending: boolean) => void>();

	public getSessionData() {
		return this.sessionData;
	}

	private constructor(
		private sessionName: string,
		private rpc: ComlinkClient,
		private sessionData: SessionData,
		streamSocket: WebSocket,
	) {
		this.decoder = new CheckpointDeltaDecoder(streamSocket, this.sessionData.history, sessionData.usage);

		this.decoder.onChange.connect((history: CheckpointEntryTypes[], newEntry: CheckpointEntryTypes) => {
			if (newEntry.type === "user") {
				sessionData.lastUserPrompt = newEntry.content;
				this.sessionData.isPending = true;
				this.sessionData.promptTime = new Date().getTime();
				this.onPendingChange.fire(true);
			}

			if (newEntry.type === "finished") {
				this.sessionData.isPending = false;
				this.sessionData.finishTime = new Date().getTime();
				this.onPendingChange.fire(false);
			}

			this.onCheckpointChange.fire(history);
		});
	}

	public static async create(sessionName: string, rpc: ComlinkClient, networking: ComlinkClientNetworking) {
		const streamingSocket = await networking.createCheckpointSocket();
		const sessionData = await rpc.getSessionData(sessionName);
		return new ClientSession(sessionName, rpc, sessionData, streamingSocket);
	}

	public sendUserPrompt(prompt: string) {
		this.rpc.sendUserPrompt(this.sessionName, prompt);
	}
}
