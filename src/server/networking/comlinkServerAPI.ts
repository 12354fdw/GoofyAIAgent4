import { CheckpointEntryTypes } from "../../shared/checkpoints/checkpointTypes.js";
import { SessionController, SessionParameters } from "../agent/sessionController.js";

export class ComlinkServerAPI {
	private static instance: ComlinkServerAPI;

	public static getInstance() {
		if (!ComlinkServerAPI.instance) ComlinkServerAPI.instance = new ComlinkServerAPI();
		return ComlinkServerAPI.instance;
	}

	private controller = SessionController.getInstance();

	public async processUserRequest(sessionName: string, prompt: string) {
		this.controller.getSession(sessionName).streamCheckpointDeltas(prompt);
	}

	public async createSession(sessionName: string, params: SessionParameters) {
		this.controller.createSession(sessionName, params);
	}

	public async getSessionData(sessionName: string) {
		return this.controller.getSession(sessionName).getSessionData();
	}

	public async appendCheckpoints(sessionName: string, checkpoints: CheckpointEntryTypes[]) {
		const session = this.controller.getSession(sessionName);
		checkpoints.forEach((checkpoint) => session.appendCheckpoint(checkpoint));
	}
}
