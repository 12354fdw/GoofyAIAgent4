import WebSocket from "ws";
import { ComlinkClient } from "./networking/comlinkClient.js";
import { CheckpointDeltaDecoder } from "./networking/checkpointDeltaDecoder.js";
import { ComlinkClientNetworking } from "./networking/comlinkClientNetworking.js";
import { CheckpointEntryTypes } from "../shared/checkpoints/checkpointTypes.js";
import { SessionData } from "../shared/types/sessionData.js";

export class ClientSession {
	private decoder: CheckpointDeltaDecoder;

	public onCheckpointChange: (history: CheckpointEntryTypes[]) => void = () => {};

	private constructor(
		private sessionName: string,
		private rpc: ComlinkClient,
		private sessionData: SessionData,
		streamSocket: WebSocket,
	) {
		this.decoder = new CheckpointDeltaDecoder(streamSocket);

		this.decoder.onChange = (history: CheckpointEntryTypes[], newEntry: CheckpointEntryTypes) => {
			if (newEntry.type === "user") {
				this.sessionData.isPending = true;
				this.sessionData.promptTime = new Date().getTime();
			}

			if (newEntry.type === "finished") {
				this.sessionData.isPending = false;
				this.sessionData.finishTime = new Date().getTime();
			}

			this.sessionData.history = history;
			this.onCheckpointChange(history);
		};
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
