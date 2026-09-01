import { SessionParameters } from "../../../server/agent/session/sessionController.js";
import { CheckpointStore } from "./checkpointStore.js";
import { ComliinkClientNetworking } from "./comlinkClientNetworking.js";

export class ComlinkClient {
	public networking = new ComliinkClientNetworking(4613);
	public checkpointStore = new CheckpointStore();

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
