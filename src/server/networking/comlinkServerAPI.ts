import { SessionController } from "../agent/session/sessionController.js";

export class ComlinkServerAPI {
	private static instance: ComlinkServerAPI;

	public static getInstance() {
		if (!ComlinkServerAPI.instance) ComlinkServerAPI.instance = new ComlinkServerAPI();
		return ComlinkServerAPI.instance;
	}

	public startStreaming(streamID: number, sessionName: string, prompt: string) {
		return SessionController.getInstance().getSession(sessionName).stream(prompt);
	}
}
