import { Session } from "./session.js";

export class SessionController {
	private sessions = new Map<string, Session>();

	constructor() {
		this.createSession("default-session");
	}

	public createSession(key: string) {
		if (this.sessions.get(key)) throw new Error(`Session '${key}' already exists!`);

		const session = new Session("inclusionai/ling-3.0-flash");
		this.sessions.set(key, session);
		return session;
	}

	public getSession(key: string) {
		const session = this.sessions.get(key);
		if (!session) throw new Error(`Unable to find session '${key}'`);
		return session;
	}
}
