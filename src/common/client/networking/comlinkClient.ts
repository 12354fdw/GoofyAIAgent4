import { SessionParameters } from "../../../server/agent/session/sessionController.js";
import { ClientSession } from "../clientSession.js";
import { ComliinkClientNetworking } from "./comlinkClientNetworking.js";

export class ComlinkClient {
	public networking = new ComliinkClientNetworking(4613);
	public checkpointStore = new ClientSession();

	constructor() {}

	public async awaitReady() {
		return this.networking.awaitReady();
	}

	public async sendUserPrompt(sessionName: string, prompt: string) {
		const remote = this.networking.remote;
		remote.processUserRequest(sessionName, prompt);
	}

	public async createSession(sesionName: string, params: SessionParameters) {
		await this.networking.remote.createSession(sesionName, params);
	}
}
