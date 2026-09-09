import { SessionParameters } from "../../server/agent/session/sessionController.js";
import { ComlinkClientNetworking } from "./comlinkClientNetworking.js";

export class ComlinkClient {
	constructor(private networking: ComlinkClientNetworking) {}

	public sendUserPrompt(sessionName: string, prompt: string) {
		this.networking.remote.processUserRequest(sessionName, prompt);
	}

	public async createSession(sesionName: string, params: SessionParameters) {
		await this.networking.remote.createSession(sesionName, params);
	}
}
