import { SessionParameters } from "../../server/agent/session/sessionController.js";
import { ComlinkClientNetworking } from "./comlinkClientNetworking.js";

export class ComlinkClient {
	constructor(private networking: ComlinkClientNetworking) {}

	public async sendUserPrompt(sessionName: string, prompt: string) {
		const remote = this.networking.remote;
		remote.processUserRequest(sessionName, prompt);
	}

	public async createSession(sesionName: string, params: SessionParameters) {
		await this.networking.remote.createSession(sesionName, params);
	}
}
