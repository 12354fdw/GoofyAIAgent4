import { SessionController } from "../agent/session/sessionController.js";

export class ComlinkServerAPI {
	public stream(sessionName: string, prompt: string) {
		return SessionController.getInstance().getSession(sessionName).stream(prompt);
	}
}
