import { Remote } from "comlink";
import { SessionParameters } from "../../server/agent/session/sessionController.js";
import { ComlinkServerAPI } from "../../server/networking/comlinkServerAPI.js";
import { ComlinkClientNetworking } from "./comlinkClientNetworking.js";

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
}
