import { Remote } from "comlink";
import { SessionParameters } from "../../server/agent/sessionController.js";
import { ComlinkServerAPI } from "../../server/networking/comlinkServerAPI.js";
import { ComlinkClientNetworking } from "./comlinkClientNetworking.js";
import { CheckpointEntryTypes } from "../../shared/checkpoints/checkpointTypes.js";

export class ComlinkClient {
	private remote: Remote<ComlinkServerAPI>;

	constructor(private networking: ComlinkClientNetworking) {
		this.remote = networking.remote;
	}

	public sendUserPrompt(sessionName: string, prompt: string) {
		this.remote.processUserRequest(sessionName, prompt);
	}

	public async createSession(sesionName: string, params: SessionParameters) {
		await this.remote.createSession(sesionName, params);
	}

	public async getSessionData(sessionName: string) {
		return await this.remote.getSessionData(sessionName);
	}

	public async appendCheckpoints(sessionName: string, checkpoints: CheckpointEntryTypes[]) {
		await this.remote.appendCheckpoints(sessionName, checkpoints);
	}
}
