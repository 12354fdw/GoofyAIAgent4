import Database from "better-sqlite3";
import path from "path";
import { DATA_DIRECTORY } from "../../shared/globals/index.js";

export class SessionStore {
	private static instance: SessionStore;
	private sessionsDb = new Database(path.join(DATA_DIRECTORY, "sessions.sqlite3"));

	private constructor() {}

	public static getInstance() {
		if (!SessionStore.instance) SessionStore.instance = new SessionStore();
		return SessionStore.instance;
	}
}
